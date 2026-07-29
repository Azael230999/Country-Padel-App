import { db, withSecondaryAuth } from "./firebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

const studentsCol = collection(db, "students");
const academyStudentsCol = collection(db, "academyStudents");
const coachesCol = collection(db, "coaches");
const academyEventsCol = collection(db, "academyEvents");

// ---------- Alumnos privados (sin cambios de comportamiento) ----------

export function watchStudents(coachUid, callback, onError) {
  const q = query(studentsCol, where("coachUid", "==", coachUid));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function createStudent(coachUid, student) {
  const id = crypto.randomUUID();
  await setDoc(doc(studentsCol, id), { ...student, coachUid });
  return id;
}

export async function patchStudent(id, patch) {
  await updateDoc(doc(studentsCol, id), patch);
}

export async function removeStudent(id) {
  await deleteDoc(doc(studentsCol, id));
}

export function watchStudentPublic(id, callback, onError) {
  return onSnapshot(
    doc(studentsCol, id),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );
}

export function watchAcademyStudentPublic(id, callback, onError) {
  return onSnapshot(
    doc(academyStudentsCol, id),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );
}

// ---------- Perfil del coach / academia ----------

export async function getCoachProfile(uid) {
  const snap = await getDoc(doc(db, "coaches", uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveCoachProfile(uid, patch) {
  await setDoc(doc(db, "coaches", uid), patch, { merge: true });
}

export function watchAcademyCoaches(academyId, callback, onError) {
  const q = query(coachesCol, where("academyId", "==", academyId));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
    onError
  );
}

// Crea la cuenta de un coach nuevo para la academia, sin afectar la sesión
// del admin que la está creando.
export async function createCoachAccount(academyId, email, password) {
  return withSecondaryAuth(async (secondaryAuth, secondaryDb) => {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    await setDoc(doc(secondaryDb, "coaches", uid), {
      nombre: "",
      rol: "Coach",
      telefono: "",
      email,
      bio: "",
      academyId,
      isAdmin: false,
    });
    await signOut(secondaryAuth);
    return uid;
  });
}

// ---------- Alumnos de grupo (clases grupales de la academia) ----------

export function watchAcademyStudentsForAdmin(academyId, callback, onError) {
  const q = query(academyStudentsCol, where("academyId", "==", academyId));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// assignedCoachUids vive en cada alumno (copia del grupo al que pertenece) para
// que la regla de seguridad de "list" no dependa de leer otro documento —
// Firestore no permite eso para consultas de lista, solo para lecturas de un
// documento individual.
export function watchAcademyStudentsForCoach(coachUid, callback, onError) {
  const q = query(academyStudentsCol, where("assignedCoachUids", "array-contains", coachUid));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// ---------- Asignación de coaches a grupos (deporte + categoría) ----------

export function watchGroupAssignments(academyId, callback, onError) {
  return onSnapshot(
    doc(db, "groupAssignments", academyId),
    (snap) => callback(snap.exists() ? snap.data().asignaciones || {} : {}),
    onError
  );
}

export async function saveGroupAssignments(academyId, asignaciones) {
  await setDoc(doc(db, "groupAssignments", academyId), { asignaciones }, { merge: true });
}

// ---------- Horario y plan de entrenamiento por grupo (editable por el admin) ----------

export function watchGroupSchedule(academyId, callback, onError) {
  return onSnapshot(
    doc(db, "groupSchedule", academyId),
    (snap) => callback(snap.exists() ? snap.data().programas || {} : {}),
    onError
  );
}

export async function saveGroupSchedule(academyId, programas) {
  await setDoc(doc(db, "groupSchedule", academyId), { programas }, { merge: true });
}

// Copia horario/plan en cada alumno de ese grupo, para poder mostrárselos en
// su link público sin que su regla de seguridad necesite leer otro documento.
export async function applyGroupScheduleToStudents(studentIds, patch) {
  const batch = writeBatch(db);
  studentIds.forEach((id) => batch.update(doc(academyStudentsCol, id), patch));
  await batch.commit();
}

// ---------- Configuración de categorías de grupo (editable por el admin) ----------

// callback recibe null si la academia todavía no tiene config propia (para
// que el llamador la siembre con los valores por defecto).
export function watchAcademyConfig(academyId, callback, onError) {
  return onSnapshot(
    doc(db, "academyConfig", academyId),
    (snap) => callback(snap.exists() ? snap.data().grupos || {} : null),
    onError
  );
}

export async function saveAcademyConfig(academyId, grupos) {
  await setDoc(doc(db, "academyConfig", academyId), { grupos }, { merge: true });
}

// Copia la lista de coaches asignados a cada alumno de ese grupo, para que la
// regla de seguridad pueda revisarlo sin leer otro documento.
export async function applyGroupAssignmentToStudents(studentIds, coachUids) {
  const batch = writeBatch(db);
  studentIds.forEach((id) => batch.update(doc(academyStudentsCol, id), { assignedCoachUids: coachUids }));
  await batch.commit();
}

export async function createAcademyStudent(academyId, data) {
  const id = crypto.randomUUID();
  await setDoc(doc(academyStudentsCol, id), { ...data, academyId });
  return id;
}

export async function patchAcademyStudent(id, patch) {
  await updateDoc(doc(academyStudentsCol, id), patch);
}

export async function removeAcademyStudent(id) {
  await deleteDoc(doc(academyStudentsCol, id));
}

// ---------- Calendario de eventos de la academia ----------

export function watchAcademyEventsForAdmin(academyId, callback, onError) {
  const q = query(academyEventsCol, where("academyId", "==", academyId));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

// audienceUids vive en cada evento (todos los coaches de la academia al
// momento de crearlo/editarlo, o solo los elegidos) para que la regla de
// seguridad de "list" no dependa de leer otro documento.
export function watchAcademyEventsForCoach(coachUid, callback, onError) {
  const q = query(academyEventsCol, where("audienceUids", "array-contains", coachUid));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function createAcademyEvent(academyId, data) {
  const id = crypto.randomUUID();
  await setDoc(doc(academyEventsCol, id), { ...data, academyId });
  return id;
}

export async function patchAcademyEvent(id, patch) {
  await updateDoc(doc(academyEventsCol, id), patch);
}

export async function removeAcademyEvent(id) {
  await deleteDoc(doc(academyEventsCol, id));
}
