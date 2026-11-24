import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed values for the generator options. Anything else is rejected so
// user input can't be smuggled into the system prompt through these fields.
const COMPONENT_TYPES = [
  "Hero Section",
  "Navigation Bar",
  "Feature Cards",
  "Contact Form",
  "Full Website (All Sections)",
  "Pricing Section",
  "Footer"
];
const FRAMEWORKS = ["Bootstrap", "HTML & CSS", "React"];
const DESIGN_STYLES = ["Modern", "Minimal", "Glassmorphism", "Gradient", "Corporate"];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const MAX_PROMPT_LENGTH = 1000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  ...(process.env.FRONTEND_URL || "").split(",").map((url) => url.trim())
].filter(Boolean);

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing. Copy .env.example to .env and add your key.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.8-flash";

// Tried in order when the main model is busy (503), rate-limited (429) or not
// available (404). Override with GEMINI_FALLBACK_MODELS=model-a,model-b
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.6-flash,gemini-3.5-flash-lite")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);
const MODELS = [...new Set([MODEL_NAME, ...FALLBACK_MODELS])];

// Supabase is used only to check that requests come from a signed-in user.
// The same .env works locally for both frontend (VITE_*) and backend.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      })
    : null;

if (!supabase) {
  console.warn(
    "WARNING: SUPABASE_URL / SUPABASE_ANON_KEY are not set, so the API is open to anyone. " +
      "Set them before deploying."
  );
}

// Render, Railway, Vercel etc. sit behind a proxy; this lets the rate limiter
// see the real visitor IP instead of the proxy's.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests with no Origin header (curl, server-to-server) are allowed
      // through CORS, but they still hit the rate limiter below.
      callback(null, !origin || allowedOrigins.includes(origin));
    }
  })
);

app.use(express.json({ limit: "20kb" }));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// "Busy right now" errors worth retrying or moving to another model for.
const isBusy = (error) => [429, 500, 503, 504].includes(error?.status);

/**
 * Calls Gemini, retrying once when a model is busy and then moving on to the
 * fallback models. Errors that another model can't fix (bad key, bad request)
 * are thrown straight away. Returns { response, model }.
 */
async function generateWithFallback(request, label) {
  let lastError;

  for (const model of MODELS) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await ai.models.generateContent({ ...request, model });
        if (model !== MODEL_NAME || attempt > 1) {
          console.log(`${label}: succeeded with ${model} (attempt ${attempt}).`);
        }
        return { response, model };
      } catch (error) {
        lastError = error;
        const status = error?.status;

        if (status === 404) {
          console.warn(`${label}: model "${model}" not found or not available to this key; trying the next one.`);
          break; // next model
        }
        if (!isBusy(error)) throw error; // e.g. 400 bad request, 403 bad key

        console.warn(`${label}: ${model} is busy (${status}), attempt ${attempt}.`);
        if (attempt === 1) await sleep(1200);
      }
    }
  }

  throw lastError;
}

// Explains the most common Gemini failures plainly in the server log, and
// picks a friendly message for the visitor.
function describeGeminiError(error, fallbackMessage) {
  const status = error?.status;
  if (status === 404) {
    console.error(
      `\n>>> None of these Gemini models were found: ${MODELS.join(", ")}. They may be retired ` +
        "or not available to your API key. Set GEMINI_MODEL in .env to a current model " +
        "(see https://ai.google.dev/gemini-api/docs/models) and restart the server.\n"
    );
  } else if (status === 400 || status === 401 || status === 403) {
    console.error("\n>>> Gemini rejected the request. Check that GEMINI_API_KEY in .env is correct and active.\n");
  }

  if (isBusy(error)) {
    return "The AI service is very busy right now. Please try again in a minute.";
  }
  return fallbackMessage;
}

// Rejects requests that don't carry a valid Supabase access token.
async function requireUser(req, res, next) {
  if (!supabase) return next();

  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return res.status(401).json({ success: false, error: "Please sign in to continue." });
  }

  try {
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) throw error || new Error("No user in token");
    req.user = { id: data.claims.sub, email: data.claims.email };
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Your session has expired. Please sign in again."
    });
  }
}

