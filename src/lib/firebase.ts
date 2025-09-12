// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvLZFnsqNXABKvRAT7U-rjxsy8zOFWmwA",
  authDomain: "gtc-com.firebaseapp.com",
  projectId: "gtc-com",
  storageBucket: "gtc-com.firebasestorage.app",
  messagingSenderId: "271987201667",
  appId: "1:271987201667:web:d9c12109c573fd8990edb6"
};


// Initialiser Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
