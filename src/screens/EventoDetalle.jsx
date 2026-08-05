import { styles } from "../styles.js";
import { COLORS } from "../constants.js";
import { EditableRow } from "../components/EditableRow.jsx";
import { SkeletonCard } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

export function EventoDetalle({ evento, coaches, saveError, onBack, onUpdate, onDelete }) {
  if (!evento || !coaches) {
    return (
      <div style={styles.content} className="content-safe">
        {saveError ? <ErrorState text="No se pudo cargar el evento." /> : <SkeletonCard lines={3} />}
      </div>
    );
  }

  const todos = evento.audienceUids?.length === coaches.length;

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.headerTopRow}>
          <button style={styles.backBtn} onClick={onBack}>← Calendario</button>
        </div>
        <div style={styles.playerRow}>
          <div style={{ flex: 1 }}>
            <div style={styles.playerName}>{evento.titulo}</div>
            <div style={styles.playerMeta}>{evento.fecha}{evento.hora ? ` · ${evento.hora}` : ""}</div>
          </div>
        </div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={styles.section}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Datos</div>
            <EditableRow k="Título" v={evento.titulo} onSave={(v) => onUpdate({ titulo: v })} />
            <EditableRow k="Hora" v={evento.hora} onSave={(v) => onUpdate({ hora: v })} />
            <EditableRow k="Lugar" v={evento.lugar} onSave={(v) => onUpdate({ lugar: v })} />
            <EditableRow k="" v={evento.descripcion} onSave={(v) => onUpdate({ descripcion: v })} multiline />
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Fecha</div>
            <input style={styles.input} type="date" value={evento.fecha} onChange={(e) => onUpdate({ fecha: e.target.value })} />
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>¿Para quién es?</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <button
                style={{ ...styles.pagoChip, background: todos ? COLORS.clay : "transparent", color: todos ? COLORS.card : COLORS.muted, border: todos ? "none" : `1.5px solid ${COLORS.border}` }}
                onClick={() => onUpdate({ audienceUids: coaches.map((c) => c.uid), audienceLabel: "Todos los coaches" })}
              >
                Todos los coaches
              </button>
              {coaches.map((c) => {
                const activo = !todos && (evento.audienceUids || []).includes(c.uid);
                return (
                  <button
                    key={c.uid}
                    style={{ ...styles.pagoChip, background: activo ? COLORS.clay : "transparent", color: activo ? COLORS.card : COLORS.muted, border: activo ? "none" : `1.5px solid ${COLORS.border}` }}
                    onClick={() => {
                      const actuales = todos ? [] : evento.audienceUids || [];
                      const next = actuales.includes(c.uid) ? actuales.filter((u) => u !== c.uid) : [...actuales, c.uid];
                      const nextLabel = coaches.filter((x) => next.includes(x.uid)).map((x) => x.nombre || x.email || x.uid).join(", ");
                      onUpdate({ audienceUids: next, audienceLabel: nextLabel });
                    }}
                  >
                    {c.nombre || c.email || c.uid}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            style={styles.dangerBtn}
            onClick={() => {
              if (window.confirm(`¿Eliminar el evento "${evento.titulo}"?`)) onDelete();
            }}
          >
            Eliminar evento
          </button>
        </div>
      </div>
    </>
  );
}
