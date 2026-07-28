import { initializeApp, getApps, deleteApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKVrSH-4-oVY-jaEB-CHYiw0t1EgYAOPE",
  authDomain: "country-data-cedb7.firebaseapp.com",
  projectId: "country-data-cedb7",
  storageBucket: "country-data-cedb7.firebasestorage.app",
  messagingSenderId: "428974226532",
  appId: "1:428974226532:web:e12502e583a9b2a897f371",
  measurementId: "G-1C6HYCEJ3D",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
});

// Crea cuentas de otros coaches sin cerrar la sesión actual: Firebase Auth
// autentica automáticamente como el usuario recién creado en la instancia que
// use, así que esa creación se hace en una app "secundaria" desechable.
export async function withSecondaryAuth(fn) {
  const secondary = initializeApp(firebaseConfig, "secondary-" + Date.now());
  try {
    const secondaryAuth = getAuth(secondary);
    return await fn(secondaryAuth);
  } finally {
    await deleteApp(secondary);
  }
}
