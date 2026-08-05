import { useState, useRef } from "react";
import { Clock, ClipboardList, ChevronDown, Layers } from "lucide-react";
import { styles } from "../styles.js";
import { COLORS } from "../constants.js";
import { NavSwitcher } from "../components/NavSwitcher.jsx";
import { EditableRow } from "../components/EditableRow.jsx";
import { PuntoRow } from "../components/Puntos.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { IconBadge } from "../components/IconBadge.jsx";
import { SkeletonList } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

export function GruposScreen({ isAdmin, alumnos, grupos, schedule, onUpdateSchedule, saveError, nav, setNav, onSelect, onAdd, onImport }) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [abiertos, setAbiertos] = useState({});
  const [nombre, setNombre] = useState("");
  const primerDeporte = Object.keys(grupos)[0] || "";
  const [deporte, setDeporte] = useState(primerDeporte);
  const [categoria, setCategoria] = useState(grupos[primerDeporte]?.[0] || "");
  const [edad, setEdad] = useState("");
  const [importError, setImportError] = useState("");
  const [importOk, setImportOk] = useState("");
  const fileInputRef = useRef(null);

  const importarAlumnos = (file) => {
    setImportError("");
    setImportOk("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("Formato inválido");
        if (!window.confirm(`Se agregarán ${data.length} alumnos nuevos a sus grupos correspondientes. ¿Continuar?`)) return;
        await onImport(data);
        setImportOk(`${data.length} alumnos importados.`);
      } catch (e) {
        setImportError("El archivo no es un JSON válido de alumnos de grupo.");
      }
    };
    reader.readAsText(file);
  };

  if (alumnos === null) {
    return (
      <>
        <div style={styles.header} className="header-safe">
          <div style={styles.brand}>COUNTRY PADEL</div>
          <div style={styles.titulo}>Mis grupos</div>
          <div style={{ marginTop: 12, marginBottom: 4 }}>
            <NavSwitcher nav={nav} setNav={setNav} isAdmin={isAdmin} />
          </div>
        </div>
        <div style={styles.content} className="content-safe">
          {saveError ? <ErrorState text="No se pudieron cargar los grupos." /> : <SkeletonList rows={4} />}
        </div>
      </>
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
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => setShowNuevo((v) => !v)}>
                {showNuevo ? "Cancelar" : "+ Nuevo alumno de grupo"}
              </button>
              <button style={{ ...styles.secondaryBtnSmall, flex: "0 0 auto", padding: "9px 14px" }} onClick={() => fileInputRef.current?.click()}>
                Importar
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importarAlumnos(file);
                  e.target.value = "";
                }}
              />
            </div>
            {importError && <div style={styles.importError}>{importError}</div>}
            {importOk && <div style={{ fontSize: 12, color: COLORS.green, marginTop: 6 }}>{importOk}</div>}
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

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          {alumnos.length === 0 && (
            <EmptyState Icon={Layers} text={isAdmin ? "Aún no hay alumnos de grupo — agrega el primero arriba." : "Todavía no tienes grupos asignados."} />
          )}
          {grupoKeys.map((key) => {
            const prog = schedule?.[key] || {};
            const tieneInfo = Boolean(prog.horario || prog.plan);
            const abierto = Boolean(abiertos[key]);
            const cantidad = porGrupo[key].length;
            return (
            <div key={key}>
              <button
                onClick={() => setAbiertos((prev) => ({ ...prev, [key]: !prev[key] }))}
                style={{ display: "flex", alignItems: "center", width: "100%", background: styles.card.background, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", fontFamily: "'Karla', sans-serif", textAlign: "left" }}
              >
                <span style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink, flex: 1 }}>{key}</span>
                <span style={{ fontSize: 11.5, color: COLORS.muted, marginRight: 8 }}>{cantidad} alumno{cantidad !== 1 ? "s" : ""}</span>
                {tieneInfo && <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.ball, marginRight: 8 }} />}
                <ChevronDown size={16} strokeWidth={2.5} color={COLORS.muted} style={{ transform: abierto ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
              </button>
              {abierto && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {isAdmin ? (
                    <div style={{ ...styles.card, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <IconBadge Icon={Clock} />
                        <div style={{ flex: 1 }}>
                          <div style={styles.cardLabel}>Horario</div>
                          <EditableRow k="" v={prog.horario} onSave={(v) => onUpdateSchedule(key, { horario: v })} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <IconBadge Icon={ClipboardList} />
                        <div style={{ flex: 1 }}>
                          <div style={styles.cardLabel}>Plan de entrenamiento</div>
                          <EditableRow k="" v={prog.plan} onSave={(v) => onUpdateSchedule(key, { plan: v })} multiline />
                        </div>
                      </div>
                    </div>
                  ) : (
                    tieneInfo && (
                      <div style={{ ...styles.card, display: "flex", flexDirection: "column", gap: 12 }}>
                        {prog.horario && (
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <IconBadge Icon={Clock} />
                            <div style={{ flex: 1 }}>
                              <div style={styles.cardLabel}>Horario</div>
                              <p style={{ ...styles.matchNote, marginTop: 0 }}>{prog.horario}</p>
                            </div>
                          </div>
                        )}
                        {prog.plan && (
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <IconBadge Icon={ClipboardList} />
                            <div style={{ flex: 1 }}>
                              <div style={styles.cardLabel}>Plan de entrenamiento</div>
                              <p style={{ ...styles.matchNote, marginTop: 0, whiteSpace: "pre-wrap" }}>{prog.plan}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
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
                            {a.puntos.map((p, i) => <PuntoRow key={i} punto={p} />)}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
