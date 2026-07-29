import { useState } from "react";
import { styles } from "../styles.js";
import { COLORS, TIROS } from "../constants.js";

function prioridadColor(prioridad) {
  return prioridad === "Alta" ? COLORS.red : prioridad === "Media" ? COLORS.amber : COLORS.green;
}

// Los puntos guardados antes de este cambio solo tienen { texto, prioridad };
// se muestran igual que siempre para no perder lo ya escrito.
export function PuntoRow({ punto, onDelete }) {
  return (
    <div style={styles.puntoRow}>
      <span style={{ ...styles.prioridadDot, background: prioridadColor(punto.prioridad) }} />
      <div style={{ flex: 1 }}>
        {punto.categoria ? (
          <>
            <div style={styles.puntoLabel}>{punto.categoria}</div>
            {punto.detalle && <div style={styles.puntoDetalle}>{punto.detalle}</div>}
          </>
        ) : (
          <span style={styles.puntoTexto}>{punto.texto}</span>
        )}
      </div>
      {onDelete && (
        <button style={styles.deleteBtn} onClick={onDelete} aria-label="Eliminar punto">×</button>
      )}
    </div>
  );
}

export function NuevoPuntoForm({ onAdd }) {
  const [categoria, setCategoria] = useState(TIROS[0]);
  const [detalle, setDetalle] = useState("");
  const [prioridad, setPrioridad] = useState("Media");

  return (
    <div style={styles.miniForm}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {TIROS.map((t) => {
          const activo = categoria === t;
          return (
            <button
              key={t}
              style={{
                ...styles.pagoChip,
                background: activo ? COLORS.clay : "transparent",
                color: activo ? COLORS.card : COLORS.muted,
                border: activo ? "none" : `1.5px solid ${COLORS.border}`,
              }}
              onClick={() => setCategoria(t)}
            >
              {t}
            </button>
          );
        })}
      </div>
      <input
        style={styles.input}
        placeholder="Detalle específico (ej. el toss se va muy atrás)"
        value={detalle}
        onChange={(e) => setDetalle(e.target.value)}
      />
      <div style={{ display: "flex", gap: 6 }}>
        <select style={styles.select} value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option>Alta</option>
          <option>Media</option>
          <option>Baja</option>
        </select>
        <button
          style={{ ...styles.addBtn, flex: 1 }}
          disabled={!detalle.trim()}
          onClick={() => {
            onAdd({ categoria, detalle: detalle.trim(), prioridad });
            setDetalle("");
          }}
        >
          + Agregar
        </button>
      </div>
    </div>
  );
}
