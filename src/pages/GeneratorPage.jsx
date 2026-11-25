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
  onDismissError,
  projects,
  onAssignProject,
  onCreateProject,
  onSaveCode,
  onRefine,
  onDelete,
  loading
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

      {/* On wide screens the preview panel shows the error; this banner is for
          narrow screens where the preview sits below the form. */}
      {error && (
        <div className="notice notice-error generator-error-banner" role="alert">
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
          error={error}
          onRetry={() => onGenerate({ ...draft, prompt: draft.prompt.trim() })}
          onDismissError={onDismissError}
          projects={projects}
          onAssignProject={onAssignProject}
          onCreateProject={onCreateProject}
          onSaveCode={onSaveCode}
          onRefine={onRefine}
          onDelete={onDelete}
          loading={loading}
        />
      </div>
    </section>
  );
}

export default GeneratorPage;
