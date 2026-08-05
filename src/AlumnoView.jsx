import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { watchStudentPublic, getCoachProfile } from "./data.js";
import { PerfilAlumno } from "./screens/PerfilAlumno.jsx";
import { styles, fontImport } from "./styles.js";
import { COLORS } from "./constants.js";
import { SkeletonBlock, SkeletonCard, SkeletonList } from "./components/Skeleton.jsx";

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
          <div style={{ width: "100%", padding: 24 }}>
            <SkeletonBlock width={140} height={16} radius={999} style={{ margin: "0 auto 20px" }} />
            <SkeletonCard lines={2} />
            <div style={{ height: 12 }} />
            <SkeletonList rows={2} />
          </div>
        </div>
      </div>
    );
  }

  if (alumno === null) {
    return (
      <div style={styles.app}>
        <style>{fontImport}</style>
        <div style={styles.loadingBox}>
          <div style={{ textAlign: "center", padding: "0 20px" }}>
            <AlertCircle size={26} strokeWidth={1.75} color={COLORS.muted} style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, color: COLORS.ink, textAlign: "center", lineHeight: 1.6 }}>
              Este link ya no es válido.
              <br />
              Pídele a tu coach que te comparta uno nuevo.
            </div>
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
