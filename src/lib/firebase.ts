// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "concours-facile",
  "appId": "1:95785864672:web:15beea9f0ba5accd90af85",
  "storageBucket": "concours-facile.firebasestorage.app",
  "apiKey": "AIzaSyCByDfHvT4IgtMd5ACXIOZVZw0lt2wCdmg",
  "authDomain": "concours-facile.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "95785864672"
};

// Initialiser Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
