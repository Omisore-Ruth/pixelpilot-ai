import { getAccessToken } from "./supabase";

// Locally the backend runs on port 5000. When deployed (e.g. on Vercel) the
// backend lives on the same site under /api, so no address is needed.
const API_BASE = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:5000" : "")).replace(
  /\/$/,
  ""
);

const REQUEST_TIMEOUT_MS = 90_000;

async function postJson(path, payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const token = await getAccessToken();

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request took too long. Please try again.", { cause: error });
    }
    throw new Error(
      "Can't reach the PixelPilot server. If it's hosted on a free plan it may be waking up — wait 30 seconds and try again.",
      { cause: error }
    );
  } finally {
    clearTimeout(timer);
  }

  // The server always replies with JSON, but a proxy or host error page may not.
  let data = null;
  try {
    data = await response.json();
  } catch {
    // fall through to the status-based messages below
  }

  if (!response.ok || !data?.success) {
    if (data?.error) throw new Error(data.error);
    if (response.status === 429) {
      throw new Error("You're going too quickly. Please wait a minute and try again.");
    }
    throw new Error(`The server returned an error (${response.status}). Please try again.`);
  }

  return data;
}

export function generateComponent(settings) {
  return postJson("/api/generate", settings);
}

export function askPixie({ messages, page, userName }) {
  return postJson("/api/assistant", { messages, page, userName });
}

export function refineComponent({ code, instruction, framework, componentType, primaryColor }) {
  return postJson("/api/refine", { code, instruction, framework, componentType, primaryColor });
}
