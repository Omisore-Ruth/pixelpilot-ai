import { ArrowRight, Sparkles } from "lucide-react";

import { LIBRARY_PRESETS } from "../data/starters";
import AnimatedHeading from "../components/AnimatedHeading";

function ComponentLibraryPage({ onUsePreset }) {
  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        COMPONENT PRESETS
      </div>

      <AnimatedHeading lead="Starter prompts for" highlight="every section." />

      <p className="dashboard-description">
        Pick any core section below to pre-fill the AI generator with clean CSS or Bootstrap
        instructions.
      </p>

      <div className="component-grid">
        {LIBRARY_PRESETS.map((preset) => (
          <div className="glass-card welcome-card" key={preset.componentType}>
            <div>
              <h3>{preset.componentType}</h3>
              <p>
                {preset.framework} · {preset.designStyle}
              </p>
              <p className="card-prompt">{preset.prompt}</p>
            </div>
            <button
              type="button"
              className="primary-button align-start"
              onClick={() => onUsePreset(preset)}
            >
              Use This Prompt
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ComponentLibraryPage;
