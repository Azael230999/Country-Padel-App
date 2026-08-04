import { COLORS } from "../constants.js";

export function EmptyState({ Icon, text, cta }) {
  return (
    <div style={{ textAlign: "center", padding: "34px 16px" }}>
      <Icon size={26} strokeWidth={1.75} color={COLORS.muted} style={{ marginBottom: 10 }} />
      <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>{text}</div>
      {cta}
    </div>
  );
}
