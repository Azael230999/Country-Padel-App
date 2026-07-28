import React, { useState, useEffect } from "react";
import { watchStudentPublic, getCoachProfile } from "./data.js";
import { PerfilAlumno } from "./App.jsx";

const COLORS = {
  ink: "#12211F",
  bg: "#FAF9F4",
};

export default function AlumnoView({ id }) {
  const [alumno, setAlumno] = useState(undefined); // undefined = cargando, null = no existe
  const [coachProfile, setCoachProfile] = useState(null);
  const [tab, setTab] = useState("asistencia");

  useEffect(() => {
    const unsub = watchStudentPublic(
      id,
      (data) => setAlumno(data),
      () => setAlumno(null)
    );
    return unsub;
  }, [id]);

  useEffect(() => {
    if (alumno && alumno.coachUid) {
      getCoachProfile(alumno.coachUid).then(setCoachProfile);
    }
  }, [alumno?.coachUid]);

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
        <PerfilAlumno
          alumno={alumno}
          tab={tab}
          setTab={setTab}
          onBack={() => {}}
          onUpdate={() => {}}
          onDelete={() => {}}
          readOnly
          coachProfile={coachProfile}
        />
      </div>
    </div>
  );
}

const outerStyles = {
  app: { minHeight: "100vh", background: "#0F1E1C", display: "flex", justifyContent: "center", fontFamily: "'Archivo', sans-serif", padding: "24px 12px" },
  phone: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", height: 780, position: "relative" },
  loadingBox: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", height: 780, padding: 24 },
  spinner: { width: 32, height: 32, borderRadius: "50%", border: "3px solid #EFEAE0", borderTopColor: COLORS.ink },
  errorText: { fontSize: 14, color: COLORS.ink, textAlign: "center", lineHeight: 1.6 },
};

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
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
