import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { styles } from "../styles.js";
import { COLORS, formatNivel } from "../constants.js";
import { NavSwitcher } from "../components/NavSwitcher.jsx";
import { MigrationBanner } from "../components/MigrationBanner.jsx";
import { EditableRow } from "../components/EditableRow.jsx";
import { EmptyState } from "../components/EmptyState.jsx";

export function Directorio({ students, busqueda, setBusqueda, onSelect, showNuevoAlumno, setShowNuevoAlumno, addStudent, onImportAll, coach, onUpdateCoach, migration, onMigrate, onDismissMigration, onSignOut, isAdmin, nav, setNav }) {
  const [nombre, setNombre] = useState("");
  const [grupo, setGrupo] = useState("");
  const [nivel, setNivel] = useState("");
  const [showAjustes, setShowAjustes] = useState(false);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);

  const filtrados = students.filter((s) => s.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const exportarDatos = () => {
    const datosLimpios = students.map(({ coachUid, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(datosLimpios, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const hoy = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `country-padel-backup-${hoy}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const importarDatos = (file) => {
    setImportError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("Formato inválido");
        if (!window.confirm(`Esto reemplazará los ${students.length} alumnos actuales con ${data.length} del archivo. ¿Continuar?`)) return;
        onImportAll(data);
      } catch (e) {
        setImportError("El archivo no es un respaldo válido de Country Padel.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.brand}>COUNTRY PADEL</div>
        <div style={styles.titulo}>Alumnos</div>
        <input
          style={styles.search}
          placeholder="Buscar alumno..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div style={styles.content} className="content-safe">
        <div style={{ marginBottom: 10 }}>
          <NavSwitcher nav={nav} setNav={setNav} isAdmin={isAdmin} />
        </div>
        {migration && migration.students && (
          <MigrationBanner count={migration.students.length} onMigrate={onMigrate} onDismiss={onDismissMigration} />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ ...styles.secondaryBtn, flex: 1 }} onClick={() => { setShowNuevoAlumno((v) => !v); setShowAjustes(false); }}>
            {showNuevoAlumno ? "Cancelar" : "+ Nuevo alumno"}
          </button>
          <button style={styles.iconBtn} onClick={() => { setShowAjustes((v) => !v); setShowNuevoAlumno(false); }} aria-label="Ajustes">
            ⚙
          </button>
        </div>

        {showAjustes && (
          <div style={{ ...styles.card, marginTop: 10 }}>
            <div style={styles.cardLabel}>Mi perfil</div>
            <p style={styles.backupHint}>Así te van a ver tus alumnos cuando puedan consultar su avance.</p>
            <EditableRow k="Nombre" v={coach.nombre} onSave={(v) => onUpdateCoach({ nombre: v })} />
            <EditableRow k="Rol" v={coach.rol} onSave={(v) => onUpdateCoach({ rol: v })} />
            <EditableRow k="Teléfono" v={coach.telefono} onSave={(v) => onUpdateCoach({ telefono: v })} />
            <EditableRow k="Email" v={coach.email} onSave={(v) => onUpdateCoach({ email: v })} />
            <EditableRow k="" v={coach.bio} onSave={(v) => onUpdateCoach({ bio: v })} multiline />
          </div>
        )}

        {showAjustes && (
          <div style={{ ...styles.card, marginTop: 10 }}>
            <div style={styles.cardLabel}>Respaldo de datos</div>
            <p style={styles.backupHint}>Tus datos ya viven en la nube. Exporta una copia de vez en cuando por si acaso, o para pasarlos a otra cuenta.</p>
            <button style={styles.addBtn} onClick={exportarDatos}>Exportar copia</button>
            <button
              style={{ ...styles.secondaryBtnSmall, width: "100%", marginTop: 7 }}
              onClick={() => fileInputRef.current?.click()}
            >
              Importar copia
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importarDatos(file);
                e.target.value = "";
              }}
            />
            {importError && <div style={styles.importError}>{importError}</div>}
          </div>
        )}

        {showAjustes && (
          <div style={{ ...styles.card, marginTop: 10 }}>
            <button style={styles.dangerBtn} onClick={() => { if (window.confirm("¿Cerrar sesión?")) onSignOut(); }}>
              Cerrar sesión
            </button>
          </div>
        )}

        {showNuevoAlumno && (
          <div style={{ ...styles.card, marginTop: 10 }}>
            <input style={styles.input} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input style={styles.input} placeholder="Grupo (ej. Intermedio-B)" value={grupo} onChange={(e) => setGrupo(e.target.value)} />
            <input style={styles.input} placeholder="Nivel (ej. 4.0)" value={nivel} onChange={(e) => setNivel(e.target.value)} />
            <button
              style={{ ...styles.primaryBtn, marginTop: 4 }}
              disabled={!nombre.trim()}
              onClick={() => {
                addStudent({ nombre: nombre.trim(), grupo, nivel });
                setNombre("");
                setGrupo("");
                setNivel("");
              }}
            >
              Guardar alumno
            </button>
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {filtrados.length === 0 && (
            <EmptyState
              Icon={Search}
              text={busqueda.trim() ? "Ningún alumno coincide con tu búsqueda." : "Aún no tienes alumnos — agrega el primero arriba."}
            />
          )}
          {filtrados.map((s) => {
            let tagText, alerta;
            if ((s.modalidad || "paquete") === "porClase") {
              const clasesPagadas = s.clasesPagadas || [];
              const pendientes = s.asistencias.filter((d) => !clasesPagadas.includes(d)).length;
              tagText = pendientes > 0 ? `${pendientes} pendiente${pendientes !== 1 ? "s" : ""}` : "al día";
              alerta = pendientes > 0;
            } else {
              const restantes = s.paquete.finalizado ? 0 : s.paquete.total - s.paquete.usadas;
              tagText = s.paquete.finalizado ? "sin paquete" : `${restantes} clase${restantes !== 1 ? "s" : ""}`;
              alerta = !s.paquete.finalizado && restantes <= 1;
            }
            return (
              <button key={s.id} onClick={() => onSelect(s.id)} style={styles.row}>
                <div style={styles.avatar}>{s.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={styles.nombre}>{s.nombre}</div>
                  <div style={styles.meta}>{s.grupo} · Nivel {formatNivel(s.nivel)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ ...styles.restantesTag, color: alerta ? COLORS.red : COLORS.muted }}>
                    {tagText}
                  </span>
                  {alerta && <span style={styles.alertaDot} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
