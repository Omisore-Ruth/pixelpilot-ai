import { useState } from "react";

import { normalizeColor } from "../lib/color";

// Quick picks so users don't have to know hex codes.
const PRESETS = ["#7557F6", "#2563EB", "#0D9488", "#16A34A", "#C2410C", "#DC2626", "#DB2777", "#111827"];

function ColorField({ value, onChange }) {
  const [text, setText] = useState(value.toUpperCase());
  const [lastValue, setLastValue] = useState(value);

  // Keep the text box in step when the colour changes from the swatch or a preset.
  if (value !== lastValue) {
    setLastValue(value);
    setText(value.toUpperCase());
  }

  const valid = normalizeColor(text) !== null;

  const commit = (next) => {
    const color = normalizeColor(next);
    if (color) onChange(color);
  };

  return (
    <div className="color-field">
      <div className="color-field-row">
        <label className="color-swatch" title="Pick a colour">
          <input
            type="color"
            value={value.toLowerCase()}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            aria-label="Pick a colour"
          />
        </label>
        <input
          type="text"
          className={`color-hex-input ${valid ? "" : "invalid"}`}
          value={text}
          maxLength={24}
          spellCheck={false}
          aria-label="Colour code"
          aria-invalid={!valid}
          placeholder="#C2410C"
          onChange={(e) => {
            setText(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => {
            // Tidy up to the saved colour (e.g. "c41" becomes "#CC4411").
            setText(value.toUpperCase());
          }}
        />
      </div>

      {!valid && <p className="color-hint">Use a hex code like #C2410C</p>}

      <div className="color-presets" role="group" aria-label="Suggested colours">
        {PRESETS.map((preset) => (
          <button
            type="button"
            key={preset}
            className={`color-preset ${preset === value.toUpperCase() ? "selected" : ""}`}
            style={{ background: preset }}
            onClick={() => onChange(preset)}
            aria-label={`Use ${preset}`}
            title={preset}
          />
        ))}
      </div>
    </div>
  );
}

export default ColorField;
