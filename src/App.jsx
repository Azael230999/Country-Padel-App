import React, { useState, useEffect, useRef } from "react";
import { storage } from "./storage.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  watchStudents,
  createStudent,
  patchStudent,
  removeStudent,
  getCoachProfile,
  saveCoachProfile,
  watchAcademyCoaches,
  createCoachAccount,
  watchAcademyStudentsForAdmin,
  watchAcademyStudentsForCoach,
  createAcademyStudent,
  patchAcademyStudent,
  removeAcademyStudent,
} from "./data.js";

const GRUPOS = {
  "Pádel": ["Avanzado", "Intermedio", "Principiantes"],
  "Tenis": ["Competitivo", "Bola amarilla", "Bola verde", "Bola naranja", "Bola roja"],
};

const COLORS = {
  ink: "#12211F",
  bg: "#FAF9F4",
  card: "#fff",
  border: "#E9E2D3",
  lime: "#C4D82E",
  muted: "#8A9A94",
  red: "#C4553F",
  amber: "#D9A93A",
  green: "#B7C98A",
};

// Datos que vivían solo en este dispositivo antes de moverse a la nube.
// Se usan una sola vez, para ofrecer migrarlos al primer inicio de sesión.
async function loadLocalBackup() {
  try {
    const list = JSON.parse((await storage.get("students", false)).value);
    return Array.isArray(list) && list.length > 0 ? list : null;
  } catch (e) {
    return null;
  }
}

async function loadLocalCoach() {
  try {
    return JSON.parse((await storage.get("coach", false)).value);
  } catch (e) {
    return null;
  }
}

const DEFAULT_COACH = { nombre: "", rol: "Coach de Padel", telefono: "", email: "", bio: "", academyId: "", isAdmin: true };

