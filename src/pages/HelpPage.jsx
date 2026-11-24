import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

function HelpPage({ navigate }) {
  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        HELP &amp; SUPPORT
      </div>

      <AnimatedHeading lead="Getting the most from" highlight="PixelPilot." />

      <div className="glass-card welcome-card page-card wide">
        <h3>Tips for better results</h3>
        <ul className="help-list">
          <li>Name the business and what it sells — the AI writes more specific copy.</li>
          <li>Mention layout (two columns, centred, card grid) and any must-have elements.</li>
          <li>Generate each section separately, then tick the ones you like in Saved Components and export them as one page.</li>
          <li>Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> in the prompt box to generate.</li>
        </ul>

        <h3>Talking to Pixie</h3>
        <p>
          Tap <strong>Ask Pixie</strong> in the bottom-right corner. Use the microphone to speak
          (Chrome, Edge or Safari) or type your question. The play, pause and stop buttons control
          her voice, and the speaker button turns it off. You can switch off her sign-in greeting in
          Settings.
        </p>

        <h3>Where is my work saved?</h3>
        <p>
          Your account is saved online, but generated components are stored in this browser for
          your account only. Clearing your browser data or switching devices will remove them, so
          export anything you want to keep.
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
