import { Home, GraduationCap, Layers, Calendar, Users } from "lucide-react";
import { styles } from "../styles.js";

const ICONS = { hoy: Home, directorio: GraduationCap, grupos: Layers, calendario: Calendar, coaches: Users };

export function NavSwitcher({ nav, setNav, isAdmin }) {
  const items = [["hoy", "Hoy"], ["directorio", "Mis alumnos"], ["grupos", "Mis grupos"], ["calendario", "Calendario"]];
  if (isAdmin) items.push(["coaches", "Coaches"]);
  const activeMap = { grupoDetalle: "grupos", eventoDetalle: "calendario", pagosPendientes: "hoy" };
  const activeNav = activeMap[nav] || nav;
  return (
    <div style={{ ...styles.segmented, overflowX: "auto" }}>
      {items.map(([key, label]) => {
        const Icon = ICONS[key];
        return (
          <button
            key={key}
            style={{ ...styles.segmentBtn, whiteSpace: "nowrap", ...(activeNav === key ? styles.segmentBtnActive : {}) }}
            onClick={() => setNav(key)}
          >
            <Icon size={13} strokeWidth={2.25} style={{ verticalAlign: -2.5, marginRight: 3 }} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
