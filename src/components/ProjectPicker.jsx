import { useState } from "react";
import { Check, FolderPlus } from "lucide-react";

const NEW = "__new__";

// "Add to project" control under a generated component.
function ProjectPicker({ projects, projectId, onAssign, onCreate }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const run = async (task, success) => {
    setBusy(true);
    setStatus("");
    try {
      await task();
      setStatus(success);
    } catch (error) {
      setStatus(error?.message ? `Couldn't save: ${error.message}` : "Couldn't save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleSelect = (value) => {
    if (value === NEW) {
      setCreating(true);
      setStatus("");
      return;
    }
    const target = value || null;
    const project = projects.find((p) => p.id === target);
    run(() => onAssign(target), project ? `Added to ${project.name}` : "Removed from project");
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    run(async () => {
      const project = await onCreate(clean);
      await onAssign(project.id);
      setCreating(false);
      setName("");
    }, `Added to ${clean}`);
  };

  if (creating) {
    return (
      <form className="project-picker creating" onSubmit={handleCreate}>
        <FolderPlus size={15} aria-hidden="true" />
        <input
          type="text"
          value={name}
          maxLength={80}
          autoFocus
          placeholder="Project name, e.g. Restaurant website"
          onChange={(e) => setName(e.target.value)}
          aria-label="New project name"
        />
        <button type="submit" className="pp-create" disabled={!name.trim() || busy}>
          Create
        </button>
        <button type="button" className="pp-cancel" onClick={() => setCreating(false)}>
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="project-picker">
      <FolderPlus size={15} aria-hidden="true" />
      <label className="sr-only" htmlFor="project-picker-select">
        Project
      </label>
      <select
        id="project-picker-select"
        value={projectId || ""}
        disabled={busy}
        onChange={(e) => handleSelect(e.target.value)}
      >
        <option value="">{projectId ? "Remove from project" : "Add to project..."}</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
        <option value={NEW}>+ New project...</option>
      </select>
      {status && (
        <span className="pp-status" role="status">
          {!status.startsWith("Couldn't") && <Check size={13} />}
          {status}
        </span>
      )}
    </div>
  );
}

export default ProjectPicker;
