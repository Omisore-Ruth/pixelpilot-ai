import { useState } from "react";
import {
  Sparkles,
  Monitor,
  Smartphone,
  Copy,
  Check,
  Code2,
  Eye,
  Download
} from "lucide-react";

import "../styles/PreviewPanel.css";

export function buildPreviewDocument(code = "", framework = "") {
  const trimmed = code.trim();
  if (
    trimmed.toLowerCase().startsWith("<!doctype") ||
    trimmed.toLowerCase().startsWith("<html")
  ) {
    return trimmed;
  }

  const bootstrapLink = framework.toLowerCase().includes("bootstrap")
    ? `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${bootstrapLink}
    <style>
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    </style>
  </head>
  <body>${trimmed}</body>
</html>`;
}

function PreviewPanel({ generated }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [device, setDevice] = useState("desktop");

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

  const isHtmlPreviewable =
    generated.code?.includes("<") &&
    !generated.framework?.toLowerCase().includes("react");

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
    const html = buildPreviewDocument(generated.code, generated.framework);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(generated.componentType || "component")
      .toLowerCase()
      .replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            </>
          )}

          <button type="button" className="device-button" onClick={handleDownload}>
            <Download size={14} />
            HTML
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
              sandbox="allow-scripts"
              style={{
                width: "100%",
                minHeight: "360px",
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
            <span>{generated.framework} Source Code</span>
            <button type="button" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
          <pre>
            <code>{generated.code || "No code was returned."}</code>
          </pre>
        </div>
      )}

      <div className="preview-footer">
        <span>Component: {generated.componentType}</span>
        <span>Framework: {generated.framework}</span>
      </div>
    </section>
  );
}

export default PreviewPanel;