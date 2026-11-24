import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  SendHorizontal,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
  X
} from "lucide-react";

import { askPixie } from "../lib/api";
import { canListen, canSpeak, listen, pauseSpeech, resumeSpeech, speak, stopSpeech } from "../lib/speech";
import { readStorage, writeStorage } from "../lib/storage";
import "../styles/Pixie.css";

const MUTE_KEY = "pixelpilot_pixie_muted";

function welcomeText(name) {
  const hello = name ? `Hi ${name}, welcome to PixelPilot!` : "Hi there, welcome to PixelPilot!";
  return `${hello} I'm Pixie, your guide. Just describe the website section you want, like a hero, a pricing table or a contact form, and PixelPilot writes the code for you in Bootstrap, HTML and CSS, or React. You can preview it on desktop and mobile, save it, and export your favourite sections as one ready-to-publish page. Tap the microphone to ask me anything, or press stop and dive right in.`;
}

const SUGGESTIONS = [
  "What can PixelPilot do?",
  "How do I write a good prompt?",
  "Take me to the generator"
];

let nextId = 1;
const makeMessage = (role, text) => ({ id: nextId++, role, text });

function Pixie({ userName = "", page, navigate, welcomeOnMount = false }) {
  const [open, setOpen] = useState(welcomeOnMount);
  const [messages, setMessages] = useState(() =>
    welcomeOnMount ? [makeMessage("assistant", welcomeText(userName))] : []
  );
  const [status, setStatus] = useState("idle"); // idle | speaking | paused
  const [muted, setMuted] = useState(() => readStorage(MUTE_KEY, false));
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");

  const speechId = useRef(0);
  const stopListening = useRef(null);
  const listRef = useRef(null);
  const welcomed = useRef(false);

  const lastReply = [...messages].reverse().find((m) => m.role === "assistant");

  const say = (text) => {
    if (!canSpeak || !text) return;
    const id = ++speechId.current;
    setNotice("");
    speak(text, {
      onStart: () => id === speechId.current && setStatus("speaking"),
      onEnd: () => id === speechId.current && setStatus("idle"),
      onError: (error) => {
        if (id !== speechId.current) return;
        setStatus("idle");
        if (error === "not-allowed") setNotice("Your browser blocked sound. Tap play to hear me.");
      }
    });
  };

  const stop = () => {
    speechId.current += 1;
    stopSpeech();
    setStatus("idle");
  };

  // Speak the welcome once, right after login (the login click allows sound).
  useEffect(() => {
    if (!welcomeOnMount || welcomed.current || muted) return undefined;
    welcomed.current = true;
    const id = ++speechId.current;
    speak(welcomeText(userName), {
      onStart: () => id === speechId.current && setStatus("speaking"),
      onEnd: () => id === speechId.current && setStatus("idle"),
      onError: (error) => {
        if (id === speechId.current && error === "not-allowed") {
          setNotice("Your browser blocked sound. Tap play to hear me.");
        }
      }
    });
    return undefined;
    // Only on first mount; userName/muted at that moment are what we want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop talking and listening when Pixie goes away (e.g. on sign out).
  useEffect(
    () => () => {
      stopSpeech();
      stopListening.current?.();
    },
    []
  );

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const handlePlayPause = () => {
    if (status === "speaking") {
      pauseSpeech();
      setStatus("paused");
    } else if (status === "paused") {
      resumeSpeech();
      setStatus("speaking");
    } else if (lastReply) {
      say(lastReply.text);
    } else {
      const text = welcomeText(userName);
      setMessages([makeMessage("assistant", text)]);
      say(text);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    writeStorage(MUTE_KEY, next);
    if (next) stop();
  };

  const openPanel = () => {
    setOpen(true);
    if (messages.length === 0) {
      const text = welcomeText(userName);
      setMessages([makeMessage("assistant", text)]);
      if (!muted) say(text);
    }
  };

  const closePanel = () => {
    stop();
    stopListening.current?.();
    setOpen(false);
  };

  const ask = async (question) => {
    const text = question.trim();
    if (!text || thinking) return;

    stop();
    setInput("");
    setNotice("");
    const userMessage = makeMessage("user", text);
    const history = [...messages, userMessage];
    setMessages(history);
    setThinking(true);

    // The conversation sent to the AI must start with the user, so skip the
    // welcome message (and any other leading Pixie lines).
    const firstUser = history.findIndex((m) => m.role === "user");
    const payload = history.slice(firstUser).map(({ role, text: t }) => ({ role, text: t.slice(0, 600) }));

    try {
      const data = await askPixie({ messages: payload, page, userName });
      setMessages((prev) => [...prev, makeMessage("assistant", data.reply)]);
      if (!muted) say(data.reply);
      if (data.navigate && data.navigate !== page) navigate(data.navigate);
    } catch (error) {
      const message = error.message || "Sorry, something went wrong. Please try again.";
      setMessages((prev) => [...prev, makeMessage("assistant", message)]);
      if (!muted) say(message);
    } finally {
      setThinking(false);
    }
  };

  const handleMic = () => {
    if (listening) {
      stopListening.current?.();
      return;
    }
    stop();
    setNotice("");
    setListening(true);
    stopListening.current = listen({
      onInterim: (text) => setInput(text),
      onResult: (text) => ask(text),
      onError: (error) => {
        if (error === "not-allowed" || error === "service-not-allowed") {
          setNotice("I need permission to use your microphone. Allow it in your browser, or type instead.");
        } else if (error === "no-speech") {
          setNotice("I didn't catch that. Tap the mic and try again.");
        } else if (error !== "aborted") {
          setNotice("Voice input isn't working right now. You can type your question instead.");
        }
      },
      onEnd: () => {
        setListening(false);
        stopListening.current = null;
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    ask(input);
  };

  const isTalking = status === "speaking";

  return (
    <div className="pixie-root">
      {open && (
        <section className="pixie-panel" aria-label="Pixie voice assistant">
          <header className="pixie-header">
            <div className={`pixie-avatar small ${isTalking ? "talking" : ""}`} aria-hidden="true">
              <Sparkles size={16} />
            </div>
            <div className="pixie-title">
              <strong>Pixie</strong>
              <span>
                {listening
                  ? "Listening..."
                  : thinking
                    ? "Thinking..."
                    : status === "speaking"
                      ? "Speaking"
                      : status === "paused"
                        ? "Paused"
                        : "Your PixelPilot guide"}
              </span>
            </div>

            <div className="pixie-controls">
              {canSpeak && (
                <>
                  <button
                    type="button"
                    onClick={handlePlayPause}
                    aria-label={isTalking ? "Pause Pixie" : status === "paused" ? "Resume Pixie" : "Play Pixie's last message"}
                    title={isTalking ? "Pause" : status === "paused" ? "Resume" : "Play"}
                    disabled={muted}
                  >
                    {isTalking ? <Pause size={15} /> : <Play size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={stop}
                    aria-label="Stop Pixie"
                    title="Stop"
                    disabled={status === "idle"}
                  >
                    <Square size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? "Turn Pixie's voice on" : "Turn Pixie's voice off"}
                    title={muted ? "Voice off" : "Voice on"}
                    aria-pressed={muted}
                  >
                    {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                </>
              )}
              <button type="button" onClick={closePanel} aria-label="Close Pixie" title="Close">
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="pixie-messages" ref={listRef} aria-live="polite">
            {messages.map((m) => (
              <p key={m.id} className={`pixie-bubble ${m.role}`}>
                {m.text}
              </p>
            ))}
            {thinking && (
              <p className="pixie-bubble assistant pixie-typing" aria-label="Pixie is thinking">
                <span />
                <span />
                <span />
              </p>
            )}
            {!thinking && messages.length <= 1 && (
              <div className="pixie-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button type="button" key={s} onClick={() => ask(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {notice && <p className="pixie-notice">{notice}</p>}

          <form className="pixie-input" onSubmit={handleSubmit}>
            {canListen && (
              <button
                type="button"
                className={`pixie-mic ${listening ? "on" : ""}`}
                onClick={handleMic}
                aria-label={listening ? "Stop listening" : "Ask Pixie with your voice"}
                title={listening ? "Stop listening" : "Speak"}
              >
                {listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Ask Pixie anything..."}
              maxLength={600}
              aria-label="Type a question for Pixie"
            />
            <button type="submit" className="pixie-send" disabled={!input.trim() || thinking} aria-label="Send">
              <SendHorizontal size={16} />
            </button>
          </form>
        </section>
      )}

      {!open && (
        <button
          type="button"
          className={`pixie-launcher ${isTalking ? "talking" : ""}`}
          onClick={openPanel}
          aria-label="Talk to Pixie, your PixelPilot assistant"
        >
          <span className="pixie-avatar" aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <span className="pixie-launcher-label">Ask Pixie</span>
        </button>
      )}
    </div>
  );
}

export default Pixie;
