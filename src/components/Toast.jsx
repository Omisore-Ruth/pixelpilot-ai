import { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

// Small confirmation that slides up from the bottom and leaves on its own.
function Toast({ message, actionLabel, onAction, onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="toast" role="status">
      <CheckCircle2 size={17} className="toast-icon" />
      <span>{message}</span>
      {actionLabel && (
        <button type="button" className="toast-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;
