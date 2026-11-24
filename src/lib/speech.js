// Thin wrappers around the browser's built-in Web Speech API.
// Speaking works in all modern browsers; listening (speech-to-text) works in
// Chrome, Edge and Safari, but not Firefox — Pixie falls back to typing there.

const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
const Recognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

export const canSpeak = Boolean(synth && typeof window.SpeechSynthesisUtterance === "function");
export const canListen = Boolean(Recognition);

// Friendly-sounding female English voices, best first. Whatever the device has
// is used; the browser default is the last resort.
const PREFERRED_VOICES = [
  /samantha/i,
  /microsoft (aria|jenny|ava|emma).*natural/i,
  /google uk english female/i,
  /google us english/i,
  /microsoft (aria|jenny|zira)/i,
  /karen|moira|tessa|serena|victoria/i,
  /female/i
];

let cachedVoice = null;

function pickVoice() {
  if (!canSpeak) return null;
  if (cachedVoice) return cachedVoice;
  const voices = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("en"));
  for (const pattern of PREFERRED_VOICES) {
    const match = voices.find((v) => pattern.test(v.name));
    if (match) return (cachedVoice = match);
  }
  return voices[0] || null;
}

// Voices load asynchronously in Chrome; warm the list up early.
if (canSpeak) {
  synth.getVoices();
  synth.addEventListener?.("voiceschanged", () => {
    cachedVoice = null;
    pickVoice();
  });
}

// Chrome stops long utterances after ~15 seconds, so speak sentence by sentence.
function splitSentences(text) {
  return (text.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [text])
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Speaks text aloud. Calls onStart when audio begins, onEnd when finished or
 * stopped, and onError("not-allowed") if the browser blocked sound because the
 * user hasn't clicked anything yet.
 */
export function speak(text, { onStart, onEnd, onError } = {}) {
  if (!canSpeak || !text) {
    onEnd?.();
    return;
  }

  synth.cancel();
  const parts = splitSentences(text);
  const voice = pickVoice();
  let started = false;
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    onEnd?.();
  };

  parts.forEach((part, index) => {
    const utterance = new window.SpeechSynthesisUtterance(part);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || "en-US";
    utterance.rate = 1.02;
    utterance.pitch = 1.08;

    utterance.onstart = () => {
      if (!started) {
        started = true;
        onStart?.();
      }
    };
    utterance.onerror = (event) => {
      // "interrupted"/"canceled" just mean we stopped it ourselves.
      if (event.error === "interrupted" || event.error === "canceled") return finish();
      onError?.(event.error);
      finish();
    };
    if (index === parts.length - 1) utterance.onend = finish;

    synth.speak(utterance);
  });
}

export function pauseSpeech() {
  if (canSpeak && synth.speaking) synth.pause();
}

export function resumeSpeech() {
  if (canSpeak) synth.resume();
}

export function stopSpeech() {
  if (canSpeak) synth.cancel();
}

/**
 * Listens for one spoken question. onInterim shows words as they're heard;
 * onResult gets the final text. Returns a function that stops listening.
 */
export function listen({ onInterim, onResult, onError, onEnd }) {
  if (!canListen) {
    onError?.("not-supported");
    onEnd?.();
    return () => {};
  }

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let finalText = "";

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += transcript;
      else interim += transcript;
    }
    onInterim?.((finalText + interim).trim());
  };
  recognition.onerror = (event) => onError?.(event.error);
  recognition.onend = () => {
    if (finalText.trim()) onResult?.(finalText.trim());
    onEnd?.();
  };

  try {
    recognition.start();
  } catch {
    onError?.("start-failed");
    onEnd?.();
  }

  return () => {
    try {
      recognition.stop();
    } catch {
      // already stopped
    }
  };
}
