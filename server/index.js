// Runs the backend on your computer (npm run server).
// On Vercel, api/index.js uses the same app as a serverless function instead.
import app, { MODELS, hasGeminiKey } from "./app.js";

const PORT = process.env.PORT || 5000;

if (!hasGeminiKey) process.exit(1);

// Express 5 passes startup errors to this callback instead of throwing, so
// check for them; otherwise a blocked port looks like a successful start.
app.listen(PORT, (error) => {
  if (error) {
    if (error.code === "EADDRINUSE") {
      console.error(
        `\n>>> Port ${PORT} is already in use, so this backend could NOT start.\n` +
          "    Another copy of the PixelPilot server is probably still running in another terminal.\n" +
          "    Close it (Ctrl + C there, or 'Kill All Terminals' in VS Code) and run npm run server again.\n"
      );
    } else {
      console.error("Server failed to start:", error);
    }
    process.exit(1);
  }
  console.log(`PixelPilot backend running at http://localhost:${PORT}`);
  console.log(`Gemini models (in order): ${MODELS.join(" -> ")}`);
});
