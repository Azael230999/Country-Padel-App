import { styles } from "../styles.js";

export function NavSwitcher({ nav, setNav, isAdmin }) {
  const items = [["hoy", "Hoy"], ["directorio", "Mis alumnos"], ["grupos", "Mis grupos"], ["calendario", "Calendario"]];
  if (isAdmin) items.push(["coaches", "Coaches"]);
  const activeMap = { grupoDetalle: "grupos", eventoDetalle: "calendario", pagosPendientes: "hoy" };
  const activeNav = activeMap[nav] || nav;
  return (
    <div style={{ ...styles.segmented, overflowX: "auto" }}>
      {items.map(([key, label]) => (
        <button
          key={key}
          style={{ ...styles.segmentBtn, whiteSpace: "nowrap", ...(activeNav === key ? styles.segmentBtnActive : {}) }}
          onClick={() => setNav(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
