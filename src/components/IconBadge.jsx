import { COLORS } from "../constants.js";

export function IconBadge({ Icon }) {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 9, background: "rgba(214,178,62,0.16)", color: COLORS.clay, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={15} strokeWidth={2.25} />
    </div>
  );
}
