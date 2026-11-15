import { useEffect, useState } from "react";
import {
  Menu,
  Bell,
  Search,
  Sparkles,
  ArrowRight,
  Download,
  Trash2,
  CheckCircle2
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import PromptGenerator from "./components/PromptGenerator";
import PreviewPanel, { buildPreviewDocument } from "./components/PreviewPanel";

import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STARTER_COMPONENTS = [
  {
    id: 101,
    componentType: "Navigation Bar",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Responsive Bootstrap navigation bar for Atelier Botanica",
    code: `<nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#" style="color:#7557F6;">Atelier Botanica</a>
    <div class="d-flex align-items-center gap-4">
      <a class="nav-link text-secondary fw-medium" href="#hero">Home</a>
      <a class="nav-link text-secondary fw-medium" href="#cards">Products</a>
      <a class="nav-link text-secondary fw-medium" href="#contact">Contact</a>
      <a class="btn text-white px-4" style="background:#7557F6;" href="#contact">Shop Now</a>
    </div>
  </div>
</nav>`
  },
  {
    id: 102,
    componentType: "Hero Section",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Modern hero section for a botanical skincare brand",
    code: `<section id="hero" class="py-5 bg-light border-bottom">
  <div class="container py-4">
    <div class="row align-items-center g-4">
      <div class="col-lg-6">
        <p class="text-uppercase small fw-bold mb-2" style="color:#7557F6;">Botanical Formulations</p>
        <h1 class="display-5 fw-bold text-dark mb-3">Gentle daily skincare rooted in cold-pressed plants.</h1>
        <p class="lead text-secondary mb-4">Small-batch serums and barrier creams crafted without synthetic fragrance.</p>
        <div class="d-flex gap-3">
          <a href="#cards" class="btn btn-lg text-white px-4" style="background:#7557F6;">Explore Collection</a>
          <a href="#contact" class="btn btn-lg btn-outline-secondary px-4">Book Consultation</a>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="bg-white border rounded-4 p-4 shadow-sm">
          <svg viewBox="0 0 420 260" xmlns="http://www.w3.org/2000/svg" class="w-100 h-auto">
            <rect width="420" height="260" rx="12" fill="#F5F3FF" />
            <rect x="40" y="42" width="140" height="176" rx="12" fill="#7557F6" opacity="0.18" />
            <rect x="76" y="70" width="68" height="120" rx="10" fill="#7557F6" />
            <rect x="208" y="64" width="160" height="18" rx="6" fill="#1E293B" />
            <rect x="208" y="96" width="136" height="12" rx="4" fill="#64748B" />
            <rect x="208" y="118" width="120" height="12" rx="4" fill="#94A3B8" />
            <rect x="208" y="156" width="110" height="36" rx="8" fill="#7557F6" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 103,
    componentType: "Feature Cards",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Three responsive feature cards for skincare benefits",
    code: `<section id="cards" class="py-5 bg-white">
  <div class="container">
    <div class="row g-4">
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm p-3">
          <div class="card-body">
            <p class="small fw-semibold mb-2" style="color:#7557F6;">01 · Hydration</p>
            <h3 class="h5 fw-bold text-dark">Barrier Repair Serum</h3>
            <p class="text-secondary small mb-0">Ceramide-rich botanical blend formulated to calm redness and lock in moisture.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm p-3">
          <div class="card-body">
            <p class="small fw-semibold mb-2" style="color:#7557F6;">02 · Clarity</p>
            <h3 class="h5 fw-bold text-dark">Vitamin C Concentrate</h3>
            <p class="text-secondary small mb-0">Stabilized antioxidant drops that brighten uneven skin tone without irritation.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card h-100 border shadow-sm p-3">
          <div class="card-body">
            <p class="small fw-semibold mb-2" style="color:#7557F6;">03 · Protection</p>
            <h3 class="h5 fw-bold text-dark">Daily Mineral Fluid</h3>
            <p class="text-secondary small mb-0">Weightless broad-spectrum SPF 40 with a sheer, non-greasy matte finish.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`
  },
  {
    id: 104,
    componentType: "Contact Form",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt: "Clean Bootstrap contact form with name, email, and submit feedback",
    code: `<section id="contact" class="py-5 bg-light border-top">
  <div class="container" style="max-width: 640px;">
    <div class="card border shadow-sm p-4">
      <div class="card-body">
        <h2 class="h4 fw-bold text-dark mb-2">Book a Skincare Consultation</h2>
        <p class="text-secondary small mb-4">Tell us your skin goals and we will send a tailored routine guide.</p>
        <form onsubmit="event.preventDefault(); document.getElementById('contact-alert').classList.remove('d-none');">
          <div class="mb-3">
            <label class="form-label small fw-semibold">Full Name</label>
            <input type="text" class="form-control" required placeholder="Ruth Omisore" />
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Email Address</label>
            <input type="email" class="form-control" required placeholder="ruth@example.com" />
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Message</label>
            <textarea class="form-control" rows="3" required placeholder="Share your routine questions..."></textarea>
          </div>
          <button type="submit" class="btn text-white px-4" style="background:#7557F6;">Send Message</button>
          <div id="contact-alert" class="alert alert-success mt-3 d-none" role="alert">
            Thank you! Your message has been received.
          </div>
        </form>
      </div>
    </div>
  </div>
</section>`
  }
];

const LIBRARY_PRESETS = [
  {
    componentType: "Navigation Bar",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt:
      "Create a responsive Bootstrap 5 navigation bar with a brand logo, 4 clean links, and a highlighted Sign Up button."
  },
  {
    componentType: "Hero Section",
    framework: "HTML & CSS",
    designStyle: "Minimal",
    primaryColor: "#2563EB",
    prompt:
      "Create a clean two-column hero section for a student developer portfolio with headline, bio summary, CTA button, and an inline SVG graphic."
  },
  {
    componentType: "Feature Cards",
    framework: "Bootstrap",
    designStyle: "Modern",
    primaryColor: "#0D9488",
    prompt:
      "Create a 3-column responsive Bootstrap card grid showcasing web design, frontend development, and cloud deployment services."
  },
  {
    componentType: "Contact Form",
    framework: "HTML & CSS",
    designStyle: "Modern",
    primaryColor: "#7557F6",
    prompt:
      "Create a clean accessible contact form with name, email, project type dropdown, message box, and a styled submit button."
  }
];

function downloadHtmlFile(filename, html) {
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

function App() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [generated, setGenerated] = useState(STARTER_COMPONENTS[1]);
  const [prefill, setPrefill] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [userName, setUserName] = useState(
    () => localStorage.getItem("pixelpilot_user_name") || "Ruth"
  );
  const [preferredFramework, setPreferredFramework] = useState(
    () => localStorage.getItem("pixelpilot_framework") || "Bootstrap"
  );
  const [savedComponents, setSavedComponents] = useState(() => {
    try {
      const stored = localStorage.getItem("pixelpilot_saved");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasContactForm = parsed.some((item) => item?.id === 104);
          return hasContactForm ? parsed : [...parsed, STARTER_COMPONENTS[3]];
        }
      }
    } catch {
      // fallback below
    }
    return STARTER_COMPONENTS;
  });

  useEffect(() => {
    localStorage.setItem("pixelpilot_user_name", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("pixelpilot_framework", preferredFramework);
  }, [preferredFramework]);

  useEffect(() => {
    localStorage.setItem("pixelpilot_saved", JSON.stringify(savedComponents));
  }, [savedComponents]);

  const handleGenerate = async (settings) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setGenerated(null);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      const item = {
        ...settings,
        code: data.code,
        id: Date.now()
      };

      setGenerated(item);
      setSavedComponents((prev) => [item, ...prev].slice(0, 12));
    } catch (error) {
      console.error("Generation error:", error);
      setErrorMessage(
        error.message || "Unable to generate component. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNavigation = (item) => {
    setActiveItem(item);
    setMobileOpen(false);
  };

  const handleExportCombinedSite = () => {
    const htmlBlocks = savedComponents
      .filter((c) => c.code?.includes("<") && !c.framework.toLowerCase().includes("react"))
      .map((c) => `<!-- ${c.componentType} -->\n${c.code}`)
      .join("\n\n");

    const combined = buildPreviewDocument(
      htmlBlocks || generated?.code || "",
      "Bootstrap"
    );
    downloadHtmlFile("index.html", combined);
  };

  return (
    <div className="app-container">
      <Sidebar
        activeItem={activeItem}
        onNavigate={handleNavigation}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userName={userName}
        preferredFramework={preferredFramework}
      />

      <main className="main-content">
        <header className="app-header">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="header-title">
            <h2>{activeItem}</h2>
            <p>
              Welcome back, {userName || "Creator"} · Default stack: {preferredFramework}
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon-button"
              aria-label="View Saved Components"
              title="Saved Components"
              onClick={() => handleNavigation("Saved Components")}
            >
              <Search size={19} />
            </button>

            <button
              type="button"
              className="header-icon-button"
              aria-label="Personalization Settings"
              title="Personalization Settings"
              onClick={() => handleNavigation("Settings")}
            >
              <Bell size={19} />
            </button>
          </div>
        </header>

        {activeItem === "Dashboard" && (
          <section className="dashboard-page">
            <div className="workspace-eyebrow">
              <Sparkles size={15} />
              YOUR AI FRONTEND WORKSPACE
            </div>

            <h1>
              Build something
              <span className="gradient-text"> extraordinary.</span>
            </h1>

            <p className="dashboard-description">
              Describe your ideas, generate frontend components and bring your
              designs to life with PixelPilot AI.
            </p>

            <div className="glass-card welcome-card">
              <h3>Welcome back, {userName || "Creator"}</h3>
              <p>
                Your workspace is personalized for {preferredFramework}. You have{" "}
                {savedComponents.length} saved{" "}
                {savedComponents.length === 1 ? "component" : "components"} ready
                for preview and HTML export.
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => handleNavigation("Generate UI")}
                >
                  Start Generating
                  <ArrowRight size={17} />
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handleNavigation("Saved Components")}
                >
                  View Saved Library ({savedComponents.length})
                </button>
              </div>
            </div>
          </section>
        )}

        {activeItem === "Generate UI" && (
          <section className="generator-page">
            <div className="workspace-eyebrow">
              <Sparkles size={15} />
              PIXELPILOT AI GENERATOR
            </div>

            <h1>
              Turn your ideas into
              <span className="gradient-text"> interfaces.</span>
            </h1>

            <p className="dashboard-description">
              Describe the component you want. Choose your preferred framework
              and design style, then generate your preview.
            </p>

            {errorMessage && (
              <p style={{ color: "#f87171", marginBottom: "14px", fontSize: "13px" }}>
                {errorMessage}
              </p>
            )}

            <div className="generator-layout">
              <PromptGenerator
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                defaultFramework={preferredFramework}
                prefill={prefill}
              />
              <PreviewPanel generated={generated} />
            </div>
          </section>
        )}

        {activeItem === "Saved Components" && (
          <section className="dashboard-page">
            <div className="workspace-eyebrow">
              <Sparkles size={15} />
              SAVED COMPONENTS ({savedComponents.length})
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "8px"
              }}
            >
              <div>
                <h1>
                  Your generated
                  <span className="gradient-text"> library.</span>
                </h1>
                <p className="dashboard-description" style={{ marginBottom: 0 }}>
                  Saved locally in your browser. Export all HTML/Bootstrap
                  components together as a ready-to-deploy index.html file.
                </p>
              </div>

              {savedComponents.length > 0 && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={handleExportCombinedSite}
                >
                  <Download size={16} />
                  Export Combined index.html
                </button>
              )}
            </div>

            {savedComponents.length === 0 ? (
              <div className="glass-card welcome-card" style={{ marginTop: "24px" }}>
                <h3>No saved components yet</h3>
                <p>
                  Generate components such as Navigation Bar, Hero Section,
                  Feature Cards, and Contact Form to collect them here.
                </p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => handleNavigation("Generate UI")}
                >
                  Generate First Component
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : (
              <div className="component-grid">
                {savedComponents.map((item) => (
                  <div
                    className="glass-card welcome-card"
                    key={item.id ?? item.componentType}
                  >
                    <div>
                      <h3>{item.componentType}</h3>
                      <p>
                        {item.framework} · {item.designStyle} · {item.primaryColor}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => {
                          setGenerated(item);
                          handleNavigation("Generate UI");
                        }}
                      >
                        Open in Preview
                        <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        aria-label={`Remove ${item.componentType}`}
                        onClick={() =>
                          setSavedComponents((prev) =>
                            prev.filter((c) => c.id !== item.id)
                          )
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeItem === "Component Library" && (
          <section className="dashboard-page">
            <div className="workspace-eyebrow">
              <Sparkles size={15} />
              COMPONENT PRESETS
            </div>

            <h1>
              Starter prompts for
              <span className="gradient-text"> every section.</span>
            </h1>

            <p className="dashboard-description">
              Pick any core section below to pre-fill the AI generator with
              clean CSS or Bootstrap instructions.
            </p>

            <div className="component-grid">
              {LIBRARY_PRESETS.map((preset) => (
                <div className="glass-card welcome-card" key={preset.componentType}>
                  <div>
                    <h3>{preset.componentType}</h3>
                    <p>
                      {preset.framework} · {preset.designStyle}
                    </p>
                    <p style={{ fontSize: "12px" }}>{preset.prompt}</p>
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ alignSelf: "flex-start" }}
                    onClick={() => {
                      setPrefill({ ...preset });
                      handleNavigation("Generate UI");
                    }}
                  >
                    Use This Prompt
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeItem === "My Projects" && (
          <section className="dashboard-page">
            <div className="workspace-eyebrow">
              <Sparkles size={15} />
              PROJECT BUILDER
            </div>

            <h1>
              PixelPilot AI
              <span className="gradient-text"> project bundle.</span>
            </h1>

            <div className="glass-card welcome-card" style={{ maxWidth: "720px" }}>
              <h3>Workspace Summary</h3>
              <div style={{ display: "grid", gap: "12px", margin: "16px 0 22px" }}>
                {[
                  "AI-assisted component workspace active",
                  `${savedComponents.length} reusable components ready in your library`,
                  "Responsive Bootstrap 5 & Custom CSS3 styling modes",
                  "One-click standalone index.html export for static hosting",
                  `Personalized defaults active for ${userName || "Creator"} (${preferredFramework})`
                ].map((line) => (
                  <div
                    key={line}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "#cbd5e1"
                    }}
                  >
                    <CheckCircle2 size={16} color="#2dd4bf" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="primary-button"
                onClick={handleExportCombinedSite}
              >
                <Download size={16} />
                Download Combined index.html
              </button>
            </div>
          </section>
        )}

        {activeItem === "Settings" && (
          <section className="dashboard-page">
            <div className="workspace-eyebrow">
              <Sparkles size={15} />
              PERSONALIZATION
            </div>

            <h1>
              Tailor your
              <span className="gradient-text"> workspace.</span>
            </h1>

            <div className="glass-card welcome-card" style={{ maxWidth: "520px" }}>
              <h3>User Preferences</h3>
              <p>Saved automatically in localStorage for returning visitors.</p>

              <div style={{ display: "grid", gap: "14px", margin: "16px 0 20px" }}>
                <label style={{ display: "grid", gap: "6px", fontSize: "12px" }}>
                  Your Name
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "#171d34",
                      color: "white"
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "12px" }}>
                  Default Styling Framework
                  <select
                    value={preferredFramework}
                    onChange={(e) => setPreferredFramework(e.target.value)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      background: "#171d34",
                      color: "white"
                    }}
                  >
                    <option value="Bootstrap">Bootstrap</option>
                    <option value="HTML & CSS">HTML &amp; CSS</option>
                    <option value="React">React</option>
                  </select>
                </label>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => handleNavigation("Generate UI")}
              >
                Apply &amp; Open Generator
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}

        {activeItem === "Help & Support" && (
          <section className="dashboard-page">
            <div className="workspace-eyebrow">
              <Sparkles size={15} />
              DEPLOYMENT GUIDE
            </div>

            <h1>
              Deploying PixelPilot
              <span className="gradient-text"> online.</span>
            </h1>

            <div className="glass-card welcome-card" style={{ maxWidth: "720px" }}>
              <h3>Recommended Hosting Setup</h3>
              <p>
                1. Put <code>.env</code> in <code>.gitignore</code> before pushing to GitHub.
                <br />
                2. Deploy <code>server/index.js</code> to Render with your API key in Render Environment Variables.
                <br />
                3. Deploy your React frontend (<code>dist/</code>) to Netlify with{" "}
                <code>VITE_API_URL</code> pointing to your Render backend URL.
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={() => handleNavigation("Generate UI")}
              >
                Back to Generator
                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;