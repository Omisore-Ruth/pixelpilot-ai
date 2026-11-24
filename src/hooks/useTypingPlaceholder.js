import { useEffect, useState } from "react";

const TYPE_MS = 38;
const DELETE_MS = 14;
const HOLD_MS = 1800;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Types example phrases one character at a time, holds, deletes, then moves on.
 * Returns the text to show and the full example currently being shown.
 * Pauses (returns the full example) when `active` is false.
 */
export function useTypingPlaceholder(examples, active = true) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const current = examples[index % examples.length];
  const reduced = prefersReducedMotion();

  useEffect(() => {
    if (!active) return undefined;

    // Reduced motion: no typing, just swap whole examples every few seconds.
    if (reduced) {
      const timer = setTimeout(() => setIndex((i) => i + 1), 4000);
      return () => clearTimeout(timer);
    }

    let delay = deleting ? DELETE_MS : TYPE_MS;
    if (!deleting && length === current.length) delay = HOLD_MS;

    const timer = setTimeout(() => {
      if (!deleting && length < current.length) {
        setLength((n) => n + 1);
      } else if (!deleting) {
        setDeleting(true);
      } else if (length > 0) {
        setLength((n) => n - 1);
      } else {
        setDeleting(false);
        setIndex((i) => i + 1);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [active, reduced, deleting, length, current]);

  const text = reduced || !active ? current : current.slice(0, length);
  return { text, example: current };
}
