// src/components/SidebarNav.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function SidebarNav() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // fallback agar displayName nahi hai
  const displayName = user?.displayName || user?.email || "User";

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-indigo-600 text-white flex flex-col p-4">
      {/* User Info */}
      <div className="mb-8">
        <h2 className="text-lg font-bold">Welcome 👋</h2>
        <p className="text-sm">{displayName}</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-left py-2 px-3 rounded hover:bg-indigo-500"
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="w-full text-left py-2 px-3 rounded hover:bg-indigo-500"
        >
          Profile
        </button>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-auto bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
