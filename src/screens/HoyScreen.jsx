import { Calendar, CheckCircle2 } from "lucide-react";
import { styles } from "../styles.js";
import { COLORS } from "../constants.js";
import { NavSwitcher } from "../components/NavSwitcher.jsx";
import { StatusTag } from "../components/StatusTag.jsx";
import { EmptyState } from "../components/EmptyState.jsx";
import { SkeletonList } from "../components/Skeleton.jsx";
import { ErrorState } from "../components/ErrorState.jsx";

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function hoyIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Info de pago pendiente de un alumno privado, o null si está al día.
export function pagoPendienteInfo(alumno) {
  const modalidad = alumno.modalidad || "paquete";
  if (modalidad === "porClase") {
    const clasesPagadas = alumno.clasesPagadas || [];
    const pendientes = alumno.asistencias.filter((d) => !clasesPagadas.includes(d)).length;
    if (pendientes > 0) return { texto: `${pendientes} pendiente${pendientes !== 1 ? "s" : ""}`, tono: "red" };
    return null;
  }
  if (alumno.paquete.finalizado) return { texto: "sin paquete", tono: "red" };
  if (alumno.paquete.vence) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const vence = new Date(alumno.paquete.vence + "T00:00:00");
    const dias = Math.round((vence - hoy) / 86400000);
    if (dias <= 7) {
      const texto = dias < 0 ? "vencido" : dias === 0 ? "vence hoy" : `vence en ${dias} día${dias !== 1 ? "s" : ""}`;
      return { texto, tono: dias <= 2 ? "red" : "amber" };
    }
  }
  return null;
}

export function HoyScreen({ isAdmin, students, eventos, saveError, nav, setNav, onVerPagos }) {
  const hoy = new Date();
  const fechaLarga = `${DIAS[hoy.getDay()][0].toUpperCase()}${DIAS[hoy.getDay()].slice(1)} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`;
  const iso = hoyIso();

  const pendientes = (students || []).map((a) => ({ alumno: a, info: pagoPendienteInfo(a) })).filter((x) => x.info);
  const eventosHoy = (eventos || []).filter((e) => e.fecha === iso).sort((a, b) => (a.hora || "").localeCompare(b.hora || ""));
  const proximo = (eventos || []).filter((e) => e.fecha > iso).sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.brand}>COUNTRY PADEL</div>
        <div style={styles.titulo}>Hoy</div>
        <div style={{ marginTop: 12, marginBottom: 4 }}>
          <NavSwitcher nav={nav} setNav={setNav} isAdmin={isAdmin} />
        </div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={{ color: COLORS.muted, fontSize: 12.5, marginTop: -4, marginBottom: 2 }}>{fechaLarga}</div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Pagos pendientes</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 34, color: pendientes.length > 0 ? COLORS.clay : COLORS.ink, lineHeight: 1 }}>
            {pendientes.length}
          </div>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            {pendientes.length === 0 ? (
              <>
                <CheckCircle2 size={12} strokeWidth={2.5} color={COLORS.green} />
                todos al día
              </>
            ) : (
              `alumno${pendientes.length !== 1 ? "s" : ""} con pago pendiente`
            )}
          </div>
          {pendientes.length > 0 && (
            <button
              type="button"
              onClick={onVerPagos}
              style={{ background: "none", border: "none", padding: 0, fontSize: 12, fontWeight: 700, color: COLORS.clay, marginTop: 10, cursor: "pointer", fontFamily: "'Karla', sans-serif" }}
            >
              Ver detalle →
            </button>
          )}
        </div>

        <div style={styles.card}>
          <div style={styles.cardLabel}>Eventos de hoy</div>
          {eventos === null ? (
            saveError ? <ErrorState text="No se pudieron cargar los eventos." /> : <SkeletonList rows={2} />
          ) : eventosHoy.length === 0 ? (
            <EmptyState Icon={Calendar} text="Sin eventos programados hoy." />
          ) : (
            eventosHoy.map((e) => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.clay, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: COLORS.ink }}>{e.titulo}</span>
                {e.hora && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.muted, marginLeft: "auto" }}>{e.hora}</span>}
              </div>
            ))
          )}
        </div>

        {proximo && (
          <div style={styles.card}>
            <div style={styles.cardLabel}>Próximo evento</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.clay, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: COLORS.ink }}>{proximo.titulo}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.muted, marginLeft: "auto" }}>{proximo.fecha.slice(8, 10)}/{proximo.fecha.slice(5, 7)}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function PagosPendientesScreen({ students, onBack, onSelectAlumno }) {
  const pendientes = (students || []).map((a) => ({ alumno: a, info: pagoPendienteInfo(a) })).filter((x) => x.info);

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.headerTopRow}>
          <button style={styles.backBtn} onClick={onBack}>← Hoy</button>
        </div>
        <div style={styles.titulo}>Pagos pendientes</div>
      </div>
      <div style={styles.content} className="content-safe">
        {pendientes.length === 0 && <EmptyState Icon={CheckCircle2} text="Todos tus alumnos están al día." />}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {pendientes.map(({ alumno, info }) => (
            <button key={alumno.id} onClick={() => onSelectAlumno(alumno.id)} style={styles.row}>
              <div style={styles.avatar}>{alumno.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.nombre}>{alumno.nombre}</div>
                <div style={styles.meta}>{(alumno.modalidad || "paquete") === "porClase" ? "Pago por clase" : alumno.paquete.nombre}</div>
              </div>
              <StatusTag tone={info.tono === "red" ? "error" : "warning"} style={{ marginLeft: "auto" }}>
                {info.texto}
              </StatusTag>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
