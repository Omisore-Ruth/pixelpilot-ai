import { useCallback, useEffect, useMemo, useState } from "react";

import { STARTER_COMPONENTS } from "../data/starters";
import { cloudLibrary, createLocalLibrary, isMissingTableError } from "../lib/library";
import { readStorage, writeStorage } from "../lib/storage";
import { supabase } from "../lib/supabase";

const migratedKey = (userId) => `pixelpilot_migrated:${userId}`;
const legacyKeys = (userId) => [`pixelpilot_saved:${userId}`, "pixelpilot_saved"];

// Components saved before projects existed lived in localStorage. Returns
// them (or the starter examples for brand-new users) without old ids.
function readLegacyComponents(userId) {
  for (const key of legacyKeys(userId)) {
    const items = readStorage(key, null);
    if (Array.isArray(items)) {
      return items.filter((i) => i && typeof i.code === "string" && i.componentType);
    }
  }
  return STARTER_COMPONENTS;
}

function clearLegacy(userId) {
  try {
    legacyKeys(userId).forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

const strip = ({ prompt, componentType, framework, designStyle, primaryColor, code }) => ({
  prompt,
  componentType,
  framework,
  designStyle,
  primaryColor,
  code
});

// Sections of a project in the user's chosen order.
export function sortProjectItems(items) {
  return [...items].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0) || String(a.createdAt).localeCompare(String(b.createdAt))
  );
}

export function useLibrary(userId) {
  const [backend, setBackend] = useState(null);
  const [components, setComponents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      let lib = supabase ? cloudLibrary : createLocalLibrary(userId);
      let data;

      try {
        data = await lib.load();
      } catch (error) {
        console.warn("Cloud library unavailable, using this browser instead:", error);
        lib = createLocalLibrary(userId);
        data = await lib.load();
        if (!cancelled) {
          setNotice(
            isMissingTableError(error)
              ? "Projects are being saved in this browser only, because the Supabase tables haven't been set up yet. Run supabase/schema.sql in Supabase to save them online."
              : "Couldn't reach online storage, so changes are being saved in this browser for now."
          );
        }
      }

      // Work saved in this browser while online storage wasn't set up yet:
      // move it (projects first, then their components) into Supabase.
      if (lib.mode === "cloud") {
        try {
          const local = createLocalLibrary(userId);
          const pending = await local.load();
          if (pending.components.length || pending.projects.length) {
            const idMap = new Map();
            for (const project of [...pending.projects].reverse()) {
              const created = await lib.addProject(project.name);
              idMap.set(project.id, created.id);
              data.projects = [created, ...data.projects];
            }
            const uploaded = await lib.addComponents(
              [...pending.components].reverse().map((c) => ({
                ...strip(c),
                projectId: idMap.get(c.projectId) ?? null,
                position: c.position ?? 0
              }))
            );
            data.components = [...uploaded.reverse(), ...data.components];
            local.clear();
          }
        } catch (error) {
          console.warn("Couldn't move browser-saved work online yet:", error);
        }
      }

      // One-time move of older saved components into the library.
      if (!readStorage(migratedKey(userId), false)) {
        try {
          if (data.components.length === 0) {
            const legacy = readLegacyComponents(userId).map(strip);
            const added = await lib.addComponents(legacy);
            data = { ...data, components: added };
          }
          writeStorage(migratedKey(userId), true);
          clearLegacy(userId);
        } catch (error) {
          console.warn("Couldn't move older saved components:", error);
        }
      }

      if (cancelled) return;
      setBackend(lib);
      setComponents(data.components);
      setProjects(data.projects);
      setLoading(false);
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addComponent = useCallback(
    async (item) => {
      const [saved] = await backend.addComponents([strip(item)]);
      setComponents((prev) => [saved, ...prev]);
      return saved;
    },
    [backend]
  );

  const updateComponent = useCallback(
    async (id, patch) => {
      const saved = await backend.updateComponent(id, patch);
      setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, ...saved } : c)));
      return saved;
    },
    [backend]
  );

  const deleteComponent = useCallback(
    async (id) => {
      await backend.deleteComponent(id);
      setComponents((prev) => prev.filter((c) => c.id !== id));
    },
    [backend]
  );

  const addProject = useCallback(
    async (name) => {
      const project = await backend.addProject(name.trim().slice(0, 80));
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    [backend]
  );

  const renameProject = useCallback(
    async (id, name) => {
      const clean = name.trim().slice(0, 80);
      await backend.renameProject(id, clean);
      setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: clean } : p)));
    },
    [backend]
  );

  const deleteProject = useCallback(
    async (id) => {
      await backend.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setComponents((prev) => prev.map((c) => (c.projectId === id ? { ...c, projectId: null } : c)));
    },
    [backend]
  );

  // Puts a component in a project (at the end), or takes it out (projectId null).
  const assignToProject = useCallback(
    async (componentId, projectId) => {
      const inTarget = components.filter((c) => c.projectId === projectId && c.id !== componentId);
      const position = projectId ? Math.max(-1, ...inTarget.map((c) => c.position ?? 0)) + 1 : 0;
      return updateComponent(componentId, { projectId, position });
    },
    [components, updateComponent]
  );

  // Moves a section up (-1) or down (+1) within its project.
  const moveInProject = useCallback(
    async (projectId, componentId, direction) => {
      const ordered = sortProjectItems(components.filter((c) => c.projectId === projectId));
      const from = ordered.findIndex((c) => c.id === componentId);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= ordered.length) return;

      [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
      const updates = ordered.map((c, index) => ({ id: c.id, position: index }));
      const byId = new Map(updates.map((u) => [u.id, u.position]));

      setComponents((prev) => prev.map((c) => (byId.has(c.id) ? { ...c, position: byId.get(c.id) } : c)));
      await backend.setPositions(updates);
    },
    [backend, components]
  );

  return useMemo(
    () => ({
      loading,
      mode: backend?.mode ?? null,
      notice,
      dismissNotice: () => setNotice(""),
      components,
      projects,
      addComponent,
      updateComponent,
      deleteComponent,
      addProject,
      renameProject,
      deleteProject,
      assignToProject,
      moveInProject
    }),
    [
      loading,
      backend,
      notice,
      components,
      projects,
      addComponent,
      updateComponent,
      deleteComponent,
      addProject,
      renameProject,
      deleteProject,
      assignToProject,
      moveInProject
    ]
  );
}
