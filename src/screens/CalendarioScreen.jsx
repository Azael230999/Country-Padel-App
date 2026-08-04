import { useState } from "react";
import { Calendar } from "lucide-react";
import { styles } from "../styles.js";
import { COLORS } from "../constants.js";
import { NavSwitcher } from "../components/NavSwitcher.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DOW = ["L", "M", "M", "J", "V", "S", "D"];

function isoDia(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function buildGrid(year, month) {
  const primerDiaSemana = (new Date(year, month, 1).getDay() + 6) % 7; // lunes=0
  const diasEnMesActual = new Date(year, month + 1, 0).getDate();
  const diasEnMesAnterior = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = primerDiaSemana - 1; i >= 0; i--) {
    cells.push({ day: diasEnMesAnterior - i, other: true, iso: null });
  }
  for (let d = 1; d <= diasEnMesActual; d++) {
    cells.push({ day: d, other: false, iso: isoDia(year, month, d) });
  }
  let next = 1;
  while (cells.length < 42) {
    cells.push({ day: next++, other: true, iso: null });
  }
  return cells;
}

function fmtCorto(iso) {
  const [, m, d] = iso.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return { dia: parseInt(d, 10), mes: meses[parseInt(m, 10) - 1] };
}

export function CalendarioScreen({ isAdmin, eventos, coaches, nav, setNav, onSelect, onAdd }) {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());
  const [selectedIso, setSelectedIso] = useState(null);
  const [showNuevo, setShowNuevo] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [todos, setTodos] = useState(true);
  const [elegidos, setElegidos] = useState([]);

  if (eventos === null) {
    return (
      <div style={styles.content} className="content-safe">
        <div className="spinner" style={styles.spinner} />
      </div>
    );
  }

  const hoyIso = isoDia(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const cells = buildGrid(year, month);
  const eventosPorDia = {};
  eventos.forEach((e) => {
    if (!eventosPorDia[e.fecha]) eventosPorDia[e.fecha] = [];
    eventosPorDia[e.fecha].push(e);
  });

  const proximos = [...eventos].filter((e) => e.fecha >= hoyIso).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const delDiaSeleccionado = selectedIso ? eventos.filter((e) => e.fecha === selectedIso) : null;
  const listaAMostrar = delDiaSeleccionado && delDiaSeleccionado.length > 0 ? delDiaSeleccionado : proximos;
  const tituloLista = delDiaSeleccionado && delDiaSeleccionado.length > 0 ? "Eventos de este día" : "Próximos eventos";

  const cambiarMes = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
    setSelectedIso(null);
  };

  const guardarEvento = async () => {
    const audienceUids = todos ? coaches.map((c) => c.uid) : elegidos;
    const audienceLabel = todos
      ? "Todos los coaches"
      : coaches.filter((c) => elegidos.includes(c.uid)).map((c) => c.nombre || c.email || c.uid).join(", ");
    await onAdd({ titulo: titulo.trim(), fecha, hora: hora.trim(), lugar: lugar.trim(), descripcion: descripcion.trim(), audienceUids, audienceLabel });
    setTitulo(""); setFecha(""); setHora(""); setLugar(""); setDescripcion(""); setTodos(true); setElegidos([]);
    setShowNuevo(false);
  };

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.brand}>COUNTRY PADEL</div>
        <div style={styles.titulo}>Calendario</div>
        <div style={{ marginTop: 12, marginBottom: 4 }}>
          <NavSwitcher nav={nav} setNav={setNav} isAdmin={isAdmin} />
        </div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={styles.card}>
          <div style={styles.calTop}>
            <button style={styles.calArrow} onClick={() => cambiarMes(-1)} aria-label="Mes anterior">‹</button>
            <div style={styles.calMonthLabel}>{MESES[month]} {year}</div>
            <button style={styles.calArrow} onClick={() => cambiarMes(1)} aria-label="Mes siguiente">›</button>
          </div>
          <div style={styles.calGrid}>
            {DOW.map((d, i) => <div key={i} style={styles.calDow}>{d}</div>)}
            {cells.map((c, i) => {
              const isToday = !c.other && c.iso === hoyIso;
              const isSelected = !c.other && c.iso === selectedIso;
              const hasEvent = !c.other && eventosPorDia[c.iso]?.length > 0;
              const dayStyle = {
                ...styles.calDay,
                color: c.other ? "#D8C9AE" : COLORS.ink,
                border: isToday && !isSelected ? `1.5px solid ${COLORS.ink}` : "none",
                background: isSelected ? COLORS.clay : "transparent",
                fontWeight: isToday ? 700 : 500,
                cursor: c.other ? "default" : "pointer",
              };
              return (
                <button
                  key={i}
                  disabled={c.other}
                  onClick={() => setSelectedIso(c.iso === selectedIso ? null : c.iso)}
                  style={dayStyle}
                >
                  {c.day}
                  {hasEvent && <span style={{ ...styles.calEventDot, background: isSelected ? COLORS.card : COLORS.clay }} />}
                </button>
              );
            })}
          </div>
        </div>

        {isAdmin && (
          <>
            <div style={styles.sesionesLabel}>Nuevo evento</div>
            <button style={{ ...styles.secondaryBtn, marginTop: 8 }} onClick={() => setShowNuevo((v) => !v)}>
              {showNuevo ? "Cancelar" : "+ Agendar reunión o actividad"}
            </button>
            {showNuevo && (
              <div style={{ ...styles.card, marginTop: 10 }}>
                <input style={styles.input} placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
                <div style={{ display: "flex", gap: 6 }}>
                  <input style={{ ...styles.input, flex: 1 }} type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                  <input style={{ ...styles.input, flex: 1 }} placeholder="Hora (ej. 6:00 PM)" value={hora} onChange={(e) => setHora(e.target.value)} />
                </div>
                <input style={styles.input} placeholder="Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} />
                <textarea style={styles.textarea} placeholder="Descripción (opcional)" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                <div style={{ ...styles.cardLabel, marginTop: 4 }}>¿Para quién es?</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  <button
                    style={{ ...styles.pagoChip, background: todos ? COLORS.clay : "transparent", color: todos ? COLORS.card : COLORS.muted, border: todos ? "none" : `1.5px solid ${COLORS.border}` }}
                    onClick={() => setTodos(true)}
                  >
                    Todos los coaches
                  </button>
                  {coaches.map((c) => {
                    const activo = !todos && elegidos.includes(c.uid);
                    return (
                      <button
                        key={c.uid}
                        style={{ ...styles.pagoChip, background: activo ? COLORS.clay : "transparent", color: activo ? COLORS.card : COLORS.muted, border: activo ? "none" : `1.5px solid ${COLORS.border}` }}
                        onClick={() => {
                          setTodos(false);
                          setElegidos((prev) => (prev.includes(c.uid) ? prev.filter((u) => u !== c.uid) : [...prev, c.uid]));
                        }}
                      >
                        {c.nombre || c.email || c.uid}
                      </button>
                    );
                  })}
                </div>
                <button
                  style={styles.primaryBtn}
                  disabled={!titulo.trim() || !fecha || (!todos && elegidos.length === 0)}
                  onClick={guardarEvento}
                >
                  Guardar evento
                </button>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={styles.sesionesLabel}>{tituloLista}</div>
          {listaAMostrar.length === 0 && <EmptyState Icon={Calendar} text="Aún no hay eventos agendados." />}
          {listaAMostrar.map((e) => {
            const { dia, mes } = fmtCorto(e.fecha);
            const Contenedor = isAdmin ? "button" : "div";
            return (
              <Contenedor key={e.id} onClick={isAdmin ? () => onSelect(e.id) : undefined} style={{ ...styles.eventCard, cursor: isAdmin ? "pointer" : "default", fontFamily: "'Karla', sans-serif", textAlign: "left" }}>
                <div style={styles.eventDateBadge}>
                  <span>{dia}</span>
                  <span style={styles.eventDateMes}>{mes}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.nombre}>{e.titulo}</div>
                  {(e.hora || e.lugar) && <div style={{ ...styles.meta, fontFamily: "'JetBrains Mono', monospace" }}>{[e.hora, e.lugar].filter(Boolean).join(" · ")}</div>}
                  {e.audienceLabel && <span style={styles.eventTag}>{e.audienceLabel}</span>}
                </div>
              </Contenedor>
            );
          })}
        </div>
      </div>
    </>
  );
}
