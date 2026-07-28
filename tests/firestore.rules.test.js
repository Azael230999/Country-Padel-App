import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";
import fs from "node:fs";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-country-padel",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

const ADMIN_UID = "admin1";
const COACH1_UID = "coach1";
const COACH2_UID = "coach2";
const OTHER_ACADEMY_ADMIN_UID = "admin2";

function dbAs(uid) {
  return uid ? testEnv.authenticatedContext(uid).firestore() : testEnv.unauthenticatedContext().firestore();
}

async function seed(setupFn) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setupFn(ctx.firestore());
  });
}

describe("students (clases privadas)", () => {
  it("un coach puede leer y escribir sus propios alumnos privados", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "students", "kid1"), { nombre: "Ana", coachUid: COACH1_UID });
    });
    const db1 = dbAs(COACH1_UID);
    await assertSucceeds(getDoc(doc(db1, "students", "kid1")));
    await assertSucceeds(updateDoc(doc(db1, "students", "kid1"), { nombre: "Ana G" }));
    await assertSucceeds(
      getDocs(query(collection(db1, "students"), where("coachUid", "==", COACH1_UID)))
    );
  });

  it("otro coach NO puede listar ni escribir los alumnos privados de otro coach", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "students", "kid1"), { nombre: "Ana", coachUid: COACH1_UID });
    });
    const db2 = dbAs(COACH2_UID);
    await assertFails(updateDoc(doc(db2, "students", "kid1"), { nombre: "Hackeado" }));
    await assertFails(deleteDoc(doc(db2, "students", "kid1")));
    await assertFails(
      getDocs(query(collection(db2, "students"), where("coachUid", "==", COACH1_UID)))
    );
  });

  it("cualquiera puede leer un alumno privado individual (link mágico de solo lectura)", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "students", "kid1"), { nombre: "Ana", coachUid: COACH1_UID });
    });
    const dbAnon = dbAs(null);
    await assertSucceeds(getDoc(doc(dbAnon, "students", "kid1")));
  });

  it("un coach no puede crear un alumno privado a nombre de otro coach", async () => {
    const db1 = dbAs(COACH1_UID);
    await assertFails(setDoc(doc(db1, "students", "kid2"), { nombre: "Falso", coachUid: COACH2_UID }));
  });
});

describe("coaches (perfil de academia)", () => {
  it("cualquiera puede leer el perfil individual de un coach", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "coaches", COACH1_UID), { nombre: "Coach Uno", academyId: ADMIN_UID });
    });
    const dbAnon = dbAs(null);
    await assertSucceeds(getDoc(doc(dbAnon, "coaches", COACH1_UID)));
  });

  it("un coach solo puede escribir su propio documento de perfil", async () => {
    const db1 = dbAs(COACH1_UID);
    await assertSucceeds(setDoc(doc(db1, "coaches", COACH1_UID), { nombre: "Coach Uno", academyId: ADMIN_UID }));
    await assertFails(setDoc(doc(db1, "coaches", COACH2_UID), { nombre: "Hackeado", academyId: ADMIN_UID }));
  });

  it("el admin puede listar los coaches de su propia academia", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "coaches", COACH1_UID), { nombre: "Coach Uno", academyId: ADMIN_UID });
      await setDoc(doc(db, "coaches", COACH2_UID), { nombre: "Coach Dos", academyId: ADMIN_UID });
    });
    const dbAdmin = dbAs(ADMIN_UID);
    const snap = await assertSucceeds(
      getDocs(query(collection(dbAdmin, "coaches"), where("academyId", "==", ADMIN_UID)))
    );
    if (snap.size !== 2) throw new Error("esperaba 2 coaches, obtuve " + snap.size);
  });

  it("un coach NO puede listar los coaches de otra academia", async () => {
    await seed(async (db) => {
      await setDoc(doc(db, "coaches", COACH1_UID), { nombre: "Coach Uno", academyId: OTHER_ACADEMY_ADMIN_UID });
    });
    const dbAdmin = dbAs(ADMIN_UID);
    await assertFails(
      getDocs(query(collection(dbAdmin, "coaches"), where("academyId", "==", OTHER_ACADEMY_ADMIN_UID)))
    );
  });
});

