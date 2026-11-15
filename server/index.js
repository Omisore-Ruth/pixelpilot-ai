import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS"));
      }
    }
  })
);

app.use(express.json({ limit: "1mb" }));

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing from .env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "PixelPilot AI backend is running." });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, componentType, framework, designStyle, primaryColor } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide a component description."
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        error: "Prompt must not exceed 1000 characters."
      });
    }

    const targetType = componentType || "Hero Section";
    const targetFramework = framework || "Bootstrap";
    const targetStyle = designStyle || "Modern";
    const accentColor = primaryColor || "#7557F6";

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
      .replace(/^```[\w-]*\n?/i, "")
      .replace(/```$/i, "")
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
    console.error("Generation error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Component generation failed. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`PixelPilot backend running at http://localhost:${PORT}`);
});