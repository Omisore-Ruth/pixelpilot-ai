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

// Shown one by one as a typing placeholder in the empty prompt box.
export const EXAMPLE_PROMPTS = [
  "A hero section for a Lagos bakery with a bold headline, a short story and an Order Now button",
  "A pricing table with three plans for a yoga studio, with the middle plan highlighted",
  "A navigation bar for a law firm with a logo, five links and a Book a Consultation button",
  "Three feature cards for a budgeting app: track spending, set goals, get reports",
  "A contact form for a wedding photographer with date picker, budget dropdown and message box",
  "A footer for a tech startup with newsletter signup, social icons and four link columns"
];

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
    prompt: "",
    componentType: "Hero Section",
    framework,
    designStyle: "Modern",
    primaryColor: DEFAULT_COLOR
  };
}