describe("academyStudents (clases de grupo) — asignación por grupo, muchos-a-muchos", () => {
  async function seedTwoGroups() {
    await seed(async (db) => {
      await setDoc(doc(db, "academyStudents", "kidA1"), {
        academyId: ADMIN_UID,
        deporte: "Padel",
        categoria: "Avanzado",
        nombre: "Alumno A1",
        assignedCoachUids: [COACH1_UID, COACH2_UID],
      });
      await setDoc(doc(db, "academyStudents", "kidA2"), {
        academyId: ADMIN_UID,
        deporte: "Padel",
        categoria: "Avanzado",
        nombre: "Alumno A2",
        assignedCoachUids: [COACH1_UID, COACH2_UID],
      });
      await setDoc(doc(db, "academyStudents", "kidB1"), {
        academyId: ADMIN_UID,
        deporte: "Tenis",
        categoria: "Bola verde",
        nombre: "Alumno B1",
        assignedCoachUids: [COACH1_UID],
      });
    });
  }

  it("el admin puede listar todos los alumnos de su academia", async () => {
    await seedTwoGroups();
    const dbAdmin = dbAs(ADMIN_UID);
    const snap = await assertSucceeds(
      getDocs(query(collection(dbAdmin, "academyStudents"), where("academyId", "==", ADMIN_UID)))
    );
    if (snap.size !== 3) throw new Error("esperaba 3 alumnos, obtuve " + snap.size);
  });

  it("coach1 (en ambos grupos) ve los 3 alumnos vía assignedCoachUids array-contains", async () => {
    await seedTwoGroups();
    const db1 = dbAs(COACH1_UID);
    const snap = await assertSucceeds(
      getDocs(query(collection(db1, "academyStudents"), where("assignedCoachUids", "array-contains", COACH1_UID)))
    );
    if (snap.size !== 3) throw new Error("esperaba 3 alumnos para coach1, obtuve " + snap.size);
  });

  it("coach2 (solo en un grupo) ve únicamente los 2 alumnos de ese grupo", async () => {
    await seedTwoGroups();
    const db2 = dbAs(COACH2_UID);
    const snap = await assertSucceeds(
      getDocs(query(collection(db2, "academyStudents"), where("assignedCoachUids", "array-contains", COACH2_UID)))
    );
    if (snap.size !== 2) throw new Error("esperaba 2 alumnos para coach2, obtuve " + snap.size);
  });

  it("un coach no asignado a ningún grupo no ve nada", async () => {
    await seedTwoGroups();
    const dbNadie = dbAs("coach-sin-grupos");
    const snap = await assertSucceeds(
      getDocs(query(collection(dbNadie, "academyStudents"), where("assignedCoachUids", "array-contains", "coach-sin-grupos")))
    );
    if (snap.size !== 0) throw new Error("esperaba 0 alumnos, obtuve " + snap.size);
  });

  it("un coach no puede escribir ni crear alumnos de grupo, solo el admin", async () => {
    await seedTwoGroups();
    const db2 = dbAs(COACH2_UID);
    await assertFails(updateDoc(doc(db2, "academyStudents", "kidA1"), { edad: "99" }));
    await assertFails(deleteDoc(doc(db2, "academyStudents", "kidA1")));
    await assertFails(
      setDoc(doc(db2, "academyStudents", "hack1"), {
        academyId: ADMIN_UID,
        deporte: "Padel",
        categoria: "Avanzado",
        nombre: "Hacker",
        assignedCoachUids: [COACH2_UID],
      })
    );

    const dbAdmin = dbAs(ADMIN_UID);
    await assertSucceeds(updateDoc(doc(dbAdmin, "academyStudents", "kidA1"), { edad: "12" }));
  });

  it("el admin puede reasignar un grupo con un batch y el coach ve el cambio de inmediato", async () => {
    await seedTwoGroups();
    const dbAdmin = dbAs(ADMIN_UID);
    const batch = writeBatch(dbAdmin);
    batch.update(doc(dbAdmin, "academyStudents", "kidB1"), { assignedCoachUids: [COACH2_UID] });
    await assertSucceeds(batch.commit());

    const db2 = dbAs(COACH2_UID);
    const snap = await assertSucceeds(
      getDocs(query(collection(db2, "academyStudents"), where("assignedCoachUids", "array-contains", COACH2_UID)))
    );
    if (snap.size !== 3) throw new Error("esperaba 3 alumnos para coach2 tras reasignar, obtuve " + snap.size);
  });
});

describe("academyConfig (categorías de grupo editables)", () => {
  it("solo el admin puede leer y escribir la configuración de categorías", async () => {
    const dbAdmin = dbAs(ADMIN_UID);
    await assertSucceeds(
      setDoc(doc(dbAdmin, "academyConfig", ADMIN_UID), { grupos: { "Pádel": ["Avanzado"] } })
    );
    await assertSucceeds(getDoc(doc(dbAdmin, "academyConfig", ADMIN_UID)));

    const db2 = dbAs(COACH2_UID);
    await assertFails(getDoc(doc(db2, "academyConfig", ADMIN_UID)));
    await assertFails(
      setDoc(doc(db2, "academyConfig", ADMIN_UID), { grupos: { hacked: ["x"] } })
    );
  });
});

describe("groupAssignments (mapa de asignación por grupo)", () => {
  it("solo el admin puede leer y escribir el documento de asignaciones", async () => {
    const dbAdmin = dbAs(ADMIN_UID);
    await assertSucceeds(
      setDoc(doc(dbAdmin, "groupAssignments", ADMIN_UID), { asignaciones: { "Padel · Avanzado": [COACH1_UID] } })
    );
    await assertSucceeds(getDoc(doc(dbAdmin, "groupAssignments", ADMIN_UID)));

    const db2 = dbAs(COACH2_UID);
    await assertFails(getDoc(doc(db2, "groupAssignments", ADMIN_UID)));
    await assertFails(
      setDoc(doc(db2, "groupAssignments", ADMIN_UID), { asignaciones: { hacked: [COACH2_UID] } })
    );
  });
});
