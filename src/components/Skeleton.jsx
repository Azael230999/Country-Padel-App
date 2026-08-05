import { styles } from "../styles.js";
import { COLORS, SPACING } from "../constants.js";

// Bloque base — pulso simple, sin animación de "shimmer" para mantenerlo
// ligero. El color reusa COLORS.border, que ya es el tono neutro de líneas
// divisorias en toda la app.
export function SkeletonBlock({ width = "100%", height = 14, radius = 6, style }) {
  return <div className="skeleton-pulse" style={{ width, height, borderRadius: radius, background: COLORS.border, flexShrink: 0, ...style }} />;
}

// Imita la forma de una fila tipo styles.row (avatar + nombre + meta).
export function SkeletonRow() {
  return (
    <div style={{ ...styles.row, cursor: "default" }}>
      <SkeletonBlock width={40} height={40} radius={999} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <SkeletonBlock width="55%" height={13} />
        <SkeletonBlock width="30%" height={11} />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}

// Imita la forma de una styles.card con un label + un par de líneas.
export function SkeletonCard({ lines = 2 }) {
  return (
    <div style={styles.card}>
      <SkeletonBlock width={90} height={10} style={{ marginBottom: SPACING.sm }} />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock key={i} width={i === lines - 1 ? "65%" : "100%"} height={13} style={{ marginBottom: i === lines - 1 ? 0 : 8 }} />
      ))}
    </div>
  );
}
