import React, { useState, useEffect } from "react";
import { Clock, ClipboardList, AlertCircle, Inbox } from "lucide-react";
import { watchAcademyStudentPublic } from "./data.js";
import { styles, fontImport } from "./styles.js";
import { COLORS } from "./constants.js";
import { PuntoRow } from "./components/Puntos.jsx";
import { IconBadge } from "./components/IconBadge.jsx";
import { SkeletonBlock, SkeletonCard } from "./components/Skeleton.jsx";

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
      <div style={styles.app}>
        <style>{fontImport}</style>
        <div style={styles.loadingBox}>
          <div style={{ width: "100%", padding: 24 }}>
            <SkeletonBlock width={140} height={16} radius={999} style={{ margin: "0 auto 20px" }} />
            <SkeletonCard lines={2} />
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
        <div style={styles.header} className="header-safe">
          <div style={styles.headerTopRow}>
            <span style={styles.readOnlyBadge}>SOLO LECTURA</span>
          </div>
          <div style={{ paddingBottom: 16 }}>
            <div style={styles.playerName}>{alumno.nombre}</div>
            <div style={styles.playerMeta}>{alumno.deporte} · {alumno.categoria}</div>
          </div>
        </div>
        <div style={styles.content} className="content-safe">
          <div style={styles.section}>
            {alumno.descripcion && (
              <div style={styles.card}>
                <div style={styles.cardLabel}>Sobre {alumno.nombre.split(" ")[0]}</div>
                <p style={styles.matchNote}>{alumno.descripcion}</p>
              </div>
            )}
            {alumno.horario && (
              <div style={{ ...styles.card, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <IconBadge Icon={Clock} />
                <div style={{ flex: 1 }}>
                  <div style={styles.cardLabel}>Horario</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, lineHeight: 1.4 }}>{alumno.horario}</div>
                </div>
              </div>
            )}
            {alumno.plan && (
              <div style={{ ...styles.card, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <IconBadge Icon={ClipboardList} />
                <div style={{ flex: 1 }}>
                  <div style={styles.cardLabel}>Plan de entrenamiento</div>
                  <p style={{ ...styles.matchNote, marginTop: 0, whiteSpace: "pre-wrap" }}>{alumno.plan}</p>
                </div>
              </div>
            )}
            {(alumno.puntos || []).length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardLabel}>Lo que necesita trabajar</div>
                {alumno.puntos.map((p, i) => (
                  <PuntoRow key={i} punto={p} />
                ))}
              </div>
            )}
            {!alumno.horario && !alumno.plan && (alumno.puntos || []).length === 0 && (
              <div style={{ textAlign: "center", padding: "34px 16px" }}>
                <Inbox size={26} strokeWidth={1.75} color={COLORS.muted} style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>Tu coach todavía no ha agregado información aquí.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