function fmt(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${d} ${meses[parseInt(m, 10) - 1]}`;
}

export default function CountryPadelApp() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = verificando, null = sin sesión
  const [students, setStudents] = useState(null);
  const [coach, setCoach] = useState(null);
  const [view, setView] = useState("directorio");
  const [selectedId, setSelectedId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [tab, setTab] = useState("perfil");
  const [saveError, setSaveError] = useState(false);
  const [showNuevoAlumno, setShowNuevoAlumno] = useState(false);
  const [migration, setMigration] = useState(null); // null=por revisar, {students}=ofrecer, "none"|"done"
  const [alumnosGrupo, setAlumnosGrupo] = useState(null);
  const [academyCoaches, setAcademyCoaches] = useState(null);
  const [selectedGrupoId, setSelectedGrupoId] = useState(null);

  useEffect(() => onAuthStateChanged(auth, setAuthUser), []);

  useEffect(() => {
    if (!authUser) return;
    setStudents(null);
    const unsub = watchStudents(authUser.uid, setStudents, () => setSaveError(true));
    getCoachProfile(authUser.uid).then((c) => setCoach({ ...DEFAULT_COACH, ...c }));
    return unsub;
  }, [authUser]);

  const isAdmin = coach ? coach.isAdmin : true;
  const academyId = coach ? coach.academyId || authUser?.uid : null;

  useEffect(() => {
    if (!authUser || !coach) return;
    setAlumnosGrupo(null);
    const unsub = isAdmin
      ? watchAcademyStudentsForAdmin(academyId, setAlumnosGrupo, () => setSaveError(true))
      : watchAcademyStudentsForCoach(authUser.uid, setAlumnosGrupo, () => setSaveError(true));
    return unsub;
  }, [authUser, coach, isAdmin, academyId]);

  useEffect(() => {
    if (!authUser || !coach || !isAdmin) return;
    const unsub = watchAcademyCoaches(academyId, setAcademyCoaches, () => {});
    return unsub;
  }, [authUser, coach, isAdmin, academyId]);

  useEffect(() => {
    if (!authUser || students === null || migration !== null) return;
    if (students.length > 0) {
      setMigration("none");
      return;
    }
    loadLocalBackup().then((local) => setMigration(local ? { students: local } : "none"));
  }, [authUser, students, migration]);

  const runMigration = async () => {
    if (!migration || !migration.students) return;
    for (const s of migration.students) {
      const { id, ...rest } = s;
      await createStudent(authUser.uid, rest);
    }
    const localCoach = await loadLocalCoach();
    if (localCoach) await saveCoachProfile(authUser.uid, localCoach);
    setMigration("done");
  };

  const updateStudent = async (id, patch) => {
    try {
      await patchStudent(id, patch);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  };

  const addStudent = async (data) => {
    const nuevo = {
      nombre: data.nombre,
      grupo: data.grupo || "Sin grupo",
      nivel: data.nivel || "—",
      mano: "—",
      lado: "—",
      telefono: "",
      miembroDesde: "",
      fisico: "",
      modalidad: "paquete",
      paquete: { nombre: "Sin paquete activo", total: 0, usadas: 0, vence: "", finalizado: true },
      paquetesAnteriores: [],
      asistencias: [],
      clasesPagadas: [],
      sesiones: [],
      puntos: [],
      objetivos: [],
      partidos: [],
      notas: [],
    };
    try {
      await createStudent(authUser.uid, nuevo);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
    setShowNuevoAlumno(false);
  };

  const deleteStudent = async (id) => {
    try {
      await removeStudent(id);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
    setSelectedId(null);
    setView("directorio");
  };

  const persistCoach = async (patch) => {
    const next = { ...coach, ...patch };
    setCoach(next);
    try {
      await saveCoachProfile(authUser.uid, patch);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  };

  const replaceAllStudents = async (data) => {
    try {
      await Promise.all(students.map((s) => removeStudent(s.id)));
      await Promise.all(data.map(({ id, ...rest }) => createStudent(authUser.uid, rest)));
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  };

  const addAlumnoGrupo = async (data) => {
    try {
      const id = await createAcademyStudent(academyId, {
        nombre: data.nombre,
        deporte: data.deporte,
        categoria: data.categoria,
        edad: data.edad || "",
        descripcion: "",
        puntos: [],
        assignedCoachUid: data.assignedCoachUid || null,
      });
      setSaveError(false);
      return id;
    } catch (e) {
      setSaveError(true);
      return null;
    }
  };

  const updateAlumnoGrupo = async (id, patch) => {
    try {
      await patchAcademyStudent(id, patch);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  };

  const deleteAlumnoGrupo = async (id) => {
    try {
      await removeAcademyStudent(id);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
    setSelectedGrupoId(null);
    setView("grupos");
  };

  const addCoach = async (email, password) => {
    await createCoachAccount(academyId, email, password);
  };

  if (authUser === undefined) {
    return (
      <div style={styles.app} className="app-shell">
        <style>{fontImport}</style>
        <div style={styles.loadingBox} className="phone-shell">
          <div className="spinner" style={styles.spinner} />
        </div>
      </div>
    );
  }

  if (authUser === null) {
    return <LoginScreen />;
  }

  if (!students || !coach) {
    return (
      <div style={styles.app} className="app-shell">
        <style>{fontImport}</style>
        <div style={styles.loadingBox} className="phone-shell">
          <div className="spinner" style={styles.spinner} />
        </div>
      </div>
    );
  }

  const selected = students.find((s) => s.id === selectedId);

  return (
    <div style={styles.app} className="app-shell">
      <style>{fontImport}</style>
      <div style={styles.phone} className="phone-shell">
        {saveError && (
          <div style={styles.saveErrorBanner}>No se pudo guardar el último cambio. Sigue intentando o revisa tu conexión.</div>
        )}
        {view === "directorio" && (
          <Directorio
            students={students}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            onSelect={(id) => {
              setSelectedId(id);
              setTab("perfil");
              setView("perfil");
            }}
            showNuevoAlumno={showNuevoAlumno}
            setShowNuevoAlumno={setShowNuevoAlumno}
            addStudent={addStudent}
            onImportAll={replaceAllStudents}
            coach={coach}
            onUpdateCoach={persistCoach}
            migration={migration}
            onMigrate={runMigration}
            onDismissMigration={() => setMigration("none")}
            onSignOut={() => signOut(auth)}
            isAdmin={isAdmin}
            nav={view}
            setNav={setView}
          />
        )}
        {view === "perfil" && selected && (
          <PerfilAlumno
            alumno={selected}
            tab={tab}
            setTab={setTab}
            onBack={() => setView("directorio")}
            onUpdate={(patch) => updateStudent(selected.id, patch)}
            onDelete={() => deleteStudent(selected.id)}
          />
        )}
        {view === "grupos" && (
          <GruposScreen
            isAdmin={isAdmin}
            alumnos={alumnosGrupo}
            academyCoaches={academyCoaches}
            nav={view}
            setNav={setView}
            onSelect={(id) => {
              setSelectedGrupoId(id);
              setView("grupoDetalle");
            }}
            onAdd={addAlumnoGrupo}
          />
        )}
        {view === "grupoDetalle" && (
          <AlumnoGrupoDetalle
            alumno={(alumnosGrupo || []).find((a) => a.id === selectedGrupoId)}
            academyCoaches={academyCoaches}
            onBack={() => setView("grupos")}
            onUpdate={(patch) => updateAlumnoGrupo(selectedGrupoId, patch)}
            onDelete={() => deleteAlumnoGrupo(selectedGrupoId)}
          />
        )}
        {view === "coaches" && (
          <CoachesScreen
            coaches={academyCoaches}
            nav={view}
            setNav={setView}
            onAddCoach={addCoach}
          />
        )}
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.app} className="app-shell">
      <style>{fontImport}</style>
      <div style={styles.phone} className="phone-shell">
        <div style={styles.header} className="header-safe">
          <div style={styles.brand}>COUNTRY PADEL</div>
          <div style={styles.titulo}>Iniciar sesión</div>
        </div>
        <div style={styles.content} className="content-safe">
          <form onSubmit={handleSubmit} style={styles.card}>
            <div style={styles.cardLabel}>Acceso del coach</div>
            <input
              style={styles.input}
              type="email"
              autoCapitalize="none"
              autoComplete="username"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              style={styles.input}
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div style={styles.importError}>{error}</div>}
            <button style={{ ...styles.primaryBtn, marginTop: 4 }} disabled={loading || !email.trim() || !password}>
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MigrationBanner({ count, onMigrate, onDismiss }) {
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ ...styles.card, marginBottom: 10 }}>
      <div style={styles.cardLabel}>Datos de este iPhone</div>
      <p style={styles.backupHint}>
        Encontramos {count} alumno{count !== 1 ? "s" : ""} guardado{count !== 1 ? "s" : ""} en este dispositivo, de antes de usar la nube. ¿Los subimos a tu cuenta?
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{ ...styles.addBtn, flex: 1 }}
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            await onMigrate();
            setLoading(false);
          }}
        >
          {loading ? "Subiendo…" : "Sí, subir"}
        </button>
        <button style={{ ...styles.secondaryBtnSmall, flex: 1 }} onClick={onDismiss} disabled={loading}>
          Ignorar
        </button>
      </div>
    </div>
  );
}

function NavSwitcher({ nav, setNav, isAdmin }) {
  const items = [["directorio", "Mis alumnos"], ["grupos", "Mis grupos"]];
  if (isAdmin) items.push(["coaches", "Coaches"]);
  return (
    <div style={styles.segmented}>
      {items.map(([key, label]) => (
        <button
          key={key}
          style={{ ...styles.segmentBtn, ...(nav === key || (key === "grupos" && nav === "grupoDetalle") ? styles.segmentBtnActive : {}) }}
          onClick={() => setNav(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Directorio({ students, busqueda, setBusqueda, onSelect, showNuevoAlumno, setShowNuevoAlumno, addStudent, onImportAll, coach, onUpdateCoach, migration, onMigrate, onDismissMigration, onSignOut, isAdmin, nav, setNav }) {
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
            <EditableRow k="" v={coach.bio || "Agrega una breve descripción o certificaciones"} onSave={(v) => onUpdateCoach({ bio: v })} multiline />
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
          {filtrados.length === 0 && <div style={styles.empty}>No hay alumnos que coincidan.</div>}
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
                  <div style={styles.meta}>{s.grupo} · Nivel {s.nivel}</div>
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

function GruposScreen({ isAdmin, alumnos, academyCoaches, nav, setNav, onSelect, onAdd }) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [nombre, setNombre] = useState("");
  const [deporte, setDeporte] = useState("Pádel");
  const [categoria, setCategoria] = useState(GRUPOS["Pádel"][0]);
  const [edad, setEdad] = useState("");
  const [coachUid, setCoachUid] = useState("");

  if (alumnos === null) {
    return (
      <div style={styles.content} className="content-safe">
        <div className="spinner" style={styles.spinner} />
      </div>
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
            <button style={styles.secondaryBtn} onClick={() => setShowNuevo((v) => !v)}>
              {showNuevo ? "Cancelar" : "+ Nuevo alumno de grupo"}
            </button>
            {showNuevo && (
              <div style={{ ...styles.card, marginTop: 10 }}>
                <input style={styles.input} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                <div style={{ display: "flex", gap: 6 }}>
                  <select
                    style={styles.select}
                    value={deporte}
                    onChange={(e) => { setDeporte(e.target.value); setCategoria(GRUPOS[e.target.value][0]); }}
                  >
                    {Object.keys(GRUPOS).map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <select style={{ ...styles.select, flex: 1 }} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    {GRUPOS[deporte].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <input style={styles.input} placeholder="Edad" value={edad} onChange={(e) => setEdad(e.target.value)} />
                <select style={{ ...styles.select, width: "100%" }} value={coachUid} onChange={(e) => setCoachUid(e.target.value)}>
                  <option value="">Sin asignar</option>
                  {(academyCoaches || []).map((c) => (
                    <option key={c.uid} value={c.uid}>{c.nombre || c.email || c.uid}</option>
                  ))}
                </select>
                <button
                  style={{ ...styles.primaryBtn, marginTop: 4 }}
                  disabled={!nombre.trim()}
                  onClick={async () => {
                    const id = await onAdd({ nombre: nombre.trim(), deporte, categoria, edad, assignedCoachUid: coachUid || null });
                    setNombre(""); setEdad(""); setCoachUid(""); setShowNuevo(false);
                    if (id) onSelect(id);
                  }}
                >
                  Guardar alumno
                </button>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 18 }}>
          {alumnos.length === 0 && <div style={styles.empty}>{isAdmin ? "Aún no hay alumnos de grupo." : "Todavía no tienes grupos asignados."}</div>}
          {grupoKeys.map((key) => (
            <div key={key}>
              <div style={styles.sesionesLabel}>{key}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
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
                          {a.puntos.map((p, i) => (
                            <div key={i} style={styles.puntoRow}>
                              <span style={{ ...styles.prioridadDot, background: p.prioridad === "Alta" ? COLORS.red : p.prioridad === "Media" ? COLORS.amber : COLORS.green }} />
                              <span style={styles.puntoTexto}>{p.texto}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AlumnoGrupoDetalle({ alumno, academyCoaches, onBack, onUpdate, onDelete }) {
  const [nuevoPuntoTexto, setNuevoPuntoTexto] = useState("");
  const [nuevoPuntoPrioridad, setNuevoPuntoPrioridad] = useState("Media");

  if (!alumno) {
    return (
      <div style={styles.content} className="content-safe">
        <div className="spinner" style={styles.spinner} />
      </div>
    );
  }

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.headerTopRow}>
          <button style={styles.backBtn} onClick={onBack}>← Mis grupos</button>
        </div>
        <div style={styles.playerRow}>
          <div style={styles.avatarBig}>{alumno.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
          <div style={{ flex: 1 }}>
            <div style={styles.playerName}>{alumno.nombre}</div>
            <div style={styles.playerMeta}>{alumno.deporte} · {alumno.categoria}</div>
          </div>
        </div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={styles.section}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>Datos</div>
            <EditableRow k="Nombre" v={alumno.nombre} onSave={(v) => onUpdate({ nombre: v })} />
            <EditableRow k="Edad" v={alumno.edad} onSave={(v) => onUpdate({ edad: v })} />
            <EditableRow k="" v={alumno.descripcion || "Tocar para agregar una descripción"} onSave={(v) => onUpdate({ descripcion: v })} multiline />
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Grupo</div>
            <div style={{ display: "flex", gap: 6 }}>
              <select
                style={styles.select}
                value={alumno.deporte}
                onChange={(e) => onUpdate({ deporte: e.target.value, categoria: GRUPOS[e.target.value][0] })}
              >
                {Object.keys(GRUPOS).map((d) => <option key={d}>{d}</option>)}
              </select>
              <select style={{ ...styles.select, flex: 1 }} value={alumno.categoria} onChange={(e) => onUpdate({ categoria: e.target.value })}>
                {GRUPOS[alumno.deporte].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Coach asignado</div>
            <select
              style={{ ...styles.select, width: "100%" }}
              value={alumno.assignedCoachUid || ""}
              onChange={(e) => onUpdate({ assignedCoachUid: e.target.value || null })}
            >
              <option value="">Sin asignar</option>
              {(academyCoaches || []).map((c) => (
                <option key={c.uid} value={c.uid}>{c.nombre || c.email || c.uid}</option>
              ))}
            </select>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>Lo que necesita trabajar</div>
            {(alumno.puntos || []).map((p, i) => (
              <div key={i} style={styles.puntoRow}>
                <span style={{ ...styles.prioridadDot, background: p.prioridad === "Alta" ? COLORS.red : p.prioridad === "Media" ? COLORS.amber : COLORS.green }} />
                <span style={{ ...styles.puntoTexto, flex: 1 }}>{p.texto}</span>
                <button
                  style={styles.deleteBtn}
                  onClick={() => onUpdate({ puntos: alumno.puntos.filter((_, j) => j !== i) })}
                  aria-label="Eliminar punto"
                >
                  ×
                </button>
              </div>
            ))}
            <div style={styles.miniForm}>
              <input style={styles.input} placeholder="Nuevo punto por trabajar" value={nuevoPuntoTexto} onChange={(e) => setNuevoPuntoTexto(e.target.value)} />
              <div style={{ display: "flex", gap: 6 }}>
                <select style={styles.select} value={nuevoPuntoPrioridad} onChange={(e) => setNuevoPuntoPrioridad(e.target.value)}>
                  <option>Alta</option>
                  <option>Media</option>
                  <option>Baja</option>
                </select>
                <button
                  style={{ ...styles.addBtn, flex: 1 }}
                  disabled={!nuevoPuntoTexto.trim()}
                  onClick={() => {
                    onUpdate({ puntos: [...(alumno.puntos || []), { texto: nuevoPuntoTexto.trim(), prioridad: nuevoPuntoPrioridad }] });
                    setNuevoPuntoTexto("");
                  }}
                >
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <button
            style={styles.dangerBtn}
            onClick={() => {
              if (window.confirm(`¿Eliminar a ${alumno.nombre} de los grupos?`)) onDelete();
            }}
          >
            Eliminar alumno de grupo
          </button>
        </div>
      </div>
    </>
  );
}

function CoachesScreen({ coaches, nav, setNav, onAddCoach }) {
  const [showNuevo, setShowNuevo] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creado, setCreado] = useState(null);

  return (
    <>
      <div style={styles.header} className="header-safe">
        <div style={styles.brand}>COUNTRY PADEL</div>
        <div style={styles.titulo}>Coaches</div>
      </div>
      <div style={styles.content} className="content-safe">
        <div style={{ marginBottom: 10 }}>
          <NavSwitcher nav={nav} setNav={setNav} isAdmin={true} />
        </div>

        <button style={styles.secondaryBtn} onClick={() => { setShowNuevo((v) => !v); setCreado(null); setError(""); }}>
          {showNuevo ? "Cancelar" : "+ Agregar coach"}
        </button>

        {showNuevo && (
          <div style={{ ...styles.card, marginTop: 10 }}>
            <div style={styles.cardLabel}>Nueva cuenta de coach</div>
            <input style={styles.input} type="email" autoCapitalize="none" placeholder="Correo del coach" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <div style={styles.importError}>{error}</div>}
            {creado && (
              <div style={styles.backupHint}>
                Cuenta creada. Pásale al coach estos datos para que entre:
                <br /><strong>Correo:</strong> {creado.email}
                <br /><strong>Contraseña temporal:</strong> {creado.password}
              </div>
            )}
            {!creado && (
              <button
                style={{ ...styles.primaryBtn, marginTop: 4 }}
                disabled={loading || !email.trim()}
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  const password = Array.from(crypto.getRandomValues(new Uint8Array(10))).map((b) => b.toString(36)).join("").slice(0, 12);
                  try {
                    await onAddCoach(email.trim(), password);
                    setCreado({ email: email.trim(), password });
                    setEmail("");
                  } catch (e) {
                    setError(e.code === "auth/email-already-in-use" ? "Ese correo ya tiene una cuenta." : "No se pudo crear la cuenta.");
                  }
                  setLoading(false);
                }}
              >
                {loading ? "Creando…" : "Crear cuenta"}
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {coaches === null && <div className="spinner" style={styles.spinner} />}
          {coaches && coaches.length === 0 && <div style={styles.empty}>Aún no has agregado coaches.</div>}
          {coaches && coaches.map((c) => (
            <div key={c.uid} style={styles.row}>
              <div style={styles.avatar}>{(c.nombre || c.email || "?").split(" ").map((n) => n[0]).slice(0, 2).join("")}</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={styles.nombre}>{c.nombre || "Sin nombre todavía"}</div>
                <div style={styles.meta}>{c.rol || "Coach"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

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
  const [nuevoPuntoTexto, setNuevoPuntoTexto] = useState("");
  const [nuevoPuntoPrioridad, setNuevoPuntoPrioridad] = useState("Media");
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

  // --- Nuevo paquete form (when finalizado) ---
  const [npNombre, setNpNombre] = useState("Paquete 8 clases");
  const [npTotal, setNpTotal] = useState(8);
  const [npVence, setNpVence] = useState("");

  const hoy = new Date();
  const anioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
  const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const primerDiaSemana = (new Date(hoy.getFullYear(), hoy.getMonth(), 1).getDay() + 6) % 7; // lunes=0

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
            <div style={styles.playerMeta}>{alumno.lado} · {alumno.mano} · {alumno.grupo}</div>
          </div>
          <div style={styles.levelBadge}>{alumno.nivel}</div>
        </div>
        {readOnly && coachProfile?.nombre && (
          <div style={styles.coachLine}>
            Coach: {coachProfile.nombre}{coachProfile.rol ? ` · ${coachProfile.rol}` : ""}
            {coachProfile.telefono ? ` · ${coachProfile.telefono}` : ""}
          </div>
        )}
      </div>

      <div style={styles.tabs}>
        {tabsList.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{ ...styles.tabBtn, color: tab === key ? COLORS.ink : COLORS.muted, fontWeight: tab === key ? 700 : 500 }}
          >
            {label}
            {tab === key && <div style={styles.tabIndicator} />}
          </button>
        ))}
      </div>

      <div style={styles.content} className="content-safe">
        {tab === "perfil" && (
          <div style={styles.section}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Datos de contacto</div>
              <EditableRow k="Teléfono" v={alumno.telefono} onSave={(v) => onUpdate({ telefono: v })} />
              <EditableRow k="Miembro desde" v={alumno.miembroDesde} onSave={(v) => onUpdate({ miembroDesde: v })} />
              <EditableRow k="Grupo" v={alumno.grupo} onSave={(v) => onUpdate({ grupo: v })} />
              <EditableRow k="Nivel" v={alumno.nivel} onSave={(v) => onUpdate({ nivel: v })} />
            </div>
            <div style={styles.card}>
              <div style={styles.cardLabel}>Físico / lesiones</div>
              <EditableRow k="" v={alumno.fisico || "Sin observaciones"} onSave={(v) => onUpdate({ fisico: v })} multiline />
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
                <div key={i} style={styles.puntoRow}>
                  <span style={{ ...styles.prioridadDot, background: p.prioridad === "Alta" ? COLORS.red : p.prioridad === "Media" ? COLORS.amber : COLORS.green }} />
                  <span style={{ ...styles.puntoTexto, flex: 1 }}>{p.texto}</span>
                  <button style={styles.deleteBtn} onClick={() => removeAt("puntos", i)} aria-label="Eliminar punto">×</button>
                </div>
              ))}
              <div style={styles.miniForm}>
                <input style={styles.input} placeholder="Nuevo punto por desarrollar" value={nuevoPuntoTexto} onChange={(e) => setNuevoPuntoTexto(e.target.value)} />
                <div style={{ display: "flex", gap: 6 }}>
                  <select style={styles.select} value={nuevoPuntoPrioridad} onChange={(e) => setNuevoPuntoPrioridad(e.target.value)}>
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                  <button
                    style={{ ...styles.addBtn, flex: 1 }}
                    disabled={!nuevoPuntoTexto.trim()}
                    onClick={() => {
                      onUpdate({ puntos: [...alumno.puntos, { texto: nuevoPuntoTexto.trim(), prioridad: nuevoPuntoPrioridad }] });
                      setNuevoPuntoTexto("");
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            </div>
            )}

            <div style={styles.sesionesLabel}>Bitácora de clases</div>
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
                <span style={{ ...styles.resultChip, background: alumno.paquete.finalizado ? COLORS.border : COLORS.lime }}>
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
                const chipStyle = {
                  ...styles.pagoChip,
                  background: pagada ? COLORS.lime : "transparent",
                  color: pagada ? COLORS.ink : COLORS.amber,
                  border: pagada ? "none" : `1.5px solid ${COLORS.amber}`,
                };
                return (
                  <div key={d} style={styles.pagoRow}>
                    <span style={styles.pagoFecha}>{fmt(d)}</span>
                    {readOnly ? (
                      <span style={chipStyle}>{pagada ? "Pagada" : "Pendiente"}</span>
                    ) : (
                      <button
                        style={chipStyle}
                        onClick={() => {
                          const next = pagada ? clasesPagadas.filter((x) => x !== d) : [...clasesPagadas, d];
                          onUpdate({ clasesPagadas: next });
                        }}
                      >
                        {pagada ? "Pagada" : "Pendiente"}
                      </button>
                    )}
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
                    color: asistio ? COLORS.lime : esHoy ? COLORS.ink : "#B7BDB8",
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
            {alumno.partidos.map((_, i) => i).reverse().map((i) => {
              const p = alumno.partidos[i];
              return (
                <div key={i} style={styles.matchCard}>
                  <div style={styles.matchTop}>
                    <span style={styles.matchDate}>{fmt(p.fecha) || p.fecha}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ ...styles.resultChip, background: p.resu === "W" ? COLORS.lime : COLORS.border }}>
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

function EditableRow({ k, v, onSave, multiline }) {
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(v || "");

  if (editando) {
    return (
      <div style={{ padding: "6px 0" }}>
        {multiline ? (
          <textarea style={styles.textarea} value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
        ) : (
          <input style={styles.input} value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
        )}
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <button style={styles.addBtn} onClick={() => { onSave(valor); setEditando(false); }}>Guardar</button>
          <button style={styles.secondaryBtnSmall} onClick={() => { setValor(v || ""); setEditando(false); }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.infoRow} onClick={() => setEditando(true)}>
      {k && <span style={styles.infoK}>{k}</span>}
      <span style={{ ...styles.infoV, cursor: "pointer", flex: k ? undefined : 1 }}>{v || "Tocar para agregar"}</span>
    </div>
  );
}

const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; }
  input, textarea, select, button { -webkit-tap-highlight-color: transparent; }

  @media (max-width: 480px) {
    .app-shell { padding: 0 !important; align-items: stretch !important; }
    .phone-shell {
      width: 100% !important;
      max-width: 100% !important;
      height: 100dvh !important;
      border-radius: 0 !important;
      box-shadow: none !important;
    }
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.8s linear infinite; }

  @media (display-mode: standalone) {
    .header-safe { padding-top: max(18px, env(safe-area-inset-top)) !important; }
    .content-safe { padding-bottom: max(30px, env(safe-area-inset-bottom)) !important; }
  }
`;

const styles = {
  app: { minHeight: "100vh", background: "#0F1E1C", display: "flex", justifyContent: "center", fontFamily: "'Archivo', sans-serif", padding: "24px 12px" },
  phone: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, overflow: "hidden", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column", height: 780, position: "relative" },
  loadingBox: { width: 390, maxWidth: "100%", background: COLORS.bg, borderRadius: 28, boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", height: 780 },
  spinner: { width: 32, height: 32, borderRadius: "50%", border: "3px solid #EFEAE0", borderTopColor: COLORS.ink },
  saveErrorBanner: { position: "absolute", top: 0, left: 0, right: 0, background: COLORS.red, color: "#fff", fontSize: 11, textAlign: "center", padding: "6px 10px", zIndex: 5 },
  header: { background: COLORS.ink, color: COLORS.bg, padding: "18px 18px 0" },
  headerTopRow: { marginBottom: 10 },
  backBtn: { background: "none", border: "none", color: COLORS.bg, fontSize: 13, cursor: "pointer", padding: 0, opacity: 0.85, fontFamily: "'Archivo', sans-serif" },
  brand: { fontFamily: "'Archivo Black', sans-serif", fontSize: 12, letterSpacing: 2, opacity: 0.8 },
  titulo: { fontFamily: "'Archivo Black', sans-serif", fontSize: 24, marginTop: 8, marginBottom: 14 },
  search: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: COLORS.bg, fontSize: 13.5, fontFamily: "'Archivo', sans-serif", outline: "none", marginBottom: 16 },
  playerRow: { display: "flex", alignItems: "center", gap: 14, paddingBottom: 16 },
  avatarBig: { width: 50, height: 50, borderRadius: "50%", background: COLORS.lime, color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, fontFamily: "'Archivo Black', sans-serif", flexShrink: 0 },
  playerName: { fontFamily: "'Archivo Black', sans-serif", fontSize: 19 },
  playerMeta: { fontSize: 12, opacity: 0.65, marginTop: 3 },
  levelBadge: { background: "rgba(196,216,46,0.15)", border: "1px solid rgba(196,216,46,0.5)", color: COLORS.lime, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "5px 9px" },
  readOnlyBadge: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 10, letterSpacing: "0.06em", color: COLORS.ink, background: COLORS.lime, borderRadius: 999, padding: "4px 9px 3px" },
  coachLine: { fontSize: 11.5, color: COLORS.bg, opacity: 0.7, paddingBottom: 14 },
  tabs: { display: "flex", background: COLORS.bg, borderBottom: `1px solid ${COLORS.border}`, padding: "0 14px", overflowX: "auto", whiteSpace: "nowrap" },
  tabBtn: { background: "none", border: "none", padding: "13px 0", marginRight: 18, fontSize: 13.5, cursor: "pointer", position: "relative", fontFamily: "'Archivo', sans-serif", flexShrink: 0 },
  tabIndicator: { position: "absolute", bottom: -1, left: 0, right: 0, height: 3, background: COLORS.lime, borderRadius: 2 },
  content: { flex: 1, overflowY: "auto", padding: "16px 18px 30px", WebkitOverflowScrolling: "touch" },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14 },
  cardLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.muted, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" },
  empty: { fontSize: 13, color: COLORS.muted, textAlign: "center", padding: "30px 10px" },
  row: { display: "flex", alignItems: "center", gap: 12, background: COLORS.card, border: `1.5px solid ${COLORS.border}`, borderRadius: 14, padding: 12, cursor: "pointer", width: "100%", fontFamily: "'Archivo', sans-serif" },
  avatar: { width: 40, height: 40, borderRadius: "50%", background: "#EFF3E2", color: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, fontFamily: "'Archivo Black', sans-serif", flexShrink: 0 },
  nombre: { fontSize: 14, fontWeight: 700, color: COLORS.ink },
  meta: { fontSize: 11.5, color: COLORS.muted, marginTop: 2 },
  restantesTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, fontWeight: 700 },
  alertaDot: { width: 7, height: 7, borderRadius: "50%", background: COLORS.red },
  infoRow: { display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "7px 0", cursor: "pointer" },
  infoK: { color: COLORS.muted },
  infoV: { color: COLORS.ink, fontWeight: 600 },
  objetivoRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, borderBottom: "1px solid #F0EDE3", paddingBottom: 9, marginBottom: 9 },
  objetivoTexto: { fontSize: 13, color: COLORS.ink, fontWeight: 600, lineHeight: 1.4 },
  objetivoPlazo: { fontSize: 10.5, color: COLORS.muted, marginTop: 2 },
  objetivoFecha: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7A8C87", whiteSpace: "nowrap" },
  puntoRow: { display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 8 },
  prioridadDot: { width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0 },
  puntoTexto: { fontSize: 13, color: COLORS.ink, lineHeight: 1.4 },
  sesionesLabel: { fontSize: 10.5, letterSpacing: 1, color: COLORS.muted, fontWeight: 700, marginTop: 4 },
  sesionCard: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14, marginBottom: 4 },
  sesionEnfoque: { fontSize: 14, fontWeight: 700, color: COLORS.ink, marginTop: 6 },
  matchDate: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: COLORS.muted },
  ejercicioList: { margin: "8px 0 0", paddingLeft: 18 },
  ejercicioItem: { fontSize: 12.5, color: "#5C6D67", lineHeight: 1.6 },
  segmented: { display: "flex", background: "#EFEAE0", borderRadius: 10, padding: 3, gap: 3 },
  segmentBtn: { flex: 1, background: "transparent", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12.5, fontWeight: 600, color: COLORS.muted, cursor: "pointer", fontFamily: "'Archivo', sans-serif" },
  segmentBtnActive: { background: COLORS.card, color: COLORS.ink, fontWeight: 700, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  pagoResumen: { display: "flex", gap: 10, marginBottom: 6 },
  pagoResumenPagadas: { fontSize: 12.5, fontWeight: 700, color: COLORS.ink },
  pagoResumenPendientes: { fontSize: 12.5, fontWeight: 700, color: COLORS.amber },
  pagoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `1px solid #F0EDE3` },
  pagoFecha: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: COLORS.ink },
  pagoChip: { fontSize: 11, fontWeight: 700, borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: "'Archivo', sans-serif" },
  paqueteTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  paqueteVence: { fontSize: 11.5, color: COLORS.muted, marginTop: 2 },
  paqueteBarWrap: { marginTop: 12 },
  paqueteBarBg: { height: 8, borderRadius: 6, background: "#EFEAE0", overflow: "hidden" },
  paqueteBarFill: { height: "100%", background: COLORS.ink, borderRadius: 6 },
  paqueteNums: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  paqueteRestantes: { fontSize: 13, fontWeight: 700, color: COLORS.ink },
  paqueteUsadas: { fontSize: 11.5, color: COLORS.muted },
  usadasControl: { display: "flex", alignItems: "center", gap: 8 },
  stepBtn: { width: 22, height: 22, borderRadius: 6, border: "1px solid #D8D0BE", background: "#fff", color: COLORS.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  finalizarBtn: { width: "100%", marginTop: 12, background: "transparent", border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, borderRadius: 10, padding: "9px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Archivo', sans-serif" },
  calGrid: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginTop: 4 },
  calDow: { fontSize: 10, color: "#B7BDB8", textAlign: "center", fontWeight: 700, paddingBottom: 4 },
  calDay: { fontSize: 11.5, textAlign: "center", padding: "6px 0", borderRadius: 7, fontFamily: "'JetBrains Mono', monospace", border: "none", cursor: "pointer", background: "transparent" },
  calFootnote: { fontSize: 11, color: "#7A8C87", marginTop: 10 },
  matchCard: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 14 },
  matchTop: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  resultChip: { fontSize: 10, fontWeight: 800, letterSpacing: 0.5, padding: "3px 8px", borderRadius: 6, color: COLORS.ink },
  rival: { fontSize: 15, fontWeight: 700, marginTop: 8, color: COLORS.ink },
  score: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: COLORS.ink, marginTop: 2 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 },
  tag: { fontSize: 10.5, background: "#EFF3E2", color: "#4E5C3B", padding: "4px 8px", borderRadius: 20, fontWeight: 600 },
  matchNote: { fontSize: 12.5, color: "#5C6D67", marginTop: 10, lineHeight: 1.5 },
  timeline: { position: "relative", paddingLeft: 4 },
  timelineItem: { display: "flex", gap: 12, paddingBottom: 20, position: "relative" },
  timelineDot: { width: 9, height: 9, borderRadius: "50%", background: COLORS.lime, marginTop: 5, flexShrink: 0, boxShadow: "0 0 0 4px #EFF3E2" },
  noteTop: { display: "flex", justifyContent: "space-between" },
  noteAuthor: { fontSize: 13, fontWeight: 700, color: COLORS.ink },
  noteDate: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: COLORS.muted },
  noteText: { fontSize: 13, color: "#3F4C47", marginTop: 4, lineHeight: 1.5 },
  input: { width: "100%", padding: "9px 10px", borderRadius: 9, border: `1px solid ${COLORS.border}`, fontSize: 13, fontFamily: "'Archivo', sans-serif", marginBottom: 7, outline: "none", color: COLORS.ink },
  textarea: { width: "100%", padding: "9px 10px", borderRadius: 9, border: `1px solid ${COLORS.border}`, fontSize: 13, fontFamily: "'Archivo', sans-serif", marginBottom: 7, outline: "none", minHeight: 60, resize: "vertical", color: COLORS.ink },
  select: { padding: "9px 8px", borderRadius: 9, border: `1px solid ${COLORS.border}`, fontSize: 12.5, fontFamily: "'Archivo', sans-serif", marginBottom: 7, color: COLORS.ink, background: "#fff" },
  miniForm: { marginTop: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 },
  addBtn: { background: COLORS.ink, color: COLORS.lime, border: "none", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Archivo', sans-serif", width: "100%" },
  secondaryBtn: { background: "transparent", border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, borderRadius: 10, padding: "9px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Archivo', sans-serif", width: "100%" },
  secondaryBtnSmall: { background: "transparent", border: `1px solid ${COLORS.border}`, color: COLORS.muted, borderRadius: 9, padding: "9px 0", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Archivo', sans-serif", flex: 1 },
  primaryBtn: { background: COLORS.ink, color: COLORS.lime, border: "none", borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Archivo', sans-serif", width: "100%" },
  iconBtn: { width: 44, flexShrink: 0, background: "transparent", border: `1.5px solid ${COLORS.ink}`, color: COLORS.ink, borderRadius: 10, fontSize: 16, cursor: "pointer" },
  backupHint: { fontSize: 12, color: COLORS.muted, lineHeight: 1.5, margin: "0 0 10px" },
  importError: { fontSize: 12, color: COLORS.red, marginTop: 8 },
  deleteBtn: { background: "none", border: "none", color: COLORS.muted, fontSize: 18, lineHeight: 1, cursor: "pointer", padding: "2px 4px", flexShrink: 0 },
  dangerBtn: { width: "100%", background: "transparent", border: `1.5px solid ${COLORS.red}`, color: COLORS.red, borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Archivo', sans-serif", marginTop: 4 },
};
