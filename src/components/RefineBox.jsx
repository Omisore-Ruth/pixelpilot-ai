import { useState } from "react";
import { WandSparkles } from "lucide-react";

const SUGGESTIONS = ["Make the headline bigger", "Add a phone number", "Make the buttons rounder"];

// "Refine with AI": describe a change and the existing design is updated.
function RefineBox({ onRefine, disabled = false }) {
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (text) => {
    const clean = text.trim();
    if (!clean || busy) return;
    setBusy(true);
    setError("");
    try {
      await onRefine(clean);
      setInstruction("");
    } catch (err) {
      setError(err?.message || "Couldn't apply that change. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`refine-box ${busy ? "is-busy" : ""}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(instruction);
        }}
      >
        <WandSparkles size={16} className="refine-icon" aria-hidden="true" />
        <input
          type="text"
          value={instruction}
          maxLength={500}
          disabled={busy || disabled}
          placeholder={busy ? "Applying your change..." : "Refine with AI, e.g. make the headline bigger"}
          onChange={(e) => setInstruction(e.target.value)}
          aria-label="Describe a change to this component"
        />
        <button type="submit" disabled={!instruction.trim() || busy || disabled}>
          {busy ? <span className="refine-spinner" /> : null}
          {busy ? "Refining" : "Refine"}
        </button>
      </form>

      {!busy && !instruction && (
        <div className="refine-suggestions">
          {SUGGESTIONS.map((s) => (
            <button type="button" key={s} onClick={() => setInstruction(s)} disabled={disabled}>
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="refine-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default RefineBox;
