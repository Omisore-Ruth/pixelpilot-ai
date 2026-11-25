import { useEffect, useState } from "react";
import {
  Sparkles,
  Monitor,
  Smartphone,
  Copy,
  Check,
  Code2,
  Eye,
  Download,
  AlertTriangle,
  RotateCcw,
  Maximize2,
  Pencil,
  Save,
  Trash2,
  X as XIcon
} from "lucide-react";
import FullscreenPreview from "./FullscreenPreview";
import ProjectPicker from "./ProjectPicker";
import RefineBox from "./RefineBox";

import { buildPreviewDocument, downloadHtmlFile, isPreviewable, slugify } from "../lib/preview";
import "../styles/PreviewPanel.css";

function buildSteps({ componentType, framework, primaryColor }) {
  return [
    "Reading your brief...",
    `Planning the ${(componentType || "component").toLowerCase()} layout...`,
    `Applying your colour ${(primaryColor || "").toUpperCase()}...`,
    `Writing ${framework || "the"} code...`,
    "Making it look good on mobile...",
    "Polishing the final details..."
  ];
}

// Shown in place of the preview while the AI is working: a wireframe that
// shimmers in the chosen colour, plus a status line that moves through steps.
function GeneratingState({ pending }) {
  const steps = buildSteps(pending || {});
  const [step, setStep] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => setStep((n) => Math.min(n + 1, steps.length - 1)), 2600);
    const clock = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => {
      clearInterval(stepTimer);
      clearInterval(clock);
    };
  }, [steps.length]);

  return (
    <section className="preview-panel" aria-busy="true">
      <div className="preview-header">
        <div>
          <h2>Building your component</h2>
          <p>This usually takes 10–30 seconds.</p>
        </div>
        <span className="generated-status generating-status">
          <span />
          Generating
        </span>
      </div>

      <div className="building-stage" style={{ "--accent": pending?.primaryColor || "#7557F6" }}>
        <div className="building-frame" aria-hidden="true">
          <div className="bf-nav">
            <i className="bf-logo" />
            <i />
            <i />
            <i />
            <i className="bf-pill" />
          </div>
          <div className="bf-hero">
            <i className="bf-title" />
            <i className="bf-title short" />
            <i className="bf-text" />
            <i className="bf-text shorter" />
            <i className="bf-button" />
          </div>
          <div className="bf-cards">
            <i />
            <i />
            <i />
          </div>
        </div>

        <p className="building-step" role="status" key={step}>
          <span className="building-dot" />
          {steps[step]}
        </p>
        <p className="building-time">{seconds}s</p>
      </div>
    </section>
  );
}

