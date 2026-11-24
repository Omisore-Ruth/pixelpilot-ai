import { SECTION_ORDER } from "../data/options";

const BOOTSTRAP_CSS =
  '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />';

export function isFullDocument(code = "") {
  const start = code.trim().slice(0, 200).toLowerCase();
  return start.startsWith("<!doctype") || start.startsWith("<html");
}

export function isPreviewable(item) {
  return Boolean(item?.code?.includes("<")) && !item?.framework?.toLowerCase().includes("react");
}

function usesBootstrap(item) {
  return (
    item.framework?.toLowerCase().includes("bootstrap") ||
    /bootstrap(@|\.min)/i.test(item.code || "")
  );
}

export function buildPreviewDocument(code = "", framework = "", title = "PixelPilot Export") {
  const trimmed = code.trim();
  if (isFullDocument(trimmed)) return trimmed;

  const bootstrapLink = framework.toLowerCase().includes("bootstrap") ? BOOTSTRAP_CSS : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${bootstrapLink}
    <style>
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    </style>
  </head>
  <body>
${trimmed}
  </body>
</html>`;
}

// Pulls the useful parts out of a full HTML document so it can be placed
// inside another page: stylesheets/styles from <head>, then the <body> content.
function toFragment(code) {
  if (!isFullDocument(code)) return { head: "", body: code.trim() };

  const doc = new DOMParser().parseFromString(code, "text/html");
  const head = [...doc.head.querySelectorAll('style, link[rel="stylesheet"]')]
    .map((node) => node.outerHTML)
    .join("\n");
  return { head, body: doc.body.innerHTML.trim() };
}

function sectionRank(type) {
  const index = SECTION_ORDER.indexOf(type);
  return index === -1 ? SECTION_ORDER.length : index;
}

// Combines selected saved components into one page, in a sensible section
// order (nav → hero → content → contact → footer), without nested documents.
// keepOrder: use the order given (a project's own order) instead of sorting.
export function buildCombinedSite(items, { keepOrder = false, title = "My Website" } = {}) {
  const usable = items.filter(isPreviewable);
  const sorted = keepOrder
    ? usable
    : [...usable].sort((a, b) => sectionRank(a.componentType) - sectionRank(b.componentType));

  const heads = new Set();
  const bodies = [];
  let needsBootstrap = false;

  for (const item of sorted) {
    const { head, body } = toFragment(item.code);
    if (head) heads.add(head);
    if (usesBootstrap(item)) needsBootstrap = true;
    bodies.push(`<!-- ${item.componentType} -->\n${body}`);
  }

  // Avoid loading Bootstrap twice if a full document already linked it.
  const headMarkup = [...heads].join("\n");
  const bootstrapLink = needsBootstrap && !/bootstrap(@|\.min)/i.test(headMarkup) ? BOOTSTRAP_CSS : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title.replace(/[<>&"]/g, "")}</title>
    ${bootstrapLink}
    <style>
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    </style>
${headMarkup}
  </head>
  <body>
${bodies.join("\n\n")}
  </body>
</html>`;
}

export function slugify(text = "component") {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "component";
}

export function downloadHtmlFile(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Default export picks the newest component of each section type, so the page
// doesn't end up with three hero sections. "Full Website" results already hold
// every section, so they're only picked by default if nothing else is saved.
export function defaultExportSelection(items) {
  const seen = new Set();
  const ids = [];
  for (const item of items) {
    if (!isPreviewable(item) || item.componentType === "Full Website (All Sections)") continue;
    if (seen.has(item.componentType)) continue;
    seen.add(item.componentType);
    ids.push(item.id);
  }
  if (ids.length === 0) {
    const fullSite = items.find((item) => isPreviewable(item));
    if (fullSite) ids.push(fullSite.id);
  }
  return ids;
}
