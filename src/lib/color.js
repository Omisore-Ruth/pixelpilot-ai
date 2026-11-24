/**
 * Turns whatever someone typed or pasted into "#RRGGBB", or returns null.
 * Accepts: #C2410C, C2410C, #c41, " #C2410C ", rgb(194, 65, 12).
 */
export function normalizeColor(input) {
  const text = String(input || "").trim();

  const rgb = text.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgb) {
    const parts = rgb.slice(1, 4).map(Number);
    if (parts.some((n) => n > 255)) return null;
    return `#${parts.map((n) => n.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
  }

  const hex = text.replace(/^#/, "").replace(/\s+/g, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return `#${hex
      .split("")
      .map((c) => c + c)
      .join("")}`.toUpperCase();
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex}`.toUpperCase();
  return null;
}
