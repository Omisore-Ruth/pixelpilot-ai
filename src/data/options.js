// Keep these lists in sync with the allowed values in server/index.js.
export const COMPONENT_TYPES = [
  "Hero Section",
  "Navigation Bar",
  "Feature Cards",
  "Contact Form",
  "Full Website (All Sections)",
  "Pricing Section",
  "Footer"
];

export const FRAMEWORKS = ["Bootstrap", "HTML & CSS", "React"];

export const DESIGN_STYLES = ["Modern", "Minimal", "Glassmorphism", "Gradient", "Corporate"];

export const DEFAULT_COLOR = "#7557F6";

export const DEFAULT_PROMPT =
  "Create a responsive hero section for a modern botanical skincare studio with headline, product highlight, and call-to-action button.";

// Order sections appear in when several saved components are exported as one page.
export const SECTION_ORDER = [
  "Navigation Bar",
  "Hero Section",
  "Full Website (All Sections)",
  "Feature Cards",
  "Pricing Section",
  "Contact Form",
  "Footer"
];

export const MAX_SAVED = 30;

export function makeDraft(framework = "Bootstrap") {
  return {
    prompt: DEFAULT_PROMPT,
    componentType: "Hero Section",
    framework,
    designStyle: "Modern",
    primaryColor: DEFAULT_COLOR
  };
}
