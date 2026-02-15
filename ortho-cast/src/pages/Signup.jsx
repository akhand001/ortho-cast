import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // To save user role
import { auth, db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ThemeToggle from "../components/ThemeToggle";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient"); // Default role
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const navigate = useNavigate();

  // Password strength checker provides real-time feedback to the user.
  useEffect(() => {
    let score = 0;
    let label = 'Weak';
    let color = 'bg-red-500';

    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[@$!%*?&])/.test(password)) score++;

    if (score >= 4) {
      label = 'Strong';
      color = 'bg-green-500';
    } else if (score >= 2) {
      label = 'Medium';
      color = 'bg-yellow-500';
    }
    setPasswordStrength({ score, label, color });
  }, [password]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    // --- Pro-level Validation ---
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (passwordStrength.score < 3) {
      setError("Password is too weak. Please include uppercase, lowercase, numbers, and symbols.");
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create the user in Firebase Authentication.
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 2: Save the user's details (including their role) in a separate Firestore document.
      // This is the most critical step for enabling role-based security in your app.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: role, // Save the selected role ("patient" or "doctor")
      });

      // Step 3: Redirect to the homepage. App.jsx will now read the role and send them to the correct dashboard.
      navigate("/");

    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setError("This email address is already registered.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
      console.error("Signup error:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-500">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white text-center">
          Anshul <span className="font-script text-5xl text-indigo-600 mx-[-2px]">i</span>Care
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-300 mt-2 mb-8">Create Your Account</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Role Selection */}
          <div className="flex justify-center gap-4 mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="role" value="patient" checked={role === 'patient'} onChange={() => setRole('patient')} className="form-radio text-indigo-600 focus:ring-indigo-500"/>
              <span className="text-gray-700 dark:text-gray-200">I am a Patient</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="role" value="doctor" checked={role === 'doctor'} onChange={() => setRole('doctor')} className="form-radio text-indigo-600 focus:ring-indigo-500"/>
              <span className="text-gray-700 dark:text-gray-200">I am a Doctor</span>
            </label>
          </div>

          {/* Full Name Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>
          
          {/* Password Strength Meter */}
          {password && (
              <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div 
                          className={`h-2 rounded-full ${passwordStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength.score * 20}%` }}
                      ></motion.div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-300 w-16 text-right">{passwordStrength.label}</span>
              </div>
          )}

          {/* Confirm Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm p-3 rounded-lg">
              <AlertCircle size={20} className="mr-2"/>{error}
            </div>
          )}

          {/* Signup Button */}
          <button type="submit" disabled={isLoading} className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 ${isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline dark:text-indigo-400 font-semibold">
            Login here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

