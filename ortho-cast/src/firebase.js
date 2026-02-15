import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCcT1BBxN09G43NoP6TfQ_osaX0rdDmiUw",
  authDomain: "ortho-cast.firebaseapp.com",
  projectId: "ortho-cast",
  storageBucket: "ortho-cast.firebasestorage.app",
  messagingSenderId: "219631723661",
  appId: "1:219631723661:web:36eb3299c9f5669c112ec4",
  measurementId: "G-9NLWWXPS37"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
const db = getFirestore(app);
const rdb = getDatabase(app); // 👈 this is the realtime DB

// Exports
export { auth, db, rdb };