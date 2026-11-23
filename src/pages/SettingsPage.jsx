import { ArrowRight, Sparkles } from "lucide-react";

import { FRAMEWORKS } from "../data/options";

function SettingsPage({ userName, onUserNameChange, framework, onFrameworkChange, navigate }) {
  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        PERSONALIZATION
      </div>

      <h1>
        Tailor your
        <span className="gradient-text"> workspace.</span>
      </h1>

      <div className="glass-card welcome-card page-card narrow">
        <h3>User Preferences</h3>
        <p>Saved automatically in this browser.</p>

        <div className="form-stack">
          <label className="form-field">
            Your Name
            <input
              type="text"
              value={userName}
              maxLength={40}
              placeholder="e.g. Ruth"
              onChange={(e) => onUserNameChange(e.target.value)}
            />
          </label>

          <label className="form-field">
            Default Styling Framework
            <select value={framework} onChange={(e) => onFrameworkChange(e.target.value)}>
              {FRAMEWORKS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <button type="button" className="primary-button" onClick={() => navigate("Generate UI")}>
          Open Generator
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}

export default SettingsPage;
