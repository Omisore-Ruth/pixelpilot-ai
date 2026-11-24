import { useState } from "react";
import { ArrowRight, Download, Sparkles, Trash2, X } from "lucide-react";

import { buildCombinedSite, defaultExportSelection, downloadHtmlFile, isPreviewable } from "../lib/preview";
import AnimatedHeading from "../components/AnimatedHeading";

function SavedComponentsPage({ items, onOpen, onRemove, navigate, notice, onDismissNotice }) {
  // Which components go into the combined export. Starts with the newest of
  // each section type; the user can tick/untick from there.
  const [selectedIds, setSelectedIds] = useState(() => defaultExportSelection(items));

  const selected = items.filter((item) => selectedIds.includes(item.id) && isPreviewable(item));

  const toggle = (id) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleRemove = (id) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    onRemove(id);
  };

  const handleExport = () => {
    if (selected.length === 0) return;
    downloadHtmlFile("index.html", buildCombinedSite(selected));
  };

  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        SAVED COMPONENTS ({items.length})
      </div>

      <div className="page-heading-row">
        <div>
          <AnimatedHeading lead="Your generated" highlight="library." />
          <p className="dashboard-description">
            Saved in this browser. Tick the sections you want, then export them as one
            ready-to-deploy index.html — they're arranged nav → hero → content → contact → footer
            automatically.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="primary-button"
            onClick={handleExport}
            disabled={selected.length === 0}
          >
            <Download size={16} />
            Export {selected.length} {selected.length === 1 ? "section" : "sections"} as index.html
          </button>
        )}
      </div>

      {notice && (
        <div className="notice notice-info" role="status">
          <span>{notice}</span>
          <button type="button" onClick={onDismissNotice} aria-label="Dismiss message">
            <X size={15} />
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="glass-card welcome-card page-card">
          <h3>No saved components yet</h3>
          <p>
            Generate components such as Navigation Bar, Hero Section, Feature Cards, and Contact
            Form to collect them here.
          </p>
          <button type="button" className="primary-button" onClick={() => navigate("Generate UI")}>
            Generate First Component
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="component-grid">
          {items.map((item) => {
            const exportable = isPreviewable(item);
            return (
              <div className="glass-card welcome-card" key={item.id}>
                <div>
                  <h3>{item.componentType}</h3>
                  <p>
                    {item.framework} · {item.designStyle} · {item.primaryColor}
                  </p>
                  {item.prompt && <p className="card-prompt">{item.prompt}</p>}
                </div>

                <label className={`export-toggle ${exportable ? "" : "is-disabled"}`}>
                  <input
                    type="checkbox"
                    checked={exportable && selectedIds.includes(item.id)}
                    disabled={!exportable}
                    onChange={() => toggle(item.id)}
                  />
                  {exportable ? "Include in export" : "React components can't be merged into HTML"}
                </label>

                <div className="button-row">
                  <button type="button" className="primary-button" onClick={() => onOpen(item)}>
                    Open in Preview
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    aria-label={`Remove ${item.componentType}`}
                    title="Remove"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default SavedComponentsPage;
