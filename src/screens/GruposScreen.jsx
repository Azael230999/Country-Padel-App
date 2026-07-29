import { useState } from "react";
import { styles } from "../styles.js";
import { COLORS } from "../constants.js";
import { NavSwitcher } from "../components/NavSwitcher.jsx";
import { EditableRow } from "../components/EditableRow.jsx";

export function GruposScreen({ isAdmin, alumnos, grupos, schedule, onUpdateSchedule, nav, setNav, onSelect, onAdd }) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [nombre, setNombre] = useState("");
  const primerDeporte = Object.keys(grupos)[0] || "";
  const [deporte, setDeporte] = useState(primerDeporte);
  const [categoria, setCategoria] = useState(grupos[primerDeporte]?.[0] || "");
  const [edad, setEdad] = useState("");

  if (alumnos === null) {
    return (
      <div style={styles.content} className="content-safe">
        <div className="spinner" style={styles.spinner} />
      </div>
    );
  }

  const porGrupo = {};
  alumnos.forEach((a) => {
    const key = `${a.deporte} · ${a.categoria}`;
    if (!porGrupo[key]) porGrupo[key] = [];
    porGrupo[key].push(a);
  });
  const grupoKeys = Object.keys(porGrupo).sort();

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.brand}>COUNTRY PADEL</div>
        <div style={styles.titulo}>Mis grupos</div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={{ marginBottom: 10 }}>
          <NavSwitcher nav={nav} setNav={setNav} isAdmin={isAdmin} />
        </div>

        {isAdmin && (
          <>
            <button style={styles.secondaryBtn} onClick={() => setShowNuevo((v) => !v)}>
              {showNuevo ? "Cancelar" : "+ Nuevo alumno de grupo"}
            </button>
            {showNuevo && (
              <div style={{ ...styles.card, marginTop: 10 }}>
                <input style={styles.input} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <div style={{ display: "flex", gap: 6 }}>
                  <select
                    style={styles.select}
                    value={deporte}
                    onChange={(e) => { setDeporte(e.target.value); setCategoria(grupos[e.target.value][0]); }}
                  >
                    {Object.keys(grupos).map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <select style={{ ...styles.select, flex: 1 }} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    {grupos[deporte].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <input style={styles.input} placeholder="Edad" value={edad} onChange={(e) => setEdad(e.target.value)} />
                <button
                  style={{ ...styles.primaryBtn, marginTop: 4 }}
                  disabled={!nombre.trim()}
                  onClick={async () => {
                    const id = await onAdd({ nombre: nombre.trim(), deporte, categoria, edad });
                    setNombre(""); setEdad(""); setShowNuevo(false);
                    if (id) onSelect(id);
                  }}
                >
                  Guardar alumno
                </button>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 18 }}>
          {alumnos.length === 0 && <div style={styles.empty}>{isAdmin ? "Aún no hay alumnos de grupo." : "Todavía no tienes grupos asignados."}</div>}
          {grupoKeys.map((key) => {
            const prog = schedule?.[key] || {};
            return (
            <div key={key}>
              <div style={styles.sesionesLabel}>{key}</div>
              {isAdmin ? (
                <div style={{ ...styles.card, marginTop: 8 }}>
                  <div style={styles.cardLabel}>Horario</div>
                  <EditableRow k="" v={prog.horario || "Tocar para agregar el horario"} onSave={(v) => onUpdateSchedule(key, { horario: v })} />
                  <div style={{ ...styles.cardLabel, marginTop: 8 }}>Plan de entrenamiento</div>
                  <EditableRow k="" v={prog.plan || "Tocar para agregar qué deben trabajar"} onSave={(v) => onUpdateSchedule(key, { plan: v })} multiline />
                </div>
              ) : (
                (prog.horario || prog.plan) && (
                  <div style={{ ...styles.card, marginTop: 8 }}>
                    {prog.horario && (
                      <>
                        <div style={styles.cardLabel}>Horario</div>
                        <p style={{ ...styles.matchNote, marginTop: 0, marginBottom: prog.plan ? 10 : 0 }}>{prog.horario}</p>
                      </>
                    )}
                    {prog.plan && (
                      <>
                        <div style={styles.cardLabel}>Plan de entrenamiento</div>
                        <p style={{ ...styles.matchNote, marginTop: 0 }}>{prog.plan}</p>
                      </>
                    )}
                  </div>
                )
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {porGrupo[key].map((a) =>
                  isAdmin ? (
                    <button key={a.id} onClick={() => onSelect(a.id)} style={styles.row}>
                      <div style={styles.avatar}>{a.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <div style={styles.nombre}>{a.nombre}</div>
                        <div style={styles.meta}>{a.edad ? `${a.edad} años` : "Sin edad"}</div>
                      </div>
                    </button>
                  ) : (
                    <div key={a.id} style={styles.card}>
                      <div style={styles.cardLabel}>{a.nombre}{a.edad ? ` · ${a.edad} años` : ""}</div>
                      {a.descripcion && <p style={styles.matchNote}>{a.descripcion}</p>}
                      {(a.puntos || []).length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          {a.puntos.map((p, i) => (
                            <div key={i} style={styles.puntoRow}>
                              <span style={{ ...styles.prioridadDot, background: p.prioridad === "Alta" ? COLORS.red : p.prioridad === "Media" ? COLORS.amber : COLORS.green }} />
                              <span style={styles.puntoTexto}>{p.texto}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
