import { useCallback, useEffect, useState } from "react";

// Each page gets its own URL (e.g. /#/generate) so refreshing keeps you on the
// same page and links can be shared. Hash routes need no server config, so
// this works on Netlify, Vercel or any static host as-is.
export const ROUTES = {
  Dashboard: "dashboard",
  "Generate UI": "generate",
  "My Projects": "projects",
  "Component Library": "library",
  "Saved Components": "saved",
  Settings: "settings",
  "Help & Support": "help"
};

const LABEL_BY_SLUG = Object.fromEntries(Object.entries(ROUTES).map(([label, slug]) => [slug, label]));

function labelFromHash() {
  const slug = window.location.hash.replace(/^#\/?/, "");
  return LABEL_BY_SLUG[slug] || "Dashboard";
}

export function useHashRoute() {
  const [page, setPage] = useState(labelFromHash);

  useEffect(() => {
    const onHashChange = () => {
      setPage(labelFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((label) => {
    const slug = ROUTES[label] || "dashboard";
    if (window.location.hash !== `#/${slug}`) {
      window.location.hash = `/${slug}`;
    }
  }, []);

  return [page, navigate];
}
