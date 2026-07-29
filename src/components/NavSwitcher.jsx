import { styles } from "../styles.js";

export function NavSwitcher({ nav, setNav, isAdmin }) {
  const items = [["directorio", "Mis alumnos"], ["grupos", "Mis grupos"], ["calendario", "Calendario"]];
  if (isAdmin) items.push(["coaches", "Coaches"]);
  const activeMap = { grupoDetalle: "grupos", eventoDetalle: "calendario" };
  const activeNav = activeMap[nav] || nav;
  return (
    <div style={styles.segmented}>
      {items.map(([key, label]) => (
        <button
          key={key}
          style={{ ...styles.segmentBtn, ...(activeNav === key ? styles.segmentBtnActive : {}) }}
          onClick={() => setNav(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