// Limits are per signed-in user (or per IP if auth is off).
function makeLimiter(limit, message) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
    message: { success: false, error: message }
  });
}

const generateLimiter = makeLimiter(
  Number(process.env.RATE_LIMIT_PER_MINUTE) || 10,
  "You're generating too quickly. Please wait a minute and try again."
);

const assistantLimiter = makeLimiter(
  Number(process.env.ASSISTANT_LIMIT_PER_MINUTE) || 20,
  "I need a short breather. Please ask me again in a minute."
);

function pick(value, allowed, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return allowed.includes(value) ? value : null;
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "PixelPilot AI backend is running.", auth: Boolean(supabase) });
});

app.post("/api/generate", requireUser, generateLimiter, async (req, res) => {
  const { prompt, componentType, framework, designStyle, primaryColor } = req.body || {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: "Please provide a component description."
    });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Prompt must not exceed ${MAX_PROMPT_LENGTH} characters.`
    });
  }

  const targetType = pick(componentType, COMPONENT_TYPES, "Hero Section");
  const targetFramework = pick(framework, FRAMEWORKS, "Bootstrap");
  const targetStyle = pick(designStyle, DESIGN_STYLES, "Modern");
  const accentColor =
    primaryColor === undefined || primaryColor === ""
      ? "#7557F6"
      : typeof primaryColor === "string" && HEX_COLOR.test(primaryColor)
        ? primaryColor
        : null;

  if (!targetType || !targetFramework || !targetStyle || !accentColor) {
    return res.status(400).json({
      success: false,
      error: "One of the generator options is invalid. Please refresh and try again."
    });
  }

  const instructions = `You are PixelPilot AI, an expert frontend developer and UI designer.
Generate a complete, responsive, visually polished website component based on the user's description.

DESIGN REQUIREMENTS:
- Interpret the user's actual industry and write authentic, specific copy.
- Use clear visual hierarchy, balanced spacing, and high-contrast accessible typography.
- Use the selected primary brand colour (${accentColor}) consistently for primary buttons, accents, and highlights.
- Ensure responsive behavior across desktop, tablet, and mobile.
- If visuals or illustrations help the component, use clean inline SVG elements (do not use fragile external stock image URLs).

CODE REQUIREMENTS:
- Follow the selected framework (${targetFramework}) faithfully.
- If componentType is "Full Website (All Sections)", generate ONE cohesive, complete webpage containing all 4 core sections in order: (1) Navigation Bar, (2) Hero Section, (3) 3-Card Feature/Listing Grid, and (4) Working Contact Form with confirmation message, plus a clean Footer.
- If framework is "Bootstrap", use Bootstrap 5 classes (navbar, card, btn, form-control, row, col) and include the Bootstrap 5 CSS CDN link plus minimal custom CSS for ${accentColor}.
- If framework is "HTML & CSS", return clean semantic HTML with an embedded <style> tag containing modern responsive CSS3.
- If framework is "React", return a complete functional React component with clean CSS classes.
- Return ONLY the raw code—do NOT wrap the response in Markdown \`\`\` code fences and do NOT include explanations.`;

  try {
    const { response } = await generateWithFallback({
      contents: `USER REQUEST: ${prompt.trim()}
COMPONENT TYPE: ${targetType}
FRAMEWORK: ${targetFramework}
DESIGN STYLE: ${targetStyle}
PRIMARY BRAND COLOUR: ${accentColor}

Generate the complete ${targetType} now.`,
      config: {
        systemInstruction: instructions
      }
    }, "Generate");

    const generatedCode = (response.text || "")
      .trim()
      .replace(/^```[\w-]*\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    if (!generatedCode) {
      throw new Error("The AI returned an empty response.");
    }

    res.json({
      success: true,
      code: generatedCode,
      componentType: targetType,
      framework: targetFramework,
      designStyle: targetStyle,
      primaryColor: accentColor
    });
  } catch (error) {
    // Log the full error for you, but don't leak provider details to visitors.
    console.error("Generation error:", error);
    res.status(502).json({
      success: false,
      error: describeGeminiError(error, "Component generation failed. Please try again in a moment.")
    });
  }
});

// ---------------------------------------------------------------------------
// Pixie, the voice assistant
// ---------------------------------------------------------------------------
const PAGES = [
  "Dashboard",
  "Generate UI",
  "My Projects",
  "Component Library",
  "Saved Components",
  "Settings",
  "Help & Support"
];

const PIXIE_INSTRUCTIONS = `You are Pixie, the friendly voice guide inside PixelPilot AI, a web app made by Omisore Ruth.
Your replies are read aloud, so write the way a warm, upbeat person speaks.

WHAT PIXELPILOT DOES:
- Users describe a website section in plain English and PixelPilot's AI writes the code.
- Component types: Hero Section, Navigation Bar, Feature Cards, Contact Form, Pricing Section, Footer, or a Full Website with all sections.
- Frameworks: Bootstrap 5, plain HTML & CSS, or React. Design styles: Modern, Minimal, Glassmorphism, Gradient, Corporate. Users also pick a brand colour.
- Results show in a live preview with desktop and mobile views, plus a Code tab with a copy button and an HTML (or JSX) download.
- Every result is saved automatically in Saved Components, in this browser. There users tick the sections they want and export them as one index.html, ordered nav, hero, content, contact, footer.
- Component Library has ready-made starter prompts. Settings holds their display name, default framework and whether you greet them on login.
- Tip: better prompts name the business, the audience, the layout and must-have elements. Ctrl+Enter generates.
- React results can't be previewed live yet; they can be copied or downloaded.

PAGES YOU CAN OPEN: ${PAGES.join(", ")}.

RULES:
- Keep replies to 1 to 3 short sentences. No markdown, bullet points, code, emojis or URLs.
- If the user asks to go somewhere or start something, set "navigate" to the matching page and say you're taking them there. Otherwise set it to "none".
- You may answer general web design and frontend questions briefly. For anything unrelated, answer kindly in one sentence and offer to help with PixelPilot.
- Never invent features PixelPilot doesn't have. If unsure, say so and suggest Help & Support.`;

const PIXIE_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    navigate: { type: "string", enum: [...PAGES, "none"] }
  },
  required: ["reply", "navigate"]
};

app.post("/api/assistant", requireUser, assistantLimiter, async (req, res) => {
  const { messages, page, userName } = req.body || {};

  const history = Array.isArray(messages) ? messages.slice(-10) : [];
  const valid = history.every(
    (m) =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.text === "string" &&
      m.text.trim() &&
      m.text.length <= 600
  );

  if (!history.length || !valid || history[history.length - 1].role !== "user") {
    return res.status(400).json({ success: false, error: "Please ask me a question." });
  }

  const currentPage = PAGES.includes(page) ? page : "Dashboard";
  const name =
    typeof userName === "string" ? userName.replace(/[^\p{L}\p{N} '.-]/gu, "").slice(0, 40).trim() : "";

  try {
    const { response } = await generateWithFallback({
      contents: history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text.trim() }]
      })),
      config: {
        systemInstruction: `${PIXIE_INSTRUCTIONS}

CONTEXT: The user is on the "${currentPage}" page.${name ? ` Their name is ${name}.` : ""}`,
        responseMimeType: "application/json",
        responseJsonSchema: PIXIE_SCHEMA,
        temperature: 0.6
      }
    }, "Pixie");

    let parsed;
    try {
      parsed = JSON.parse(response.text || "{}");
    } catch {
      parsed = { reply: (response.text || "").trim(), navigate: "none" };
    }

    const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
    if (!reply) throw new Error("Empty assistant reply");

    res.json({
      success: true,
      reply,
      navigate: PAGES.includes(parsed.navigate) ? parsed.navigate : null
    });
  } catch (error) {
    console.error("Assistant error:", error);
    res.status(502).json({
      success: false,
      error: describeGeminiError(error, "Sorry, I couldn't think of an answer just now. Please try again.")
    });
  }
});

// Malformed JSON bodies and anything else unexpected get a JSON reply,
// so the frontend never has to parse an HTML error page.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: status === 400 ? "The request body was not valid JSON." : "Something went wrong on the server."
  });
});

app.listen(PORT, () => {
  console.log(`PixelPilot backend running at http://localhost:${PORT}`);
  console.log(`Gemini models (in order): ${MODELS.join(" -> ")}`);
});
