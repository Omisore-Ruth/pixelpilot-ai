import { useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Download,
  FolderOpen,
  FolderPlus,
  Pencil,
  Sparkles,
  Trash2,
  X
} from "lucide-react";

import AnimatedHeading from "../components/AnimatedHeading";
import { sortProjectItems } from "../hooks/useLibrary";
import { buildCombinedSite, downloadHtmlFile, isPreviewable, slugify } from "../lib/preview";

function ProjectList({ library, onSelect }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const countFor = (id) => library.components.filter((c) => c.projectId === id).length;

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!name.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const project = await library.addProject(name);
      setName("");
      onSelect(project.id);
    } catch (err) {
      setError(err?.message || "Couldn't create the project.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form className="glass-card welcome-card page-card new-project" onSubmit={handleCreate}>
        <h3>Start a new project</h3>
        <p>Group sections into a website, then reorder them and export the whole page.</p>
        <div className="new-project-row">
          <input
            type="text"
            value={name}
            maxLength={80}
            placeholder="e.g. Ìyá Àlàkẹ́ Kitchen website"
            onChange={(e) => setName(e.target.value)}
            aria-label="Project name"
          />
          <button type="submit" className="primary-button" disabled={!name.trim() || busy}>
            <FolderPlus size={16} />
            {busy ? "Creating..." : "Create Project"}
          </button>
        </div>
        {error && <p className="inline-error">{error}</p>}
      </form>

      {library.loading ? (
        <p className="loading-line">Loading your projects...</p>
      ) : library.projects.length === 0 ? (
        <p className="loading-line">
          No projects yet. Create one above, or use &quot;Add to project&quot; under any generated component.
        </p>
      ) : (
        <div className="component-grid">
          {library.projects.map((project) => {
            const count = countFor(project.id);
            return (
              <div className="glass-card welcome-card" key={project.id}>
                <div>
                  <h3>
                    <FolderOpen size={17} className="inline-icon" />
                    {project.name}
                  </h3>
                  <p>
                    {count} {count === 1 ? "section" : "sections"}
                  </p>
                </div>
                <button type="button" className="primary-button align-start" onClick={() => onSelect(project.id)}>
                  Open Project
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function ProjectDetail({ project, library, onBack, onOpen, navigate }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(project.name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  const sections = sortProjectItems(library.components.filter((c) => c.projectId === project.id));
  const available = library.components.filter((c) => c.projectId !== project.id);
  const exportable = sections.filter(isPreviewable);

  const attempt = async (task) => {
    setError("");
    try {
      await task();
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    }
  };

  const handleRename = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    attempt(async () => {
      await library.renameProject(project.id, name);
      setRenaming(false);
    });
  };

  const handleExport = () => {
    downloadHtmlFile(
      `${slugify(project.name)}.html`,
      buildCombinedSite(exportable, { keepOrder: true, title: project.name })
    );
  };

  return (
    <div className="project-detail">
      <button type="button" className="back-link" onClick={onBack}>
        <ArrowLeft size={15} />
        All projects
      </button>

      <div className="glass-card welcome-card page-card">
        <div className="project-head">
          {renaming ? (
            <form className="rename-form" onSubmit={handleRename}>
              <input
                type="text"
                value={name}
                maxLength={80}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                aria-label="Project name"
              />
              <button type="submit" className="secondary-button" disabled={!name.trim()}>
                Save
              </button>
              <button type="button" className="secondary-button" onClick={() => setRenaming(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <h3>
              <FolderOpen size={18} className="inline-icon" />
              {project.name}
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setName(project.name);
                  setRenaming(true);
                }}
                aria-label="Rename project"
                title="Rename"
              >
                <Pencil size={14} />
              </button>
            </h3>
          )}

          <div className="button-row">
            <button
              type="button"
              className="primary-button"
              onClick={handleExport}
              disabled={exportable.length === 0}
              title={exportable.length === 0 ? "Add HTML or Bootstrap sections to export" : ""}
            >
              <Download size={16} />
              Export Project
            </button>
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  className="secondary-button danger-button"
                  onClick={() => attempt(async () => {
                    await library.deleteProject(project.id);
                    onBack();
                  })}
                >
                  Yes, delete project
                </button>
                <button type="button" className="secondary-button" onClick={() => setConfirmDelete(false)}>
                  Keep
                </button>
              </>
            ) : (
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete project"
                title="Delete project (its sections stay in Saved Components)"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        <p>
          {sections.length} {sections.length === 1 ? "section" : "sections"} · exported top to bottom in this order.
          Deleting a project keeps its sections in Saved Components.
        </p>

        {error && <p className="inline-error">{error}</p>}

        {sections.length === 0 ? (
          <div className="project-empty">
            <p>No sections yet. Add one below, or use &quot;Add to project&quot; under any generated component.</p>
            <button type="button" className="secondary-button" onClick={() => navigate("Generate UI")}>
              <Sparkles size={14} />
              Generate a section
            </button>
          </div>
        ) : (
          <ol className="section-list">
            {sections.map((item, index) => (
              <li key={item.id}>
                <span className="section-number">{index + 1}</span>
                <div className="section-info">
                  <strong>{item.componentType}</strong>
                  <span>
                    {item.framework} · {item.designStyle}
                    {!isPreviewable(item) && " · not included in export"}
                  </span>
                </div>
                <div className="section-tools">
                  <button
                    type="button"
                    className="icon-button"
                    disabled={index === 0}
                    onClick={() => attempt(() => library.moveInProject(project.id, item.id, -1))}
                    aria-label={`Move ${item.componentType} up`}
                    title="Move up"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    disabled={index === sections.length - 1}
                    onClick={() => attempt(() => library.moveInProject(project.id, item.id, 1))}
                    aria-label={`Move ${item.componentType} down`}
                    title="Move down"
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button type="button" className="secondary-button small" onClick={() => onOpen(item)}>
                    Open
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => attempt(() => library.assignToProject(item.id, null))}
                    aria-label={`Remove ${item.componentType} from project`}
                    title="Remove from project"
                  >
                    <X size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {available.length > 0 && (
          <label className="add-section">
            Add a saved component
            <select
              value=""
              onChange={(e) => e.target.value && attempt(() => library.assignToProject(e.target.value, project.id))}
            >
              <option value="">Choose a component...</option>
              {available.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.componentType} · {c.framework}
                  {c.prompt ? ` · ${c.prompt.slice(0, 40)}${c.prompt.length > 40 ? "..." : ""}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

function ProjectsPage({ library, onOpen, navigate }) {
  const [selectedId, setSelectedId] = useState(null);
  const project = library.projects.find((p) => p.id === selectedId);

  return (
    <section className="dashboard-page">
      <div className="workspace-eyebrow">
        <Sparkles size={15} />
        MY PROJECTS
      </div>

      <AnimatedHeading lead="Build whole" highlight="websites." />

      <p className="dashboard-description">
        Collect your generated sections into projects, put them in order, and export each project as one
        ready-to-publish page.
      </p>

      {library.notice && (
        <div className="notice notice-info" role="status">
          <span>{library.notice}</span>
          <button type="button" onClick={library.dismissNotice} aria-label="Dismiss message">
            <X size={15} />
          </button>
        </div>
      )}

      {project ? (
        <ProjectDetail
          key={project.id}
          project={project}
          library={library}
          onBack={() => setSelectedId(null)}
          onOpen={onOpen}
          navigate={navigate}
        />
      ) : (
        <ProjectList library={library} onSelect={setSelectedId} />
      )}
    </section>
  );
}

export default ProjectsPage;
