import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDZV-e9ueBtb6Zzb1PAbwxEZJ1ffivX2d4",
  authDomain: "one1-2fc8c.firebaseapp.com",
  projectId: "one1-2fc8c",
  storageBucket: "one1-2fc8c.firebasestorage.app",
  messagingSenderId: "32762796394",
  appId: "1:32762796394:web:52639b4c9c5cbd794fad13",
  measurementId: "G-ZM07YYVC8W"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;
