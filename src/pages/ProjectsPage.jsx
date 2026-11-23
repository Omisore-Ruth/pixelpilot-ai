import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

function ProjectsPage({ savedCount, userName, framework, navigate }) {
  const lines = [
    "AI-assisted component workspace active",
    `${savedCount} reusable ${savedCount === 1 ? "component" : "components"} in your library`,
    "Responsive Bootstrap 5 & custom CSS3 styling modes",
    "Pick-and-export a standalone index.html for static hosting",
    `Defaults set for ${userName || "you"} (${framework})`
  ];

  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        PROJECT BUILDER
      </div>

      <h1>
        PixelPilot AI
        <span className="gradient-text"> project bundle.</span>
      </h1>

      <div className="glass-card welcome-card page-card wide">
        <h3>Workspace Summary</h3>
        <ul className="checklist">
          {lines.map((line) => (
            <li key={line}>
              <CheckCircle2 size={16} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <button type="button" className="primary-button" onClick={() => navigate("Saved Components")}>
          Choose Sections &amp; Export
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

export default ProjectsPage;
