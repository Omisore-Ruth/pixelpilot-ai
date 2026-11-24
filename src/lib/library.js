// Where saved components and projects live.
//
// cloudLibrary  → Supabase tables (follows the user across devices)
// localLibrary  → this browser only; used automatically if the Supabase
//                 tables haven't been created yet (see supabase/schema.sql)
//
// Both expose the same async functions, so the app doesn't care which is used.

import { supabase } from "./supabase";
import { readStorage, writeStorage } from "./storage";

const COMPONENT_COLUMNS =
  "id, project_id, position, prompt, component_type, framework, design_style, primary_color, code, created_at, updated_at";

// ---- shape conversion (database snake_case ↔ app camelCase) ----
export function fromRow(row) {
  return {
    id: row.id,
    projectId: row.project_id ?? null,
    position: row.position ?? 0,
    prompt: row.prompt ?? "",
    componentType: row.component_type,
    framework: row.framework,
    designStyle: row.design_style ?? "",
    primaryColor: row.primary_color ?? "#7557F6",
    code: row.code,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toRow(item) {
  const row = {};
  if ("projectId" in item) row.project_id = item.projectId;
  if ("position" in item) row.position = item.position;
  if ("prompt" in item) row.prompt = (item.prompt || "").slice(0, 2000);
  if ("componentType" in item) row.component_type = item.componentType;
  if ("framework" in item) row.framework = item.framework;
  if ("designStyle" in item) row.design_style = item.designStyle;
  if ("primaryColor" in item) {
    row.primary_color = /^#[0-9a-f]{6}$/i.test(item.primaryColor || "") ? item.primaryColor : null;
  }
  if ("code" in item) row.code = item.code;
  return row;
}

function projectFromRow(row) {
  return { id: row.id, name: row.name, createdAt: row.created_at, updatedAt: row.updated_at };
}

// Throws a readable error instead of Supabase's technical one.
function check(error) {
  if (!error) return;
  const message = error.message || "";
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    const friendly = new Error("Couldn't reach online storage. Check your internet connection and try again.");
    friendly.code = error.code;
    friendly.cause = error;
    throw friendly;
  }
  throw error;
}

// True when the error means "the tables don't exist / aren't exposed yet".
export function isMissingTableError(error) {
  const code = error?.code || "";
  const message = (error?.message || "").toLowerCase();
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST106" ||
    code === "42501" ||
    message.includes("could not find the table") ||
    message.includes("does not exist") ||
    message.includes("permission denied")
  );
}

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------
export const cloudLibrary = {
  mode: "cloud",

  async load() {
    const [components, projects] = await Promise.all([
      supabase.from("components").select(COMPONENT_COLUMNS).order("created_at", { ascending: false }).limit(500),
      supabase.from("projects").select("id, name, created_at, updated_at").order("created_at", { ascending: false })
    ]);
    check(components.error);
    check(projects.error);
    return { components: components.data.map(fromRow), projects: projects.data.map(projectFromRow) };
  },

  async addComponents(items) {
    if (!items.length) return [];
    const { data, error } = await supabase.from("components").insert(items.map(toRow)).select(COMPONENT_COLUMNS);
    check(error);
    return data.map(fromRow);
  },

  async updateComponent(id, patch) {
    const { data, error } = await supabase
      .from("components")
      .update(toRow(patch))
      .eq("id", id)
      .select(COMPONENT_COLUMNS)
      .single();
    check(error);
    return fromRow(data);
  },

  async deleteComponent(id) {
    const { error } = await supabase.from("components").delete().eq("id", id);
    check(error);
  },

  async addProject(name) {
    const { data, error } = await supabase
      .from("projects")
      .insert({ name })
      .select("id, name, created_at, updated_at")
      .single();
    check(error);
    return projectFromRow(data);
  },

  async renameProject(id, name) {
    const { error } = await supabase.from("projects").update({ name }).eq("id", id);
    check(error);
  },

  async deleteProject(id) {
    // Components stay in the library; the database clears their project link.
    const { error } = await supabase.from("projects").delete().eq("id", id);
    check(error);
  },

  async setPositions(updates) {
    // updates: [{ id, position }]
    const results = await Promise.all(
      updates.map(({ id, position }) => supabase.from("components").update({ position }).eq("id", id))
    );
    results.forEach((r) => check(r.error));
  }
};

// ---------------------------------------------------------------------------
// Browser only (fallback)
// ---------------------------------------------------------------------------
const localKey = (userId) => `pixelpilot_library:${userId}`;
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function createLocalLibrary(userId) {
  const read = () => readStorage(localKey(userId), { components: [], projects: [] });
  const write = (data) => writeStorage(localKey(userId), data);
  const now = () => new Date().toISOString();

  return {
    mode: "local",

    clear() {
      try {
        localStorage.removeItem(localKey(userId));
      } catch {
        // ignore
      }
    },

    async load() {
      const data = read();
      return { components: data.components || [], projects: data.projects || [] };
    },

    async addComponents(items) {
      const data = read();
      const created = items.map((item) => ({
        projectId: null,
        position: 0,
        ...item,
        id: newId(),
        createdAt: now(),
        updatedAt: now()
      }));
      data.components = [...created, ...(data.components || [])];
      write(data);
      return created;
    },

    async updateComponent(id, patch) {
      const data = read();
      let updated = null;
      data.components = data.components.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...patch, updatedAt: now() };
        return updated;
      });
      write(data);
      return updated;
    },

    async deleteComponent(id) {
      const data = read();
      data.components = data.components.filter((c) => c.id !== id);
      write(data);
    },

    async addProject(name) {
      const data = read();
      const project = { id: newId(), name, createdAt: now(), updatedAt: now() };
      data.projects = [project, ...(data.projects || [])];
      write(data);
      return project;
    },

    async renameProject(id, name) {
      const data = read();
      data.projects = data.projects.map((p) => (p.id === id ? { ...p, name, updatedAt: now() } : p));
      write(data);
    },

    async deleteProject(id) {
      const data = read();
      data.projects = data.projects.filter((p) => p.id !== id);
      data.components = data.components.map((c) => (c.projectId === id ? { ...c, projectId: null } : c));
      write(data);
    },

    async setPositions(updates) {
      const data = read();
      const byId = new Map(updates.map((u) => [u.id, u.position]));
      data.components = data.components.map((c) => (byId.has(c.id) ? { ...c, position: byId.get(c.id) } : c));
      write(data);
    }
  };
}
