import { useState } from "react";
import { styles } from "../styles.js";
import { EditableRow } from "../components/EditableRow.jsx";
import { PuntoRow, NuevoPuntoForm } from "../components/Puntos.jsx";

export function AlumnoGrupoDetalle({ alumno, academyCoaches, groupAssignments, grupos, onBack, onUpdate, onDelete }) {
  const [copiado, setCopiado] = useState(false);
  const copiarLink = () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}?alumnoGrupo=${alumno.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

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
            <EditableRow k="" v={alumno.descripcion} onSave={(v) => onUpdate({ descripcion: v })} multiline />
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
              <PuntoRow key={i} punto={p} onDelete={() => onUpdate({ puntos: alumno.puntos.filter((_, j) => j !== i) })} />
            ))}
            <NuevoPuntoForm onAdd={(punto) => onUpdate({ puntos: [...(alumno.puntos || []), punto] })} />
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Vista para el alumno</div>
            <p style={styles.backupHint}>Comparte este link para que {alumno.nombre.split(" ")[0]} vea su horario, plan de entrenamiento y lo que necesita trabajar — sin poder editar nada.</p>
            <button style={styles.addBtn} onClick={copiarLink}>{copiado ? "¡Copiado!" : "Copiar link para el alumno"}</button>
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
