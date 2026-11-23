import { useEffect, useState } from "react";
import { Bookmark, Menu, Settings } from "lucide-react";

import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import GeneratorPage from "./pages/GeneratorPage";
import SavedComponentsPage from "./pages/SavedComponentsPage";
import ComponentLibraryPage from "./pages/ComponentLibraryPage";
import ProjectsPage from "./pages/ProjectsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";

import { STARTER_COMPONENTS } from "./data/starters";
import { FRAMEWORKS, MAX_SAVED, makeDraft } from "./data/options";
import { generateComponent } from "./lib/api";
import { readLegacyString, readStorage, writeStorage } from "./lib/storage";
import { useHashRoute } from "./hooks/useHashRoute";

import "./App.css";

const STORAGE = {
  saved: "pixelpilot_saved",
  // New key: the old one defaulted every visitor to "Ruth".
  name: "pixelpilot_display_name",
  framework: "pixelpilot_framework"
};

function loadSavedComponents() {
  const stored = readStorage(STORAGE.saved, null);
  // Only seed the starter examples on a first visit. If the user has deleted
  // items (even all of them), respect that instead of adding them back.
  if (!Array.isArray(stored)) return STARTER_COMPONENTS;
  return stored.filter((item) => item && item.id != null && typeof item.code === "string");
}

function loadFramework() {
  const value = readLegacyString(STORAGE.framework, "Bootstrap");
  return FRAMEWORKS.includes(value) ? value : "Bootstrap";
}

function App() {
  const [activeItem, navigate] = useHashRoute();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [userName, setUserName] = useState(() => readStorage(STORAGE.name, ""));
  const [preferredFramework, setPreferredFramework] = useState(loadFramework);
  const [savedComponents, setSavedComponents] = useState(loadSavedComponents);

  // The generator form lives here so a half-typed prompt survives switching pages.
  const [draft, setDraft] = useState(() => makeDraft(loadFramework()));
  const [generated, setGenerated] = useState(() => loadSavedComponents()[0] ?? null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [libraryNotice, setLibraryNotice] = useState("");

  useEffect(() => writeStorage(STORAGE.name, userName), [userName]);
  useEffect(() => writeStorage(STORAGE.framework, preferredFramework), [preferredFramework]);
  useEffect(() => writeStorage(STORAGE.saved, savedComponents), [savedComponents]);

  const handleNavigation = (item) => {
    navigate(item);
    setMobileOpen(false);
  };

  const handleFrameworkChange = (framework) => {
    setPreferredFramework(framework);
    setDraft((prev) => ({ ...prev, framework }));
  };

  const handleGenerate = async (settings) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const data = await generateComponent(settings);
      // Use the values the server actually used, in case it normalised any.
      const item = {
        prompt: settings.prompt,
        componentType: data.componentType,
        framework: data.framework,
        designStyle: data.designStyle,
        primaryColor: data.primaryColor,
        code: data.code,
        id: Date.now()
      };

      setGenerated(item);
      if (savedComponents.length >= MAX_SAVED) {
        setLibraryNotice(
          `Your library holds up to ${MAX_SAVED} components, so the oldest one was removed. Export anything you want to keep.`
        );
      }
      setSavedComponents((prev) => [item, ...prev].slice(0, MAX_SAVED));
    } catch (error) {
      setErrorMessage(error.message || "Unable to generate component. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemove = (id) => {
    setSavedComponents((prev) => prev.filter((c) => c.id !== id));
    if (generated?.id === id) setGenerated(null);
  };

  const pageTitle = activeItem;

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
            <h2>{pageTitle}</h2>
            <p>
              {userName ? `Welcome back, ${userName}` : "Welcome"} · Default stack:{" "}
              {preferredFramework}
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon-button"
              aria-label="Saved Components"
              title="Saved Components"
              onClick={() => handleNavigation("Saved Components")}
            >
              <Bookmark size={19} />
            </button>

            <button
              type="button"
              className="header-icon-button"
              aria-label="Settings"
              title="Settings"
              onClick={() => handleNavigation("Settings")}
            >
              <Settings size={19} />
            </button>
          </div>
        </header>

        {activeItem === "Dashboard" && (
          <DashboardPage
            userName={userName}
            framework={preferredFramework}
            savedCount={savedComponents.length}
            navigate={handleNavigation}
          />
        )}

        {activeItem === "Generate UI" && (
          <GeneratorPage
            draft={draft}
            onDraftChange={(patch) => setDraft((prev) => ({ ...prev, ...patch }))}
            onReset={() => setDraft({ ...makeDraft(preferredFramework), prompt: "" })}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            generated={generated}
            error={errorMessage}
            onDismissError={() => setErrorMessage("")}
          />
        )}

        {activeItem === "Saved Components" && (
          <SavedComponentsPage
            items={savedComponents}
            onOpen={(item) => {
              setGenerated(item);
              handleNavigation("Generate UI");
            }}
            onRemove={handleRemove}
            navigate={handleNavigation}
            notice={libraryNotice}
            onDismissNotice={() => setLibraryNotice("")}
          />
        )}

        {activeItem === "Component Library" && (
          <ComponentLibraryPage
            onUsePreset={(preset) => {
              setDraft({ ...makeDraft(preferredFramework), ...preset });
              handleNavigation("Generate UI");
            }}
          />
        )}

        {activeItem === "My Projects" && (
          <ProjectsPage
            savedCount={savedComponents.length}
            userName={userName}
            framework={preferredFramework}
            navigate={handleNavigation}
          />
        )}

        {activeItem === "Settings" && (
          <SettingsPage
            userName={userName}
            onUserNameChange={setUserName}
            framework={preferredFramework}
            onFrameworkChange={handleFrameworkChange}
            navigate={handleNavigation}
          />
        )}

        {activeItem === "Help & Support" && <HelpPage navigate={handleNavigation} />}
      </main>
    </div>
  );
}

export default App;
