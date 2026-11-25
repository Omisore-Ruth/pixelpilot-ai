// Vercel serverless entry point: every /api/* request is handled by the same
// Express app that runs locally (see vercel.json for the routing).
import app from "../server/app.js";

export default app;
