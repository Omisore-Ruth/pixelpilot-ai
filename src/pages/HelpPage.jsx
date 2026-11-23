import { ArrowRight, Sparkles } from "lucide-react";

function HelpPage({ navigate }) {
  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        HELP &amp; SUPPORT
      </div>

      <h1>
        Getting the most from
        <span className="gradient-text"> PixelPilot.</span>
      </h1>

      <div className="glass-card welcome-card page-card wide">
        <h3>Tips for better results</h3>
        <ul className="help-list">
          <li>Name the business and what it sells — the AI writes more specific copy.</li>
          <li>Mention layout (two columns, centred, card grid) and any must-have elements.</li>
          <li>Generate each section separately, then tick the ones you like in Saved Components and export them as one page.</li>
          <li>Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> in the prompt box to generate.</li>
        </ul>

        <h3>Where is my work saved?</h3>
        <p>
          Generated components are stored in this browser only. Clearing your browser data or
          switching devices will remove them, so export anything you want to keep.
        </p>

        <button type="button" className="primary-button" onClick={() => navigate("Generate UI")}>
          Back to Generator
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

export default HelpPage;
