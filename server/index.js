import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";

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

const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_PER_MINUTE) || 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: "You're generating too quickly. Please wait a minute and try again."
  }
});

function pick(value, allowed, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  return allowed.includes(value) ? value : null;
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "PixelPilot AI backend is running." });
});

app.post("/api/generate", generateLimiter, async (req, res) => {
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
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `USER REQUEST: ${prompt.trim()}
COMPONENT TYPE: ${targetType}
FRAMEWORK: ${targetFramework}
DESIGN STYLE: ${targetStyle}
PRIMARY BRAND COLOUR: ${accentColor}

Generate the complete ${targetType} now.`,
      config: {
        systemInstruction: instructions
      }
    });

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
      error: "Component generation failed. Please try again in a moment."
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
});
