import { db } from "./firebase";
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

export async function getCoachProfile(uid) {
  const snap = await getDoc(doc(db, "coaches", uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveCoachProfile(uid, patch) {
  await setDoc(doc(db, "coaches", uid), patch, { merge: true });
}

export function watchStudentPublic(id, callback, onError) {
  return onSnapshot(
    doc(studentsCol, id),
    (snap) => callback(snap.exists() ? { id: snap.id, ...snap.data() } : null),
    onError
  );
}

export async function hasAnyStudents(coachUid) {
  const q = query(studentsCol, where("coachUid", "==", coachUid));
  const snap = await getDocs(q);
  return !snap.empty;
}
