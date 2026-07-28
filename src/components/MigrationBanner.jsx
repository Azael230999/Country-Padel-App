import { useState } from "react";
import { styles } from "../styles.js";

export function MigrationBanner({ count, onMigrate, onDismiss }) {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ ...styles.card, marginBottom: 10 }}>
      <div style={styles.cardLabel}>Datos de este iPhone</div>
      <p style={styles.backupHint}>
        Encontramos {count} alumno{count !== 1 ? "s" : ""} guardado{count !== 1 ? "s" : ""} en este dispositivo, de antes de usar la nube. ¿Los subimos a tu cuenta?
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{ ...styles.addBtn, flex: 1 }}
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await onMigrate();
            setLoading(false);
          }}
        >
          {loading ? "Subiendo…" : "Sí, subir"}
        </button>
        <button style={{ ...styles.secondaryBtnSmall, flex: 1 }} onClick={onDismiss} disabled={loading}>
          Ignorar
        </button>
      </div>
    </div>
  );
}
