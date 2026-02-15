import React, { useState, useEffect } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Shield } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function ProfilePage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null); // To store Firestore data
  const user = auth.currentUser;
  const navigate = useNavigate();

  // Fetch user's name and role from Firestore when the page loads
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  const handlePasswordReset = async () => {
    if (!user) {
      setError("You must be logged in to change your password.");
      return;
    }
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, user.email);
      setMessage("Password reset link sent! Please check your email inbox.");
    } catch (err) {
      setError("Failed to send password reset email. Please try again later.");
      console.error(err);
    }
  };

  // Determine the correct dashboard to go back to
  const dashboardPath = userProfile?.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 transition-colors">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md relative"
      >
        <Link to={dashboardPath} className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300"/>
        </Link>
        
        <div className="text-center">
            <User className="w-16 h-16 mx-auto text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full"/>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mt-4">My Profile</h1>
        </div>
        
        <div className="mt-8 space-y-4">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{userProfile?.name || 'Loading...'}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white">{user?.email}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                <p className="text-lg font-semibold text-gray-800 dark:text-white capitalize">{userProfile?.role || '...'}</p>
            </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={handlePasswordReset}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-transform transform hover:scale-105"
          >
            Change Password
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            A password reset link will be sent to your email address.
          </p>
        </div>

        {message && <p className="mt-4 text-sm text-green-600 text-center">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
      </motion.div>
    </div>
  );
}

