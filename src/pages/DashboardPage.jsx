import { ArrowRight, Sparkles } from "lucide-react";
import AnimatedHeading from "../components/AnimatedHeading";

function DashboardPage({ userName, framework, savedCount, navigate }) {
  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        YOUR AI FRONTEND WORKSPACE
      </div>

      <AnimatedHeading lead="Build something" highlight="extraordinary." />

      <p className="dashboard-description">
        Describe your ideas, generate frontend components and bring your designs to life with
        PixelPilot AI.
      </p>

      <div className="glass-card welcome-card">
        <h3>{userName ? `Welcome back, ${userName}` : "Welcome to PixelPilot"}</h3>
        <p>
          Your workspace is set up for {framework}. You have {savedCount} saved{" "}
          {savedCount === 1 ? "component" : "components"} ready for preview and HTML export.
          {!userName && " Add your name in Settings to personalise your workspace."}
        </p>

        <div className="button-row">
          <button type="button" className="primary-button" onClick={() => navigate("Generate UI")}>
            Start Generating
            <ArrowRight size={17} />
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate("Saved Components")}>
            View Saved Library ({savedCount})
          </button>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
