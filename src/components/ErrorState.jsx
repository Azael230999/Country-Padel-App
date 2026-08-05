import { AlertCircle, RefreshCw } from "lucide-react";
import { styles } from "../styles.js";
import { COLORS } from "../constants.js";

// Estado de error simple para superficies que dependen de un fetch a
// Firebase. "Reintentar" recarga la página en vez de re-suscribirse — no
// tocamos la capa de datos, solo la presentación.
export function ErrorState({ text = "No se pudo cargar la información." }) {
  return (
    <div style={{ textAlign: "center", padding: "34px 16px" }}>
      <AlertCircle size={26} strokeWidth={1.75} color={COLORS.red} style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 13, color: COLORS.ink, lineHeight: 1.5, marginBottom: 14 }}>{text}</div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{ ...styles.secondaryBtn, width: "auto", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <RefreshCw size={14} strokeWidth={2.25} />
        Reintentar
      </button>
    </div>
  );
}
