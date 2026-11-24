import logo from "../assets/pixelpilot-logo.webp";
import {
  LayoutDashboard,
  WandSparkles,
  FolderOpen,
  Layers3,
  Bookmark,
  Settings,
  CircleHelp,
  ChevronLeft,
  LogOut,
  Sparkles,
  X
} from "lucide-react";

import "../styles/Sidebar.css";

const navigation = [
  {
    title: "WORKSPACE",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "Generate UI", icon: WandSparkles },
      { label: "My Projects", icon: FolderOpen },
      { label: "Component Library", icon: Layers3 },
      { label: "Saved Components", icon: Bookmark }
    ]
  }
];

function Sidebar({
  activeItem = "Dashboard",
  onNavigate = () => {},
  collapsed = false,
  onToggle = () => {},
  mobileOpen = false,
  onClose = () => {},
  userName = "",
  email = "",
  preferredFramework = "Bootstrap",
  onSignOut = () => {}
}) {
  const handleNavigation = (label) => {
    onNavigate(label);
    onClose();
  };

  const avatarInitial = (userName.trim() || "P").charAt(0).toUpperCase();

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside
        className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${
          mobileOpen ? "sidebar-mobile-open" : ""
        }`}
      >
        <div className="sidebar-brand">
<button
            type="button"
            className="sidebar-logo-button"
            onClick={() => handleNavigation("Dashboard")}
            aria-label="Go to Dashboard"
          >
            <img src={logo} alt="PixelPilot AI" className="sidebar-logo" width="520" height="173" />
          </button>
          <button
            type="button"
            className="mobile-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-navigation">
          {navigation.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-group-title">{group.title}</p>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.label;

                return (
                  <button
                    type="button"
                    key={item.label}
                    className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                    onClick={() => handleNavigation(item.label)}
                    title={collapsed ? item.label : ""}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon size={19} strokeWidth={1.8} />

                    {!collapsed && <span>{item.label}</span>}

                    {isActive && <span className="active-indicator" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-divider" />

          <button
            type="button"
            className={`nav-item ${activeItem === "Settings" ? "nav-item-active" : ""}`}
            onClick={() => handleNavigation("Settings")}
            title={collapsed ? "Settings" : ""}
          >
            <Settings size={19} strokeWidth={1.8} />
            {!collapsed && <span>Settings</span>}
            {activeItem === "Settings" && <span className="active-indicator" />}
          </button>

          <button
            type="button"
            className={`nav-item ${
              activeItem === "Help & Support" ? "nav-item-active" : ""
            }`}
            onClick={() => handleNavigation("Help & Support")}
            title={collapsed ? "Help & Support" : ""}
          >
            <CircleHelp size={19} strokeWidth={1.8} />
            {!collapsed && <span>Help & Support</span>}
            {activeItem === "Help & Support" && <span className="active-indicator" />}
          </button>

          <div className="sidebar-upgrade">
            <div className="upgrade-icon">
              <Sparkles size={18} />
            </div>

            {!collapsed && (
              <>
                <h4>Export Your Site</h4>
                <p>Bundle your saved components into a clean HTML page ready to publish.</p>

                <button
                  type="button"
                  className="upgrade-button"
                  onClick={() => handleNavigation("Saved Components")}
                >
                  Open Saved Library
                </button>
              </>
            )}
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar">{avatarInitial}</div>

            {!collapsed && (
              <div className="profile-details">
                <strong>{userName.trim() || "PixelPilot User"}</strong>
                <span title={email}>{email || `${preferredFramework} Stack`}</span>
              </div>
            )}

            {!collapsed && (
              <button
                type="button"
                className="collapse-button"
                onClick={onSignOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={17} />
              </button>
            )}

            <button
              type="button"
              className="collapse-button"
              onClick={onToggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                size={18}
                className={collapsed ? "chevron-reversed" : ""}
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;