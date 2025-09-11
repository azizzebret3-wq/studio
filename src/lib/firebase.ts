// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCByDfHvT4IgtMd5ACXIOZVZw0lt2wCdmg",
  authDomain: "concours-facile.firebaseapp.com",
  projectId: "concours-facile",
  storageBucket: "concours-facile.firebasestorage.app",
  messagingSenderId: "95785864672",
  appId: "1:95785864672:web:15beea9f0ba5accd90af85"
};


// Initialiser Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
