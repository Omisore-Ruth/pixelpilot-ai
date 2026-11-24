import { Sparkles, X } from "lucide-react";

import PromptGenerator from "../components/PromptGenerator";
import PreviewPanel from "../components/PreviewPanel";
import AnimatedHeading from "../components/AnimatedHeading";

function GeneratorPage({
  draft,
  onDraftChange,
  onReset,
  onGenerate,
  isGenerating,
  generated,
  error,
  onDismissError
}) {
  return (
    <section className="generator-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        PIXELPILOT AI GENERATOR
      </div>

      <AnimatedHeading lead="Turn your ideas into" highlight="interfaces." />

      <p className="dashboard-description">
        Describe the component you want. Choose your preferred framework and design style, then
        generate your preview.
      </p>

      {error && (
        <div className="notice notice-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={onDismissError} aria-label="Dismiss error">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="generator-layout">
        <PromptGenerator
          draft={draft}
          onChange={onDraftChange}
          onReset={onReset}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
        />
        {/* key resets the Preview/Code tab and device toggle for each new result */}
        <PreviewPanel
          key={generated?.id ?? "empty"}
          generated={generated}
          isGenerating={isGenerating}
          pending={draft}
        />
      </div>
    </section>
  );
}

export default GeneratorPage;
