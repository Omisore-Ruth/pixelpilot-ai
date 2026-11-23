const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const REQUEST_TIMEOUT_MS = 90_000;

export async function generateComponent(settings) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
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
      throw new Error("You're generating too quickly. Please wait a minute and try again.");
    }
    throw new Error(`The server returned an error (${response.status}). Please try again.`);
  }

  return data;
}
