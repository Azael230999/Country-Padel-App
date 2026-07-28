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
} from "firebase/firestore";

const studentsCol = collection(db, "students");
const academyStudentsCol = collection(db, "academyStudents");
const coachesCol = collection(db, "coaches");

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
  return withSecondaryAuth(async (secondaryAuth) => {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const uid = cred.user.uid;
    await setDoc(doc(db, "coaches", uid), {
      nombre: "",
      rol: "Coach",
      telefono: "",
      email: "",
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

export function watchAcademyStudentsForCoach(coachUid, callback, onError) {
  const q = query(academyStudentsCol, where("assignedCoachUid", "==", coachUid));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
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
