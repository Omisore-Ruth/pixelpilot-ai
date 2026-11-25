import { useCallback, useEffect, useState } from "react";
import { Bookmark, Menu, Settings } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Pixie from "./components/Pixie";
import Toast from "./components/Toast";
import DashboardPage from "./pages/DashboardPage";
import GeneratorPage from "./pages/GeneratorPage";
import SavedComponentsPage from "./pages/SavedComponentsPage";
import ComponentLibraryPage from "./pages/ComponentLibraryPage";
import ProjectsPage from "./pages/ProjectsPage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";

import { FRAMEWORKS, makeDraft } from "./data/options";
import { generateComponent, refineComponent } from "./lib/api";
import { readLegacyString, readStorage, writeStorage } from "./lib/storage";
import { supabase } from "./lib/supabase";
import { useHashRoute } from "./hooks/useHashRoute";
import { useLibrary } from "./hooks/useLibrary";

import "./App.css";

const PIXIE_WELCOME_KEY = "pixelpilot_pixie_welcome";

const FRAMEWORK_KEY = "pixelpilot_framework";

function loadFramework() {
  const value = readLegacyString(FRAMEWORK_KEY, "Bootstrap");
  return FRAMEWORKS.includes(value) ? value : "Bootstrap";
}

function Workspace({ user, welcomeOnMount = false }) {
  const [activeItem, navigate] = useHashRoute();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [userName, setUserName] = useState(() => (user.user_metadata?.full_name || "").trim());
  const [preferredFramework, setPreferredFramework] = useState(loadFramework);
  // Saved components and projects (online in Supabase, or this browser as a fallback).
  const library = useLibrary(user.id);
  const savedComponents = library.components;
  const [pixieWelcome, setPixieWelcome] = useState(() => readStorage(PIXIE_WELCOME_KEY, true));

  // The generator form lives here so a half-typed prompt survives switching pages.
  const [draft, setDraft] = useState(() => makeDraft(loadFramework()));
  // Which saved component the preview shows. undefined = "the newest one".
  const [selectedId, setSelectedId] = useState(undefined);
  const generated =
    selectedId === undefined
      ? savedComponents[0] ?? null
      : savedComponents.find((c) => c.id === selectedId) ?? null;
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  useEffect(() => writeStorage(FRAMEWORK_KEY, preferredFramework), [preferredFramework]);
  useEffect(() => writeStorage(PIXIE_WELCOME_KEY, pixieWelcome), [pixieWelcome]);

  // Saves the display name to the user's Supabase account.
  const handleSaveName = async (name) => {
    const clean = name.trim().slice(0, 40);
    const { error } = await supabase.auth.updateUser({ data: { full_name: clean } });
    if (error) throw error;
    setUserName(clean);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

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
      const item = await library.addComponent({
        prompt: settings.prompt,
        componentType: data.componentType,
        framework: data.framework,
        designStyle: data.designStyle,
        primaryColor: data.primaryColor,
        code: data.code
      });

      setSelectedId(item.id);
      setToast({
        id: item.id,
        message: `${item.componentType} saved to your library`,
        actionLabel: "View",
        onAction: () => handleNavigation("Saved Components")
      });
    } catch (error) {
      setErrorMessage(error.message || "Unable to generate component. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemove = async (id) => {
    await library.deleteComponent(id);
    if (generated?.id === id) setSelectedId(null);
  };

  const openInPreview = (item) => {
    setSelectedId(item.id);
    setErrorMessage("");
    handleNavigation("Generate UI");
  };

  // Refine with AI: update the current component, with an Undo in the toast.
  const handleRefine = async (instruction) => {
    const target = generated;
    const data = await refineComponent({
      code: target.code,
      instruction,
      framework: target.framework,
      componentType: target.componentType,
      primaryColor: target.primaryColor
    });
    const previousCode = target.code;
    await library.updateComponent(target.id, { code: data.code });
    setToast({
      id: `refine-${Date.now()}`,
      message: "Change applied",
      actionLabel: "Undo",
      duration: 8000,
      onAction: () => library.updateComponent(target.id, { code: previousCode })
    });
  };

  const handleSaveCode = (code) => library.updateComponent(generated.id, { code });

  const handleDeleteCurrent = async () => {
    const name = generated.componentType;
    await handleRemove(generated.id);
    setToast({ id: `del-${Date.now()}`, message: `${name} deleted` });
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
        email={user.email}
        preferredFramework={preferredFramework}
        onSignOut={handleSignOut}
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
            projects={library.projects}
            onAssignProject={(projectId) => library.assignToProject(generated.id, projectId)}
            onCreateProject={library.addProject}
            onSaveCode={handleSaveCode}
            onRefine={handleRefine}
            onDelete={handleDeleteCurrent}
            loading={library.loading}
          />
        )}

        {activeItem === "Saved Components" && (
          <SavedComponentsPage
            key={library.loading ? "loading" : "ready"}
            items={savedComponents}
            projects={library.projects}
            loading={library.loading}
            onOpen={openInPreview}
            onRemove={handleRemove}
            navigate={handleNavigation}
            notice={library.notice}
            onDismissNotice={library.dismissNotice}
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
            library={library}
            onOpen={openInPreview}
            navigate={handleNavigation}
          />
        )}

        {activeItem === "Settings" && (
          <SettingsPage
            userName={userName}
            email={user.email}
            onSaveName={handleSaveName}
            pixieWelcome={pixieWelcome}
            onPixieWelcomeChange={setPixieWelcome}
            framework={preferredFramework}
            onFrameworkChange={handleFrameworkChange}
            navigate={handleNavigation}
          />
        )}

        {activeItem === "Help & Support" && <HelpPage navigate={handleNavigation} />}
      </main>

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          actionLabel={toast.actionLabel}
          duration={toast.duration}
          onAction={() => {
            closeToast();
            toast.onAction?.();
          }}
          onClose={closeToast}
        />
      )}

      <Pixie
        userName={userName}
        page={activeItem}
        navigate={handleNavigation}
        welcomeOnMount={welcomeOnMount && pixieWelcome}
      />
    </div>
  );
}

export default Workspace;
