import { useState } from "react";
import { styles } from "../styles.js";
import { COLORS } from "../constants.js";
import { EditableRow } from "../components/EditableRow.jsx";

export function AlumnoGrupoDetalle({ alumno, academyCoaches, groupAssignments, grupos, onBack, onUpdate, onDelete }) {
  const [nuevoPuntoTexto, setNuevoPuntoTexto] = useState("");
  const [nuevoPuntoPrioridad, setNuevoPuntoPrioridad] = useState("Media");

  if (!alumno) {
    return (
      <div style={styles.content} className="content-safe">
        <div className="spinner" style={styles.spinner} />
      </div>
    );
  }

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.headerTopRow}>
          <button style={styles.backBtn} onClick={onBack}>← Mis grupos</button>
        </div>
        <div style={styles.playerRow}>
          <div style={styles.avatarBig}>{alumno.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
          <div style={{ flex: 1 }}>
            <div style={styles.playerName}>{alumno.nombre}</div>
            <div style={styles.playerMeta}>{alumno.deporte} · {alumno.categoria}</div>
          </div>
        </div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={styles.section}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Datos</div>
            <EditableRow k="Nombre" v={alumno.nombre} onSave={(v) => onUpdate({ nombre: v })} />
            <EditableRow k="Edad" v={alumno.edad} onSave={(v) => onUpdate({ edad: v })} />
            <EditableRow k="" v={alumno.descripcion || "Tocar para agregar una descripción"} onSave={(v) => onUpdate({ descripcion: v })} multiline />
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Grupo</div>
            <div style={{ display: "flex", gap: 6 }}>
              <select
                style={styles.select}
                value={alumno.deporte}
                onChange={(e) => onUpdate({ deporte: e.target.value, categoria: grupos[e.target.value][0] })}
              >
                {Object.keys(grupos).map((d) => <option key={d}>{d}</option>)}
              </select>
              <select style={{ ...styles.select, flex: 1 }} value={alumno.categoria} onChange={(e) => onUpdate({ categoria: e.target.value })}>
                {(grupos[alumno.deporte] || [alumno.categoria]).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Coaches con acceso</div>
            {(() => {
              const label = `${alumno.deporte} · ${alumno.categoria}`;
              const uids = (groupAssignments && groupAssignments[label]) || [];
              const nombres = uids.map((uid) => {
                const c = (academyCoaches || []).find((c) => c.uid === uid);
                return c ? c.nombre || c.email || uid : uid;
              });
              return nombres.length > 0 ? (
                <p style={styles.backupHint}>{nombres.join(", ")}</p>
              ) : (
                <p style={styles.backupHint}>Nadie todavía — asígnalo desde "Coaches → Asignación de grupos".</p>
              );
            })()}
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Lo que necesita trabajar</div>
            {(alumno.puntos || []).map((p, i) => (
              <div key={i} style={styles.puntoRow}>
                <span style={{ ...styles.prioridadDot, background: p.prioridad === "Alta" ? COLORS.red : p.prioridad === "Media" ? COLORS.amber : COLORS.green }} />
                <span style={{ ...styles.puntoTexto, flex: 1 }}>{p.texto}</span>
                <button
                  style={styles.deleteBtn}
                  onClick={() => onUpdate({ puntos: alumno.puntos.filter((_, j) => j !== i) })}
                  aria-label="Eliminar punto"
                >
                  ×
                </button>
              </div>
            ))}
            <div style={styles.miniForm}>
              <input style={styles.input} placeholder="Nuevo punto por trabajar" value={nuevoPuntoTexto} onChange={(e) => setNuevoPuntoTexto(e.target.value)} />
              <div style={{ display: "flex", gap: 6 }}>
                <select style={styles.select} value={nuevoPuntoPrioridad} onChange={(e) => setNuevoPuntoPrioridad(e.target.value)}>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
                <button
                  style={{ ...styles.addBtn, flex: 1 }}
                  disabled={!nuevoPuntoTexto.trim()}
                  onClick={() => {
                    onUpdate({ puntos: [...(alumno.puntos || []), { texto: nuevoPuntoTexto.trim(), prioridad: nuevoPuntoPrioridad }] });
                    setNuevoPuntoTexto("");
                  }}
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <button
            style={styles.dangerBtn}
            onClick={() => {
              if (window.confirm(`¿Eliminar a ${alumno.nombre} de los grupos?`)) onDelete();
            }}
          >
            Eliminar alumno de grupo
          </button>
        </div>
      </div>
    </>
  );
}
