import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import { ThemeProvider } from "./context/ThemeContext";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function ProtectedRoute({ user, requiredRole, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== requiredRole) {
    const homePath = user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';
    return <Navigate to={homePath} replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userDocRef = doc(db, "users", authUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ uid: authUser.uid, email: authUser.email, ...userDoc.data() });
        } else {
          console.error("User document not found in Firestore. Logging out.");
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-500">Loading CastiCare...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute user={user} requiredRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute user={user} requiredRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            !user
              ? <Navigate to="/login" />
              : user.role === 'doctor'
                ? <Navigate to="/doctor-dashboard" />
                : <Navigate to="/patient-dashboard" />
          }
        />
        <Route path="*" element={<div className="p-8 text-center"><h1>404</h1><p>Page Not Found</p></div>} />
      </Routes>
    </ThemeProvider>
  );
}

