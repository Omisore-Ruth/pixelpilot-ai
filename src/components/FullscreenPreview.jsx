import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { id: "tablet", label: "Tablet", icon: Tablet, width: "820px" },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: "390px" }
];

// Full-window preview of a generated component. The page stays inside a
// sandboxed iframe, so its scripts can't reach the app or your login.
function FullscreenPreview({ title, subtitle, html, onClose }) {
  const [device, setDevice] = useState("desktop");
  const closeRef = useRef(null);
  const current = DEVICES.find((d) => d.id === device);

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return createPortal(
    <div className="fullscreen-preview" role="dialog" aria-modal="true" aria-label={`${title} full-screen preview`}>
      <header className="fs-bar">
        <div className="fs-title">
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>

        <div className="fs-devices" role="group" aria-label="Preview size">
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={device === id ? "selected" : ""}
              onClick={() => setDevice(id)}
              aria-pressed={device === id}
              title={label}
            >
              <Icon size={15} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <button type="button" ref={closeRef} className="fs-close" onClick={onClose} aria-label="Close full-screen preview">
          <X size={18} />
          <span>Close</span>
        </button>
      </header>

      <div className={`fs-stage ${device}`}>
        <iframe
          title={`${title} full-screen preview`}
          srcDoc={html}
          sandbox="allow-scripts allow-forms"
          style={{ width: current.width }}
        />
      </div>
    </div>,
    document.body
  );
}

export default FullscreenPreview;
