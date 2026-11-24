import {
  Sparkles,
  WandSparkles,
  Layout,
  Code2,
  Palette,
  ChevronDown,
  RotateCcw
} from "lucide-react";

import { COMPONENT_TYPES, DESIGN_STYLES, EXAMPLE_PROMPTS, FRAMEWORKS } from "../data/options";
import { useTypingPlaceholder } from "../hooks/useTypingPlaceholder";
import "../styles/PromptGenerator.css";

function PromptGenerator({ draft, onChange, onReset, onGenerate, isGenerating = false }) {
  const { prompt, componentType, framework, designStyle, primaryColor } = draft;
  const canGenerate = Boolean(prompt.trim()) && !isGenerating;
  // Example ideas type themselves out while the box is empty.
  const { text: typedExample, example } = useTypingPlaceholder(EXAMPLE_PROMPTS, !prompt);

  const handleGenerate = () => {
    if (canGenerate) onGenerate({ ...draft, prompt: prompt.trim() });
  };

  // Ctrl/Cmd + Enter in the prompt box generates straight away.
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleGenerate();
    }
  };

  return (
    <section className="generator-panel">
      <div className="generator-heading">
        <div className="generator-title-icon">
          <WandSparkles size={20} />
        </div>

        <div>
          <h2>AI Component Generator</h2>
          <p>Describe your idea. Let PixelPilot do the building.</p>
        </div>
      </div>

      <div className="generator-form">
        <div className="generator-label-row">
          <label htmlFor="component-prompt">Describe your component</label>
          <span className="optional-label">YOUR PROMPT</span>
        </div>

        <div className="prompt-input-wrapper">
          <textarea
            id="component-prompt"
            value={prompt}
            onChange={(e) => onChange({ prompt: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={`${typedExample}|`}
            rows={5}
            maxLength={1000}
          />

          <div className="prompt-input-footer">
            {prompt ? (
              <span>
                <Sparkles size={13} />
                Be descriptive · Ctrl+Enter to generate
              </span>
            ) : (
              <button
                type="button"
                className="use-example-button"
                onClick={() => onChange({ prompt: example })}
                title={example}
              >
                <Sparkles size={13} />
                Use this example
              </button>
            )}
            <span>{prompt.length}/1000</span>
          </div>
        </div>

        <div className="generator-options">
          <div className="option-field">
            <label htmlFor="component-type">
              <Layout size={15} />
              Component type
            </label>

            <div className="select-wrapper">
              <select
                id="component-type"
                value={componentType}
                onChange={(e) => onChange({ componentType: e.target.value })}
              >
                {COMPONENT_TYPES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="option-field">
            <label htmlFor="framework">
              <Code2 size={15} />
              Framework
            </label>

            <div className="select-wrapper">
              <select
                id="framework"
                value={framework}
                onChange={(e) => onChange({ framework: e.target.value })}
              >
                {FRAMEWORKS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="option-field">
            <label htmlFor="design-style">
              <Palette size={15} />
              Design style
            </label>

            <div className="select-wrapper">
              <select
                id="design-style"
                value={designStyle}
                onChange={(e) => onChange({ designStyle: e.target.value })}
              >
                {DESIGN_STYLES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        <div className="color-picker-row">
          <div>
            <span className="color-picker-title">Primary color</span>
            <p>Choose your component&apos;s accent color.</p>
          </div>

          <label className="color-picker-control">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onChange({ primaryColor: e.target.value })}
              aria-label="Choose primary color"
            />
            <span>{primaryColor.toUpperCase()}</span>
          </label>
        </div>

        <div className="generator-actions">
          <button
            type="button"
            className={`generate-button ${isGenerating ? "is-loading" : ""}`}
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {isGenerating ? (
              <>
                <span className="loading-spinner" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Generate Component
              </>
            )}
          </button>

          <button className="reset-button" onClick={onReset} type="button">
            <RotateCcw size={15} />
            Reset
          </button>
        </div>
      </div>

      <div className="generator-tip">
        <Sparkles size={16} />
        <p>
          <strong>Pro tip:</strong> Include details about layout, colours,
          typography and the purpose of your component.
        </p>
      </div>
    </section>
  );
}

export default PromptGenerator;