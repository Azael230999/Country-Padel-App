import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { styles } from "../styles.js";
import { SEMANTIC } from "../constants.js";

const ICONS = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Info };

// Tag de estado — siempre ícono + texto, nunca solo color (regla del
// sistema de diseño). onClick opcional lo vuelve un botón (ej. el chip de
// pago por clase, que se toca para alternar pagada/pendiente).
export function StatusTag({ tone, children, onClick, style }) {
  const Icon = ICONS[tone];
  const { bg, fg } = SEMANTIC[tone];
  const tagStyle = { ...styles.statusTag, background: bg, color: fg, border: "none", ...style };

  if (onClick) {
    return (
      <button type="button" style={{ ...tagStyle, cursor: "pointer", fontFamily: "'Karla', sans-serif" }} onClick={onClick}>
        <Icon size={12} strokeWidth={2.5} />
        {children}
      </button>
    );
  }
  return (
    <span style={tagStyle}>
      <Icon size={12} strokeWidth={2.5} />
      {children}
    </span>
  );
}
