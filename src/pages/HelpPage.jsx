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

        <h3>Changing a design</h3>
        <p>
          Under any result, type a change into <strong>Refine with AI</strong> (for example &quot;make
          the headline bigger&quot;) and it updates the existing design. Press <strong>Undo</strong> in
          the pop-up if you don&apos;t like it. For small tweaks, open the <strong>Code</strong> tab and
          click <strong>Edit</strong>.
        </p>

        <h3>Projects</h3>
        <p>
          Use <strong>Add to project</strong> under a result to group sections into a website. In
          <strong> My Projects</strong> you can reorder sections, remove them, rename or delete the
          project, and export it as one page.
        </p>

        <h3>Talking to Pixie</h3>
        <p>
          Tap <strong>Ask Pixie</strong> in the bottom-right corner. Use the microphone to speak
          (Chrome, Edge or Safari) or type your question. The play, pause and stop buttons control
          her voice, and the speaker button turns it off. You can switch off her sign-in greeting in
          Settings.
        </p>

        <h3>Where is my work saved?</h3>
        <p>
          Everything you generate is saved to your account, along with your projects, so it&apos;s
          there when you sign in on another device.
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
