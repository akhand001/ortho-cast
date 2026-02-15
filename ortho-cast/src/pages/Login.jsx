import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase"; // We don't need 'db' here anymore
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setIsLoading(true);
    try {
      // Step 1: Just sign the user in.
      await signInWithEmailAndPassword(auth, email, password);
      
      // Step 2: Navigate to the homepage. App.jsx will handle the rest.
      navigate("/");

    } catch (e) {
      setError("Invalid credentials. Please check your email and password.");
      console.error("Login error:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => { /* ... (no changes) ... */ };

  return (
    // ... (Your JSX for the login form remains the same)
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-500">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white text-center">
            Cast<span className="font-script text-5xl text-indigo-600 mx-[-2px]">i</span>Care
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-300 mt-2 mb-8">Welcome back! Please login to your account.</p>

        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="relative mb-4">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-4">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-4">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Forgot Password?
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="flex items-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg mb-4">
              <AlertCircle size={20} className="mr-2"/>
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm p-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 ${
              isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          New user?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline dark:text-indigo-400 font-semibold">
            Sign up here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
