// localStorage can throw (private browsing, storage full, disabled cookies),
// so every read and write goes through these helpers.

export function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore: the app still works, it just won't remember this between visits.
  }
}

// Older versions stored the name and framework as plain strings, not JSON.
export function readLegacyString(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "string" ? parsed : fallback;
    } catch {
      return raw;
    }
  } catch {
    return fallback;
  }
}