// Shown when the last attempt failed, so the old preview isn't mistaken
// for the new result.
function FailedState({ message, onRetry, onDismiss, hasPrevious }) {
  return (
    <section className="preview-panel">
      <div className="preview-header">
        <div>
          <h2>Generation failed</h2>
          <p>Nothing was created this time.</p>
        </div>
        <span className="generated-status failed-status">
          <span />
          Failed
        </span>
      </div>

      <div className="preview-empty failed-body">
        <div className="preview-empty-icon failed-icon">
          <AlertTriangle size={26} />
        </div>
        <h3>That didn&apos;t work</h3>
        <p>{message}</p>
        <div className="button-row failed-actions">
          <button type="button" className="primary-button" onClick={onRetry}>
            <RotateCcw size={15} />
            Try again
          </button>
          {hasPrevious && (
            <button type="button" className="secondary-button" onClick={onDismiss}>
              Show last result
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function PreviewPanel({
  generated,
  isGenerating = false,
  pending = null,
  error = "",
  onRetry,
  onDismissError,
  projects = [],
  onAssignProject,
  onCreateProject,
  onSaveCode,
  onRefine,
  onDelete
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [codeDraft, setCodeDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [device, setDevice] = useState("desktop");
  const [fullscreen, setFullscreen] = useState(false);

  if (isGenerating) return <GeneratingState pending={pending} />;

  if (error) {
    return (
      <FailedState
        message={error}
        onRetry={onRetry}
        onDismiss={onDismissError}
        hasPrevious={Boolean(generated)}
      />
    );
  }

  if (!generated) {
    return (
      <section className="preview-panel">
        <div className="preview-header">
          <div>
            <h2>Live Preview</h2>
            <p>Your generated component will appear here.</p>
          </div>
        </div>

        <div className="preview-empty">
          <div className="preview-empty-icon">
            <Sparkles size={28} />
          </div>
          <h3>Your canvas is ready</h3>
          <p>
            Describe your component and click Generate Component to see your
            live visual preview and source code.
          </p>
        </div>
      </section>
    );
  }

  const isHtmlPreviewable = isPreviewable(generated);
  const isReact = generated.framework?.toLowerCase().includes("react");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generated.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleDownload = () => {
    const slug = slugify(generated.componentType);
    if (isReact) {
      const blob = new Blob([generated.code || ""], { type: "text/javascript;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slug}.jsx`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    downloadHtmlFile(`${slug}.html`, buildPreviewDocument(generated.code, generated.framework, generated.componentType));
  };

  const startEditing = () => {
    setCodeDraft(generated.code || "");
    setSaveError("");
    setEditing(true);
    setActiveTab("code");
  };

  const handleSaveCode = async () => {
    setSaving(true);
    setSaveError("");
    try {
      await onSaveCode(codeDraft);
      setEditing(false);
    } catch (err) {
      setSaveError(err?.message ? `Couldn't save: ${err.message}` : "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <section className="preview-panel">
      <div className="preview-header">
        <div>
          <h2>Generated Component</h2>
          <p>Switch between live visual preview and copyable source code.</p>
        </div>

        <span className="generated-status">
          <span />
          Generated
        </span>
      </div>

      <div className="preview-toolbar">
        <div className="preview-tabs">
          {isHtmlPreviewable && (
            <button
              type="button"
              className={`preview-tab ${activeTab === "preview" ? "active" : ""}`}
              onClick={() => setActiveTab("preview")}
            >
              <Eye size={14} />
              Preview
            </button>
          )}
          <button
            type="button"
            className={`preview-tab ${
              activeTab === "code" || !isHtmlPreviewable ? "active" : ""
            }`}
            onClick={() => setActiveTab("code")}
          >
            <Code2 size={14} />
            Code
          </button>
        </div>

        <div className="preview-tools">
          {isHtmlPreviewable && activeTab === "preview" && (
            <>
              <button
                type="button"
                className={`device-button ${device === "desktop" ? "selected" : ""}`}
                onClick={() => setDevice("desktop")}
                aria-label="Desktop view"
              >
                <Monitor size={14} />
              </button>
              <button
                type="button"
                className={`device-button ${device === "mobile" ? "selected" : ""}`}
                onClick={() => setDevice("mobile")}
                aria-label="Mobile view"
              >
                <Smartphone size={14} />
              </button>
              <button
                type="button"
                className="device-button"
                onClick={() => setFullscreen(true)}
                aria-label="Open full-screen preview"
                title="Full screen"
              >
                <Maximize2 size={14} />
              </button>
            </>
          )}

          <button
            type="button"
            className="device-button"
            onClick={handleDownload}
            aria-label={`Download as ${isReact ? "JSX" : "HTML"} file`}
          >
            <Download size={14} />
            {isReact ? "JSX" : "HTML"}
          </button>
        </div>
      </div>

      {isHtmlPreviewable && activeTab === "preview" ? (
        <div className={`preview-stage ${device === "mobile" ? "mobile-stage" : ""}`}>
          <div className="preview-canvas">
            <div className="canvas-meta">
              <span>{generated.componentType}</span>
              <span>
                {generated.framework} · {generated.designStyle}
              </span>
            </div>
            <iframe
              title="Generated component live preview"
              srcDoc={buildPreviewDocument(generated.code, generated.framework)}
              sandbox="allow-scripts allow-forms"
              style={{
                width: "100%",
                minHeight: "420px",
                border: "none",
                borderRadius: "10px",
                background: "#ffffff"
              }}
            />
          </div>
        </div>
      ) : (
        <div className="code-stage">
          <div className="code-heading">
            <span>
              {generated.framework} Source Code{editing ? " · editing" : ""}
            </span>
            {editing ? (
              <div className="code-actions">
                <button type="button" onClick={handleSaveCode} disabled={saving || !codeDraft.trim()}>
                  <Save size={13} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setEditing(false)} disabled={saving}>
                  <XIcon size={13} />
                  Cancel
                </button>
              </div>
            ) : (
              <div className="code-actions">
                {onSaveCode && (
                  <button type="button" onClick={startEditing}>
                    <Pencil size={13} />
                    Edit
                  </button>
                )}
                <button type="button" onClick={handleCopy}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
            )}
          </div>
          {editing ? (
            <textarea
              className="code-editor"
              value={codeDraft}
              onChange={(e) => setCodeDraft(e.target.value)}
              spellCheck={false}
              aria-label="Edit component code"
            />
          ) : (
            <pre>
              <code>{generated.code || "No code was returned."}</code>
            </pre>
          )}
          {saveError && (
            <p className="code-error" role="alert">
              {saveError}
            </p>
          )}
        </div>
      )}

      {onRefine && <RefineBox onRefine={onRefine} disabled={editing} />}

      <div className="preview-actions">
        {onAssignProject && (
          <ProjectPicker
            projects={projects}
            projectId={generated.projectId}
            onAssign={onAssignProject}
            onCreate={onCreateProject}
          />
        )}

        {onDelete && (
          <div className="delete-control">
            {confirmDelete ? (
              <>
                <span>Delete this component?</span>
                <button type="button" className="danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting}>
                  Keep
                </button>
              </>
            ) : (
              <button
                type="button"
                className="delete-trigger"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete this component"
                title="Delete"
              >
                <Trash2 size={14} />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {fullscreen && isHtmlPreviewable && (
        <FullscreenPreview
          title={generated.componentType}
          subtitle={`${generated.framework} · ${generated.designStyle} · ${generated.primaryColor}`}
          html={buildPreviewDocument(generated.code, generated.framework, generated.componentType)}
          onClose={() => setFullscreen(false)}
        />
      )}
    </section>
  );
}

export default PreviewPanel;