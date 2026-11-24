import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { FRAMEWORKS } from "../data/options";
import { friendlyAuthError } from "../lib/supabase";

function SettingsPage({
  userName,
  email,
  onSaveName,
  framework,
  onFrameworkChange,
  pixieWelcome,
  onPixieWelcomeChange,
  navigate
}) {
  const [name, setName] = useState(userName);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: "ok" | "error", text }

  const nameChanged = name.trim() !== userName;

  const handleSave = async (event) => {
    event.preventDefault();
    if (!nameChanged || saving) return;
    setSaving(true);
    setStatus(null);
    try {
      await onSaveName(name);
      setStatus({ type: "ok", text: "Name saved." });
    } catch (error) {
      setStatus({ type: "error", text: friendlyAuthError(error) });
    } finally {
      setSaving(false);
    }
  };

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
        <h3>Your Account</h3>
        <p>Signed in as {email}.</p>

        <form className="form-stack" onSubmit={handleSave}>
          <label className="form-field">
            Your Name
            <input
              type="text"
              value={name}
              maxLength={40}
              placeholder="e.g. Ruth"
              onChange={(e) => {
                setName(e.target.value);
                setStatus(null);
              }}
            />
          </label>
          <div className="button-row">
            <button type="submit" className="secondary-button" disabled={!nameChanged || saving}>
              {status?.type === "ok" && !nameChanged ? <Check size={14} /> : null}
              {saving ? "Saving..." : status?.type === "ok" && !nameChanged ? "Saved" : "Save Name"}
            </button>
          </div>
          {status?.type === "error" && (
            <div className="notice notice-error" role="alert">
              <span>{status.text}</span>
            </div>
          )}
        </form>

        <h3 className="settings-subheading">Preferences</h3>
        <p>Saved in this browser.</p>

        <div className="form-stack">
          <label className="form-field">
            Default Styling Framework
            <select value={framework} onChange={(e) => onFrameworkChange(e.target.value)}>
              {FRAMEWORKS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="toggle-field">
            <input
              type="checkbox"
              checked={pixieWelcome}
              onChange={(e) => onPixieWelcomeChange(e.target.checked)}
            />
            <span>
              <strong>Pixie welcome on sign-in</strong>
              Pixie greets you out loud each time you sign in.
            </span>
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
