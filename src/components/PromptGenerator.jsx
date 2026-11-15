import { useEffect, useState } from "react";
import {
  Sparkles,
  WandSparkles,
  Layout,
  Code2,
  Palette,
  ChevronDown,
  RotateCcw
} from "lucide-react";

import "../styles/PromptGenerator.css";

function PromptGenerator({
  onGenerate,
  isGenerating = false,
  defaultFramework = "Bootstrap",
  prefill = null
}) {
  const [prompt, setPrompt] = useState(
    prefill?.prompt ??
      "Create a responsive hero section for a modern botanical skincare studio with headline, product highlight, and call-to-action button."
  );
  const [componentType, setComponentType] = useState(
    prefill?.componentType ?? "Hero Section"
  );
  const [framework, setFramework] = useState(
    prefill?.framework ?? defaultFramework
  );
  const [designStyle, setDesignStyle] = useState(
    prefill?.designStyle ?? "Modern"
  );
  const [primaryColor, setPrimaryColor] = useState(
    prefill?.primaryColor ?? "#7557F6"
  );

  useEffect(() => {
    setFramework(defaultFramework);
  }, [defaultFramework]);

  useEffect(() => {
    if (!prefill) return;
    if (prefill.prompt !== undefined) setPrompt(prefill.prompt);
    if (prefill.componentType) setComponentType(prefill.componentType);
    if (prefill.framework) setFramework(prefill.framework);
    if (prefill.designStyle) setDesignStyle(prefill.designStyle);
    if (prefill.primaryColor) setPrimaryColor(prefill.primaryColor);
  }, [prefill]);

  const handleGenerate = () => {
    if (!prompt.trim() || isGenerating) return;

    onGenerate({
      prompt,
      componentType,
      framework,
      designStyle,
      primaryColor
    });
  };

  const handleReset = () => {
    setPrompt("");
    setComponentType("Hero Section");
    setFramework(defaultFramework);
    setDesignStyle("Modern");
    setPrimaryColor("#7557F6");
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
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. Create a modern hero section for a skincare brand with a large headline, short description and a call-to-action button..."
            rows={5}
            maxLength={1000}
          />

          <div className="prompt-input-footer">
            <span>
              <Sparkles size={13} />
              Be descriptive for better results
            </span>
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
                onChange={(e) => setComponentType(e.target.value)}
              >
                <option>Hero Section</option>
                <option>Navigation Bar</option>
                <option>Feature Cards</option>
                <option>Contact Form</option>
                <option>Full Website (All Sections)</option>
                <option>Pricing Section</option>
                <option>Footer</option>
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
                onChange={(e) => setFramework(e.target.value)}
              >
                <option>Bootstrap</option>
                <option>HTML &amp; CSS</option>
                <option>React</option>
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
                onChange={(e) => setDesignStyle(e.target.value)}
              >
                <option>Modern</option>
                <option>Minimal</option>
                <option>Glassmorphism</option>
                <option>Gradient</option>
                <option>Corporate</option>
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
              onChange={(e) => setPrimaryColor(e.target.value)}
              aria-label="Choose primary color"
            />
            <span>{primaryColor.toUpperCase()}</span>
          </label>
        </div>

        <div className="generator-actions">
          <button
            type="button"
            className="generate-button"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
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

          <button className="reset-button" onClick={handleReset} type="button">
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