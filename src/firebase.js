import { initializeApp } from "firebase/app";
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
