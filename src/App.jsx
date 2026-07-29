import React, { useState, useEffect } from "react";
import { storage } from "./storage.js";
import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
  watchGroupAssignments,
  saveGroupAssignments,
  applyGroupAssignmentToStudents,
  watchAcademyConfig,
  saveAcademyConfig,
  watchGroupSchedule,
  saveGroupSchedule,
} from "./data.js";
import { DEFAULT_COACH, DEFAULT_GRUPOS, grupoLabel } from "./constants.js";
import { styles, fontImport } from "./styles.js";
import { LoginScreen } from "./screens/LoginScreen.jsx";
import { Directorio } from "./screens/Directorio.jsx";
import { GruposScreen } from "./screens/GruposScreen.jsx";
import { AlumnoGrupoDetalle } from "./screens/AlumnoGrupoDetalle.jsx";
import { CoachesScreen } from "./screens/CoachesScreen.jsx";
import { PerfilAlumno } from "./screens/PerfilAlumno.jsx";

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
  const [groupAssignments, setGroupAssignments] = useState(null); // { "Pádel · Avanzado": [coachUid, ...] }
  const [academyGrupos, setAcademyGrupos] = useState(null); // { "Pádel": ["Avanzado", ...] }
  const [groupSchedule, setGroupSchedule] = useState(null); // { "Pádel · Avanzado": { horario, plan } }

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
    if (!authUser || !coach || !isAdmin) return;
    const unsub = watchGroupAssignments(academyId, setGroupAssignments, () => {});
    return unsub;
  }, [authUser, coach, isAdmin, academyId]);

  useEffect(() => {
    if (!authUser || !coach || !isAdmin) return;
    const unsub = watchAcademyConfig(
      academyId,
      (grupos) => {
        if (grupos === null) {
          // primera vez: siembra los valores por defecto
          saveAcademyConfig(academyId, DEFAULT_GRUPOS).catch(() => setSaveError(true));
        } else {
          setAcademyGrupos(grupos);
        }
      },
      () => {}
    );
    return unsub;
  }, [authUser, coach, isAdmin, academyId]);

  useEffect(() => {
    if (!authUser || !coach) return;
    const unsub = watchGroupSchedule(academyId, setGroupSchedule, () => {});
    return unsub;
  }, [authUser, coach, academyId]);

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
      const label = grupoLabel(data.deporte, data.categoria);
      const id = await createAcademyStudent(academyId, {
        nombre: data.nombre,
        deporte: data.deporte,
        categoria: data.categoria,
        edad: data.edad || "",
        descripcion: "",
        puntos: [],
        assignedCoachUids: (groupAssignments && groupAssignments[label]) || [],
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
      if (patch.deporte || patch.categoria) {
        const actual = (alumnosGrupo || []).find((a) => a.id === id);
        const deporte = patch.deporte || actual?.deporte;
        const categoria = patch.categoria || actual?.categoria;
        const label = grupoLabel(deporte, categoria);
        patch = { ...patch, assignedCoachUids: (groupAssignments && groupAssignments[label]) || [] };
      }
      await patchAcademyStudent(id, patch);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  };

  const updateGroupAssignments = async (label, coachUids) => {
    const next = { ...(groupAssignments || {}), [label]: coachUids };
    setGroupAssignments(next);
    try {
      await saveGroupAssignments(academyId, next);
      const [deporte, categoria] = label.split(" · ");
      const affectedIds = (alumnosGrupo || [])
        .filter((a) => a.deporte === deporte && a.categoria === categoria)
        .map((a) => a.id);
      if (affectedIds.length > 0) await applyGroupAssignmentToStudents(affectedIds, coachUids);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
  };

  const updateGroupSchedule = async (label, patch) => {
    const next = { ...(groupSchedule || {}), [label]: { ...(groupSchedule?.[label] || {}), ...patch } };
    setGroupSchedule(next);
    try {
      await saveGroupSchedule(academyId, next);
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

  const updateAcademyGrupos = async (nextGrupos) => {
    setAcademyGrupos(nextGrupos);
    try {
      await saveAcademyConfig(academyId, nextGrupos);
      setSaveError(false);
    } catch (e) {
      setSaveError(true);
    }
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
            grupos={academyGrupos || DEFAULT_GRUPOS}
            schedule={groupSchedule || {}}
            onUpdateSchedule={updateGroupSchedule}
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
            groupAssignments={groupAssignments}
            grupos={academyGrupos || DEFAULT_GRUPOS}
            onBack={() => setView("grupos")}
            onUpdate={(patch) => updateAlumnoGrupo(selectedGrupoId, patch)}
            onDelete={() => deleteAlumnoGrupo(selectedGrupoId)}
          />
        )}
        {view === "coaches" && (
          <CoachesScreen
            coaches={academyCoaches}
            groupAssignments={groupAssignments}
            onUpdateAssignments={updateGroupAssignments}
            grupos={academyGrupos || DEFAULT_GRUPOS}
            onUpdateGrupos={updateAcademyGrupos}
            alumnos={alumnosGrupo}
            nav={view}
            setNav={setView}
            onAddCoach={addCoach}
          />
        )}
      </div>
    </div>
  );
}
