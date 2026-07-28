import { styles } from "../styles.js";

export function NavSwitcher({ nav, setNav, isAdmin }) {
  const items = [["directorio", "Mis alumnos"], ["grupos", "Mis grupos"]];
  if (isAdmin) items.push(["coaches", "Coaches"]);
  return (
    <div style={styles.segmented}>
      {items.map(([key, label]) => (
        <button
          key={key}
          style={{ ...styles.segmentBtn, ...(nav === key || (key === "grupos" && nav === "grupoDetalle") ? styles.segmentBtnActive : {}) }}
          onClick={() => setNav(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
