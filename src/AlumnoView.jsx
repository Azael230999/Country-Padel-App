import React, { useState, useEffect } from "react";
import { watchStudentPublic, getCoachProfile } from "./data.js";
import { PerfilAlumno } from "./screens/PerfilAlumno.jsx";
import { styles, fontImport } from "./styles.js";
import { COLORS } from "./constants.js";

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
      <div style={styles.app}>
        <style>{fontImport}</style>
        <div style={styles.loadingBox}>
          <div className="spinner" style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (alumno === null) {
    return (
      <div style={styles.app}>
        <style>{fontImport}</style>
        <div style={styles.loadingBox}>
          <div style={{ fontSize: 14, color: COLORS.ink, textAlign: "center", lineHeight: 1.6 }}>
            Este link ya no es válido.
            <br />
            Pídele a tu coach que te comparta uno nuevo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.app} className="app-shell">
      <style>{fontImport}</style>
      <div style={styles.phone} className="phone-shell">
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
