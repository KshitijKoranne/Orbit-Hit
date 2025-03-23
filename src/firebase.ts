import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvWlP6Az653pB0rWkhIPEuvdgWOVBGnL4",
  authDomain: "orbit-hit-e5a20.firebaseapp.com",
  databaseURL: "https://orbit-hit-e5a20-default-rtdb.firebaseio.com",
  projectId: "orbit-hit-e5a20",
  storageBucket: "orbit-hit-e5a20.firebasestorage.app",
  messagingSenderId: "962280791684",
  appId: "1:962280791684:web:f99875b9e6d4a1ea692cd1",
  measurementId: "G-CN9ZPC53SJ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, ref, set, onValue, auth, signInAnonymously, onAuthStateChanged };