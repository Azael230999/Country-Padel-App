import React, { useState, useEffect } from "react";
import { watchAcademyStudentPublic } from "./data.js";
import { PuntoRow } from "./components/Puntos.jsx";

const COLORS = {
  ink: "#2A1D14",
  bg: "#F5EEE2",
  card: "#FFFDF8",
  border: "#E6D9C4",
  ball: "#D6B23E",
  muted: "#8C7862",
};

export default function AlumnoGrupoView({ id }) {
  const [alumno, setAlumno] = useState(undefined); // undefined = cargando, null = no existe

  useEffect(() => {
    const unsub = watchAcademyStudentPublic(
      id,
      (data) => setAlumno(data),
      () => setAlumno(null)
    );
    return unsub;
  }, [id]);

  if (alumno === undefined) {
    return (
      <div style={outerStyles.app}>
        <style>{fontImport}</style>
        <div style={outerStyles.loadingBox}>
          <div className="spinner" style={outerStyles.spinner} />
        </div>
      </div>
    );
  }

  if (alumno === null) {
    return (
      <div style={outerStyles.app}>
        <style>{fontImport}</style>
        <div style={outerStyles.loadingBox}>
          <div style={outerStyles.errorText}>
            Este link ya no es válido.
            <br />
            Pídele a tu coach que te comparta uno nuevo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={outerStyles.app} className="app-shell">
      <style>{fontImport}</style>
      <div style={outerStyles.phone} className="phone-shell">
        <div style={outerStyles.header} className="header-safe">
          <span style={outerStyles.badge}>SOLO LECTURA</span>
          <div style={outerStyles.playerName}>{alumno.nombre}</div>
          <div style={outerStyles.playerMeta}>{alumno.deporte} · {alumno.categoria}</div>
        </div>
        <div style={outerStyles.content} className="content-safe">
          {alumno.descripcion && (
            <div style={outerStyles.card}>
              <div style={outerStyles.cardLabel}>Sobre {alumno.nombre.split(" ")[0]}</div>
              <p style={outerStyles.note}>{alumno.descripcion}</p>
            </div>
          )}
          {alumno.horario && (
            <div style={outerStyles.card}>
              <div style={outerStyles.cardLabel}>Horario</div>
              <div style={outerStyles.strong}>{alumno.horario}</div>
            </div>
          )}
          {alumno.plan && (
            <div style={outerStyles.card}>
              <div style={outerStyles.cardLabel}>Plan de entrenamiento</div>
              <p style={{ ...outerStyles.note, whiteSpace: "pre-wrap" }}>{alumno.plan}</p>
            </div>
          )}
          {(alumno.puntos || []).length > 0 && (
            <div style={outerStyles.card}>
              <div style={outerStyles.cardLabel}>Lo que necesita trabajar</div>
              {alumno.puntos.map((p, i) => (
                <PuntoRow key={i} punto={p} />
              ))}
            </div>
          )}
          {!alumno.horario && !alumno.plan && (alumno.puntos || []).length === 0 && (
            <div style={outerStyles.empty}>Tu coach todavía no ha agregado información aquí.</div>
          )}
        </div>
      </div>
    </div>
  );
}

const outerStyles = {
  app: { minHeight: "100vh", background: "#1C130D", display: "flex", justifyContent: "center", fontFamily: "'Karla', sans-serif", padding: "24px 12px" },
  phone: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", height: 780, position: "relative" },
  loadingBox: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", height: 780, padding: 24 },
  spinner: { width: 32, height: 32, borderRadius: "50%", border: "3px solid #EFE3CE", borderTopColor: COLORS.ink },
  errorText: { fontSize: 14, color: COLORS.ink, textAlign: "center", lineHeight: 1.6 },
  header: { background: COLORS.ink, color: COLORS.bg, padding: "18px 18px 14px" },
  badge: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", color: COLORS.ink, background: COLORS.ball, borderRadius: 999, padding: "4px 9px 3px", display: "inline-block", marginBottom: 10 },
  playerName: { fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 19 },
  playerMeta: { fontSize: 12, opacity: 0.65, marginTop: 3 },
  content: { flex: 1, overflowY: "auto", padding: "16px 18px 30px", WebkitOverflowScrolling: "touch", display: "flex", flexDirection: "column", gap: 12 },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14 },
  cardLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.muted, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" },
  strong: { fontSize: 13.5, fontWeight: 700, color: COLORS.ink },
  note: { fontSize: 12.5, color: "#6B5A47", lineHeight: 1.5, margin: 0 },
  empty: { fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "30px 10px" },
};

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Karla:wght@400;500;700&family=JetBrains+Mono:wght@500;700&display=swap');
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.8s linear infinite; }
  @media (max-width: 480px) {
    .app-shell { padding: 0 !important; align-items: stretch !important; }
    .phone-shell { width: 100% !important; max-width: 100% !important; height: 100dvh !important; border-radius: 0 !important; box-shadow: none !important; }
  }
`;
