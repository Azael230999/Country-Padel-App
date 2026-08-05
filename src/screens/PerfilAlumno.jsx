import { useState, useRef } from "react";
import { User, Target, CalendarCheck, Trophy, StickyNote } from "lucide-react";
import { styles } from "../styles.js";
import { COLORS, fmt, formatNivel } from "../constants.js";
import { EditableRow } from "../components/EditableRow.jsx";
import { PuntoRow, NuevoPuntoForm } from "../components/Puntos.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { StatusTag } from "../components/StatusTag.jsx";

const TAB_ICONS = { perfil: User, entrenamiento: Target, asistencia: CalendarCheck, partidos: Trophy, notas: StickyNote };

export function PerfilAlumno({ alumno, tab, setTab, onBack, onUpdate, onDelete, readOnly = false, coachProfile = null }) {
  const restantes = alumno.paquete.finalizado ? 0 : alumno.paquete.total - alumno.paquete.usadas;
  const modalidad = alumno.modalidad || "paquete";
  const clasesPagadas = alumno.clasesPagadas || [];
  const clasesOrdenadas = [...alumno.asistencias].sort().reverse();
  const pagadasTotal = clasesOrdenadas.filter((d) => clasesPagadas.includes(d)).length;
  const pendientesTotal = clasesOrdenadas.length - pagadasTotal;

  const removeAt = (listKey, index) => {
    onUpdate({ [listKey]: alumno[listKey].filter((_, i) => i !== index) });
  };

  // --- Entrenamiento form state ---
  const [nuevaSesionEnfoque, setNuevaSesionEnfoque] = useState("");
  const [nuevaSesionEjercicios, setNuevaSesionEjercicios] = useState("");
  const [nuevoObjTexto, setNuevoObjTexto] = useState("");
  const [nuevoObjPlazo, setNuevoObjPlazo] = useState("Corto plazo");
  const [nuevoObjFecha, setNuevoObjFecha] = useState("");

  // --- Partidos form state ---
  const [pFecha, setPFecha] = useState("");
  const [pRival, setPRival] = useState("");
  const [pResultado, setPResultado] = useState("");
  const [pResu, setPResu] = useState("W");
  const [pTags, setPTags] = useState("");
  const [pNota, setPNota] = useState("");

  // --- Notas form state ---
  const [nAutor, setNAutor] = useState("");
  const [nTexto, setNTexto] = useState("");
  const [escuchando, setEscuchando] = useState(false);
  const recognitionRef = useRef(null);
  const SpeechRecognitionAPI = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

  const toggleDictado = () => {
    if (escuchando) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "es-MX";
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.onresult = (e) => {
      let texto = "";
      for (let i = e.resultIndex; i < e.results.length; i++) texto += e.results[i][0].transcript;
      setNTexto((prev) => (prev.trim() ? `${prev.trim()} ${texto}` : texto));
    };
    recognition.onend = () => setEscuchando(false);
    recognition.onerror = () => setEscuchando(false);
    recognitionRef.current = recognition;
    recognition.start();
    setEscuchando(true);
  };

  // --- Nuevo paquete form (when finalizado) ---
  const [npNombre, setNpNombre] = useState("Paquete 8 clases");
  const [npTotal, setNpTotal] = useState(8);
  const [npVence, setNpVence] = useState("");

  const hoy = new Date();
  const anioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const primerDiaSemana = (new Date(hoy.getFullYear(), hoy.getMonth(), 1).getDay() + 6) % 7; // lunes=0

  const mesesCorto = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const asistenciaPorMes = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
    const prefijo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const count = alumno.asistencias.filter((iso) => iso.startsWith(prefijo)).length;
    return { label: mesesCorto[d.getMonth()], count };
  });
  const maxAsistencia = Math.max(1, ...asistenciaPorMes.map((m) => m.count));
  const partidosGanados = alumno.partidos.filter((p) => p.resu === "W").length;
  const partidosTotal = alumno.partidos.length;

  const toggleDia = (dia) => {
    const iso = `${anioMes}-${String(dia).padStart(2, "0")}`;
    const asiste = alumno.asistencias.includes(iso);
    const next = asiste ? alumno.asistencias.filter((d) => d !== iso) : [...alumno.asistencias, iso];
    onUpdate({ asistencias: next });
  };

  const [copiado, setCopiado] = useState(false);
  const copiarLink = () => {
    const url = `${window.location.origin}${import.meta.env.BASE_URL}?alumno=${alumno.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  const tabsList = readOnly
    ? [
        ["asistencia", "Asistencia"],
        ["entrenamiento", "Entreno"],
        ["partidos", "Partidos"],
      ]
    : [
        ["perfil", "Perfil"],
        ["entrenamiento", "Entreno"],
        ["asistencia", "Asistencia"],
        ["partidos", "Partidos"],
        ["notas", "Notas"],
      ];

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.headerTopRow}>
          {readOnly ? (
            <span style={styles.readOnlyBadge}>SOLO LECTURA</span>
          ) : (
            <button style={styles.backBtn} onClick={onBack}>← Alumnos</button>
          )}
        </div>
        <div style={styles.playerRow}>
          <div style={styles.avatarBig}>{alumno.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
          <div style={{ flex: 1 }}>
            <div style={styles.playerName}>{alumno.nombre}</div>
            {(() => {
              const metaParts = [alumno.lado, alumno.mano, alumno.grupo].filter((v) => v && v !== "—");
              return metaParts.length > 0 && <div style={styles.playerMeta}>{metaParts.join(" · ")}</div>;
            })()}
          </div>
          <div style={styles.levelBadge}>{formatNivel(alumno.nivel)}</div>
        </div>
        {readOnly && coachProfile?.nombre && (
          <div style={styles.coachLine}>
            Coach: {coachProfile.nombre}{coachProfile.rol ? ` · ${coachProfile.rol}` : ""}
            {coachProfile.telefono ? ` · ${coachProfile.telefono}` : ""}
          </div>
        )}
      </div>

      <div style={styles.tabs}>
        {tabsList.map(([key, label]) => {
          const Icon = TAB_ICONS[key];
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{ ...styles.tabBtn, color: tab === key ? COLORS.ink : COLORS.muted, fontWeight: tab === key ? 700 : 500 }}
            >
              <Icon size={14} strokeWidth={2.25} style={{ verticalAlign: -2.5, marginRight: 5 }} />
              {label}
              {tab === key && <div style={styles.tabIndicator} />}
            </button>
          );
        })}
      </div>

      <div style={styles.content} className="content-safe">
        {tab === "perfil" && (
          <div style={styles.section}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Datos de contacto</div>
              <EditableRow k="Teléfono" v={alumno.telefono} onSave={(v) => onUpdate({ telefono: v })} />
              <EditableRow k="Miembro desde" v={alumno.miembroDesde} onSave={(v) => onUpdate({ miembroDesde: v })} />
              <EditableRow k="Grupo" v={alumno.grupo} onSave={(v) => onUpdate({ grupo: v })} />
              <EditableRow k="Nivel" v={formatNivel(alumno.nivel)} onSave={(v) => onUpdate({ nivel: v })} />
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Físico / lesiones</div>
              <EditableRow k="" v={alumno.fisico} onSave={(v) => onUpdate({ fisico: v })} multiline />
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Vista para el alumno</div>
              <p style={styles.backupHint}>Comparte este link para que {alumno.nombre.split(" ")[0]} vea su asistencia, avance y partidos — sin poder editar nada.</p>
              <button style={styles.addBtn} onClick={copiarLink}>{copiado ? "¡Copiado!" : "Copiar link para el alumno"}</button>
            </div>
            <button
              style={styles.dangerBtn}
              onClick={() => {
                if (window.confirm(`¿Eliminar a ${alumno.nombre}? Se borrará todo su historial y no se puede deshacer.`)) onDelete();
              }}
            >
              Eliminar alumno
            </button>
          </div>
        )}

        {tab === "entrenamiento" && (
          <div style={styles.section}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Objetivos</div>
              {alumno.objetivos.map((o, i) => (
                <div key={i} style={styles.objetivoRow}>
                  <div>
                    <div style={styles.objetivoTexto}>{o.texto}</div>
                    <div style={styles.objetivoPlazo}>{o.plazo}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={styles.objetivoFecha}>{o.fecha}</span>
                    {!readOnly && <button style={styles.deleteBtn} onClick={() => removeAt("objetivos", i)} aria-label="Eliminar objetivo">×</button>}
                  </div>
                </div>
              ))}
              {!readOnly && (
              <div style={styles.miniForm}>
                <input style={styles.input} placeholder="Nuevo objetivo" value={nuevoObjTexto} onChange={(e) => setNuevoObjTexto(e.target.value)} />
                <div style={{ display: "flex", gap: 6 }}>
                  <select style={styles.select} value={nuevoObjPlazo} onChange={(e) => setNuevoObjPlazo(e.target.value)}>
                    <option>Corto plazo</option>
                    <option>Mediano plazo</option>
                    <option>En curso</option>
                  </select>
                  <input style={{ ...styles.input, flex: 1 }} placeholder="Fecha (ej. Ago 2026)" value={nuevoObjFecha} onChange={(e) => setNuevoObjFecha(e.target.value)} />
                </div>
                <button
                  style={styles.addBtn}
                  disabled={!nuevoObjTexto.trim()}
                  onClick={() => {
                    onUpdate({ objetivos: [...alumno.objetivos, { texto: nuevoObjTexto.trim(), plazo: nuevoObjPlazo, fecha: nuevoObjFecha }] });
                    setNuevoObjTexto("");
                    setNuevoObjFecha("");
                  }}
                >
                  + Agregar objetivo
                </button>
              </div>
              )}
            </div>

            {!readOnly && (
            <div style={styles.card}>
              <div style={styles.cardLabel}>Puntos por desarrollar</div>
              {alumno.puntos.map((p, i) => (
                <PuntoRow key={i} punto={p} onDelete={() => removeAt("puntos", i)} />
              ))}
              <NuevoPuntoForm onAdd={(punto) => onUpdate({ puntos: [...alumno.puntos, punto] })} />
            </div>
            )}

            <div style={styles.sesionesLabel}>Bitácora de clases</div>
            {alumno.sesiones.length === 0 && <EmptyState Icon={Target} text="Aún no hay clases registradas en la bitácora." />}
            {alumno.sesiones.map((_, i) => i).reverse().map((i) => {
              const s = alumno.sesiones[i];
              return (
                <div key={i} style={styles.sesionCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={styles.matchDate}>{fmt(s.fecha) || s.fecha}</span>
                    {!readOnly && <button style={styles.deleteBtn} onClick={() => removeAt("sesiones", i)} aria-label="Eliminar clase">×</button>}
                  </div>
                  <div style={styles.sesionEnfoque}>{s.enfoque}</div>
                  {s.ejercicios && (
                    <ul style={styles.ejercicioList}>
                      {s.ejercicios.split("\n").filter(Boolean).map((e, j) => <li key={j} style={styles.ejercicioItem}>{e}</li>)}
                    </ul>
                  )}
                </div>
              );
            })}
            {!readOnly && (
            <div style={{ ...styles.card, marginTop: 4 }}>
              <div style={styles.cardLabel}>Registrar clase de hoy</div>
              <input style={styles.input} placeholder="Enfoque de la clase" value={nuevaSesionEnfoque} onChange={(e) => setNuevaSesionEnfoque(e.target.value)} />
              <textarea style={styles.textarea} placeholder="Ejercicios (uno por línea)" value={nuevaSesionEjercicios} onChange={(e) => setNuevaSesionEjercicios(e.target.value)} />
              <button
                style={styles.addBtn}
                disabled={!nuevaSesionEnfoque.trim()}
                onClick={() => {
                  const iso = hoy.toISOString().slice(0, 10);
                  onUpdate({ sesiones: [...alumno.sesiones, { fecha: iso, enfoque: nuevaSesionEnfoque.trim(), ejercicios: nuevaSesionEjercicios }] });
                  setNuevaSesionEnfoque("");
                  setNuevaSesionEjercicios("");
                }}
              >
                + Guardar clase
              </button>
            </div>
            )}
          </div>
        )}

        {tab === "asistencia" && (
          <div style={styles.section}>
            {!readOnly && (
            <div style={styles.segmented}>
              <button
                style={{ ...styles.segmentBtn, ...(modalidad === "paquete" ? styles.segmentBtnActive : {}) }}
                onClick={() => onUpdate({ modalidad: "paquete" })}
              >
                Paquete
              </button>
              <button
                style={{ ...styles.segmentBtn, ...(modalidad === "porClase" ? styles.segmentBtnActive : {}) }}
                onClick={() => onUpdate({ modalidad: "porClase" })}
              >
                Pago por clase
              </button>
            </div>
            )}

            {modalidad === "paquete" && (
            <div style={styles.card}>
              <div style={styles.paqueteTop}>
                <div>
                  <div style={styles.cardLabel}>{alumno.paquete.nombre}</div>
                  {alumno.paquete.vence && <div style={styles.paqueteVence}>Vence {fmt(alumno.paquete.vence) || alumno.paquete.vence}</div>}
                </div>
                <span style={{ ...styles.resultChip, background: alumno.paquete.finalizado ? COLORS.border : COLORS.ball }}>
                  {alumno.paquete.finalizado ? "SIN PAQUETE" : "ACTIVO"}
                </span>
              </div>

              {!alumno.paquete.finalizado && (
                <>
                  <div style={styles.paqueteBarWrap}>
                    <div style={styles.paqueteBarBg}>
                      <div style={{ ...styles.paqueteBarFill, width: `${(alumno.paquete.usadas / alumno.paquete.total) * 100}%` }} />
                    </div>
                    <div style={styles.paqueteNums}>
                      <span style={styles.paqueteRestantes}>{restantes} clases restantes</span>
                      {readOnly ? (
                        <span style={styles.paqueteUsadas}>{alumno.paquete.usadas}/{alumno.paquete.total} usadas</span>
                      ) : (
                        <div style={styles.usadasControl}>
                          <button style={styles.stepBtn} disabled={alumno.paquete.usadas === 0} onClick={() => onUpdate({ paquete: { ...alumno.paquete, usadas: alumno.paquete.usadas - 1 } })}>−</button>
                          <span style={styles.paqueteUsadas}>{alumno.paquete.usadas}/{alumno.paquete.total} usadas</span>
                          <button style={styles.stepBtn} disabled={alumno.paquete.usadas === alumno.paquete.total} onClick={() => onUpdate({ paquete: { ...alumno.paquete, usadas: alumno.paquete.usadas + 1 } })}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                  <button
                    style={styles.finalizarBtn}
                    onClick={() => {
                      const periodo = `Paquete finalizado el ${hoy.toISOString().slice(0, 10)}`;
                      onUpdate({
                        paquetesAnteriores: [...alumno.paquetesAnteriores, { periodo, nombre: alumno.paquete.nombre, clases: alumno.paquete.total }],
                        paquete: { nombre: "Sin paquete activo", total: 0, usadas: 0, vence: "", finalizado: true },
                      });
                    }}
                  >
                    Finalizar paquete
                  </button>
                  )}
                </>
              )}

              {alumno.paquete.finalizado && !readOnly && (
                <div style={styles.miniForm}>
                  <input style={styles.input} placeholder="Nombre del paquete" value={npNombre} onChange={(e) => setNpNombre(e.target.value)} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <input style={{ ...styles.input, width: 70 }} type="number" min="1" value={npTotal} onChange={(e) => setNpTotal(e.target.value)} />
                    <input style={{ ...styles.input, flex: 1 }} type="date" value={npVence} onChange={(e) => setNpVence(e.target.value)} />
                  </div>
                  <button
                    style={styles.addBtn}
                    onClick={() => onUpdate({ paquete: { nombre: npNombre, total: parseInt(npTotal) || 8, usadas: 0, vence: npVence, finalizado: false } })}
                  >
                    + Activar nuevo paquete
                  </button>
                </div>
              )}
            </div>
            )}

            {modalidad === "porClase" && (
            <div style={styles.card}>
              <div style={styles.cardLabel}>Pago por clase</div>
              <div style={styles.pagoResumen}>
                <span style={styles.pagoResumenPagadas}>{pagadasTotal} pagada{pagadasTotal !== 1 ? "s" : ""}</span>
                {pendientesTotal > 0 && (
                  <span style={styles.pagoResumenPendientes}>{pendientesTotal} pendiente{pendientesTotal !== 1 ? "s" : ""}</span>
                )}
              </div>
              {clasesOrdenadas.length === 0 && <div style={styles.empty}>Aún no hay clases registradas.</div>}
              {clasesOrdenadas.map((d) => {
                const pagada = clasesPagadas.includes(d);
                return (
                  <div key={d} style={styles.pagoRow}>
                    <span style={styles.pagoFecha}>{fmt(d)}</span>
                    <StatusTag
                      tone={pagada ? "success" : "warning"}
                      onClick={readOnly ? undefined : () => {
                        const next = pagada ? clasesPagadas.filter((x) => x !== d) : [...clasesPagadas, d];
                        onUpdate({ clasesPagadas: next });
                      }}
                    >
                      {pagada ? "Pagada" : "Pendiente"}
                    </StatusTag>
                  </div>
                );
              })}
            </div>
            )}

            <div style={styles.card}>
              <div style={styles.cardLabel}>Asistencia — {hoy.toLocaleDateString("es-MX", { month: "long", year: "numeric" })}</div>
              <div style={styles.calGrid}>
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} style={styles.calDow}>{d}</div>)}
                {Array.from({ length: primerDiaSemana }).map((_, i) => <div key={"b" + i} />)}
                {Array.from({ length: diasEnMes }).map((_, i) => {
                  const dia = i + 1;
                  const iso = `${anioMes}-${String(dia).padStart(2, "0")}`;
                  const asistio = alumno.asistencias.includes(iso);
                  const esHoy = dia === hoy.getDate();
                  const dayStyle = {
                    ...styles.calDay,
                    background: asistio ? COLORS.ink : "transparent",
                    color: asistio ? COLORS.ball : esHoy ? COLORS.ink : "#B5A48C",
                    border: esHoy && !asistio ? `1.5px solid ${COLORS.ink}` : "none",
                    fontWeight: esHoy ? 700 : 500,
                  };
                  return readOnly ? (
                    <div key={dia} style={dayStyle}>{dia}</div>
                  ) : (
                    <button key={dia} onClick={() => toggleDia(dia)} style={dayStyle}>{dia}</button>
                  );
                })}
              </div>
              <div style={styles.calFootnote}>
                {readOnly ? `${alumno.asistencias.length} clases este mes` : `Toca un día para marcar/quitar asistencia · ${alumno.asistencias.length} clases este mes`}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>Asistencia — últimos 6 meses</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90, marginTop: 10 }}>
                {asistenciaPorMes.map((m, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6, height: "100%" }}>
                    <div style={{ width: "100%", height: Math.round((m.count / maxAsistencia) * 74), background: COLORS.clay, borderRadius: "5px 5px 0 0" }} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, color: COLORS.muted }}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {partidosTotal > 0 && (
              <div style={styles.card}>
                <div style={styles.cardLabel}>Partidos</div>
                <div style={{ display: "flex", height: 10, borderRadius: 6, overflow: "hidden" }}>
                  <div style={{ width: `${(partidosGanados / partidosTotal) * 100}%`, background: COLORS.clay }} />
                  <div style={{ width: `${((partidosTotal - partidosGanados) / partidosTotal) * 100}%`, background: COLORS.border }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.muted, marginTop: 6 }}>
                  <span><b style={{ color: COLORS.ink }}>{partidosGanados}</b> ganados</span>
                  <span><b style={{ color: COLORS.ink }}>{partidosTotal - partidosGanados}</b> perdidos</span>
                </div>
              </div>
            )}

            {alumno.paquetesAnteriores.length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardLabel}>Paquetes anteriores</div>
                {alumno.paquetesAnteriores.map((p, i) => (
                  <div key={i} style={styles.infoRow}>
                    <span style={styles.infoK}>{p.nombre}</span>
                    <span style={styles.infoV}>{p.clases} clases</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "partidos" && (
          <div style={styles.section}>
            {alumno.partidos.length === 0 && <EmptyState Icon={Trophy} text="Aún no hay partidos registrados." />}
            {alumno.partidos.map((_, i) => i).reverse().map((i) => {
              const p = alumno.partidos[i];
              return (
                <div key={i} style={styles.matchCard}>
                  <div style={styles.matchTop}>
                    <span style={styles.matchDate}>{fmt(p.fecha) || p.fecha}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...styles.resultChip, background: p.resu === "W" ? COLORS.green : COLORS.border, color: p.resu === "W" ? COLORS.card : COLORS.ink }}>
                        {p.resu === "W" ? "GANÓ" : "PERDIÓ"}
                      </span>
                      {!readOnly && <button style={styles.deleteBtn} onClick={() => removeAt("partidos", i)} aria-label="Eliminar partido">×</button>}
                    </div>
                  </div>
                  <div style={styles.rival}>{p.rival}</div>
                  <div style={styles.score}>{p.resultado}</div>
                  {p.tags && (
                    <div style={styles.tagRow}>
                      {p.tags.split(",").map((t) => t.trim()).filter(Boolean).map((t, j) => <span key={j} style={styles.tag}>{t}</span>)}
                    </div>
                  )}
                  {p.nota && <p style={styles.matchNote}>{p.nota}</p>}
                </div>
              );
            })}
            {!readOnly && (
            <div style={styles.card}>
              <div style={styles.cardLabel}>Registrar partido</div>
              <input style={styles.input} type="date" value={pFecha} onChange={(e) => setPFecha(e.target.value)} />
              <input style={styles.input} placeholder="Rival / torneo" value={pRival} onChange={(e) => setPRival(e.target.value)} />
              <div style={{ display: "flex", gap: 6 }}>
                <input style={{ ...styles.input, flex: 1 }} placeholder="Resultado (6-4 / 6-2)" value={pResultado} onChange={(e) => setPResultado(e.target.value)} />
                <select style={styles.select} value={pResu} onChange={(e) => setPResu(e.target.value)}>
                  <option value="W">Ganó</option>
                  <option value="L">Perdió</option>
                </select>
              </div>
              <input style={styles.input} placeholder="Tags (separados por coma)" value={pTags} onChange={(e) => setPTags(e.target.value)} />
              <textarea style={styles.textarea} placeholder="Nota del coach" value={pNota} onChange={(e) => setPNota(e.target.value)} />
              <button
                style={styles.addBtn}
                disabled={!pRival.trim() || !pFecha}
                onClick={() => {
                  onUpdate({ partidos: [...alumno.partidos, { fecha: pFecha, rival: pRival, resultado: pResultado, resu: pResu, tags: pTags, nota: pNota }] });
                  setPFecha(""); setPRival(""); setPResultado(""); setPTags(""); setPNota("");
                }}
              >
                + Guardar partido
              </button>
            </div>
            )}
          </div>
        )}

        {tab === "notas" && (
          <div style={styles.section}>
            {alumno.notas.length === 0 && <EmptyState Icon={StickyNote} text="Aún no hay notas de este alumno." />}
            <div style={styles.timeline}>
              {alumno.notas.map((_, i) => i).reverse().map((i) => {
                const n = alumno.notas[i];
                return (
                  <div key={i} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.noteTop}>
                        <span style={styles.noteAuthor}>{n.autor}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={styles.noteDate}>{fmt(n.fecha) || n.fecha}</span>
                          <button style={styles.deleteBtn} onClick={() => removeAt("notas", i)} aria-label="Eliminar nota">×</button>
                        </div>
                      </div>
                      <p style={styles.noteText}>{n.texto}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Nueva nota</div>
              <input style={styles.input} placeholder="Tu nombre" value={nAutor} onChange={(e) => setNAutor(e.target.value)} />
              <textarea style={styles.textarea} placeholder="Observación..." value={nTexto} onChange={(e) => setNTexto(e.target.value)} />
              {SpeechRecognitionAPI && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <button
                    type="button"
                    onClick={toggleDictado}
                    aria-label={escuchando ? "Detener dictado" : "Dictar nota"}
                    style={{
                      width: 36, height: 36, borderRadius: "50%", border: "none", flexShrink: 0,
                      background: escuchando ? COLORS.red : COLORS.clay, color: COLORS.card,
                      fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    🎙
                  </button>
                  <span style={{ fontSize: 11.5, color: escuchando ? COLORS.clay : COLORS.muted, fontWeight: escuchando ? 700 : 500 }}>
                    {escuchando ? "Escuchando… toca para detener" : "Dictar la nota en vez de escribirla"}
                  </span>
                </div>
              )}
              <button
                style={styles.addBtn}
                disabled={!nTexto.trim()}
                onClick={() => {
                  const iso = hoy.toISOString().slice(0, 10);
                  onUpdate({ notas: [...alumno.notas, { fecha: iso, autor: nAutor.trim() || "Coach", texto: nTexto.trim() }] });
                  setNTexto("");
                }}
              >
                + Guardar nota
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
