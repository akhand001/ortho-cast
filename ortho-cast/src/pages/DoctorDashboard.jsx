import React, { useEffect, useState, useMemo } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, onValue, set } from "firebase/database";
import { db, rdb, auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'; // NEW: For Gauge
import { Send, Download, AlertTriangle, CheckCircle, ShieldQuestion, MessageSquare, HeartPulse, Thermometer, Battery, Waves, ChevronDown, Search, LogOut, Clock } from 'lucide-react';

// (Helper function remains the same)
const get = (obj, path, defaultValue = "-") => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  for (const key of keys) { if (result === null || result === undefined) return defaultValue; result = result[key]; }
  return result ?? defaultValue;
};

// --- Reusable Components ---

// Confirmation Modal for Logout
const ConfirmationModal = ({ onConfirm, onCancel }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Confirm Logout</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Are you sure you want to log out?</p>
      <div className="flex justify-end gap-4 mt-6">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition">Logout</button>
      </div>
    </motion.div>
  </motion.div>
);

// --- Main Doctor Dashboard Component ---
export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("All");
  const [greeting, setGreeting] = useState("Welcome");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "patient"));
    let rtdbListeners = [];
    const unsubFirestore = onSnapshot(q, (snap) => {
      rtdbListeners.forEach(unsubscribe => unsubscribe());
      rtdbListeners = [];

      const patientData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data(), latest: null, ai_insight: null }));
      setPatients(patientData);
      setIsLoading(false);

      patientData.forEach(patient => {
        const insightRef = ref(rdb, `sensorData/${patient.id}/ai_insight`);
        const latestRef = ref(rdb, `sensorData/${patient.id}/latest`);
        const unsubInsight = onValue(insightRef, (snapshot) => {
          setPatients(current => current.map(p => p.id === patient.id ? { ...p, ai_insight: snapshot.val() } : p));
        });
        const unsubLatest = onValue(latestRef, (snapshot) => {
          setPatients(current => current.map(p => p.id === patient.id ? { ...p, latest: snapshot.val() } : p));
        });
        rtdbListeners.push(unsubInsight, unsubLatest);
      });
    });

    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    return () => { unsubFirestore(); rtdbListeners.forEach(unsubscribe => unsubscribe()); };
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'All' || (p.ai_insight && p.ai_insight.alertLevel === filter.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filter]);

  const handleLogout = async () => { await signOut(auth); navigate("/login"); };

  const summaryStats = useMemo(() => ({
    total: patients.length,
    critical: patients.filter(p => p.ai_insight?.alertLevel === 'critical').length,
    warning: patients.filter(p => p.ai_insight?.alertLevel === 'warning').length,
  }), [patients]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 transition-colors duration-300">
      <AnimatePresence>
        {showLogoutModal && <ConfirmationModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white text-center">
              Cast<span className="font-script text-5xl text-indigo-600 mx-[-2px]">i</span>Care
            </h1>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-1">{greeting}, Doctor!</p>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center transition shadow-sm hover:shadow-lg hover:bg-red-500 hover:text-white dark:hover:bg-red-500">
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        </div>

        {/* --- NEW: GLASSMORPHISM SUMMARY & FILTERS CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl shadow-lg mb-6 bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-70 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Patients</p><p className="text-2xl font-bold text-gray-800 dark:text-white">{summaryStats.total}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Critical Alerts</p><p className="text-2xl font-bold text-red-500">{summaryStats.critical}</p></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Warnings</p><p className="text-2xl font-bold text-yellow-500">{summaryStats.warning}</p></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search for a patient..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 transition" />
            </div>
            <div className="flex-shrink-0 grid grid-cols-3 gap-2 w-full sm:w-auto">
              {["All", "Critical", "Warning"].map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{f}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Patients list */}
        {isLoading ? <p>Loading...</p> : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {filteredPatients.length ? (
                filteredPatients.map((p) => <PatientCard key={p.id} patient={p} />)
              ) : (
                <p className="text-center text-gray-600 mt-8">No patients found for the selected criteria.</p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Enhanced Patient Card Component ---
function PatientCard({ patient }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [noteSent, setNoteSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isExpanded) return;
    const historyRef = ref(rdb, `sensorData/${patient.id}/history`);
    const unsubHistory = onValue(historyRef, (snap) => {
      if (snap.exists()) {
        setHistory(Object.values(snap.val()).map(d => ({ pressure: get(d, 'sensors.pressure.front', 0) })).slice(-24));
      }
    });
    return () => unsubHistory();
  }, [isExpanded, patient.id]);

 const handleSendNote = async () => {
    // 1. Validate: Don't send an empty note.
    if (!noteInput.trim()) return;
    
    setIsSending(true);
    const noteRef = ref(rdb, `sensorData/${patient.id}/doctor_note`);

    try {
      // 2. Write data to Firebase: Save the message and a timestamp.
      await set(noteRef, {
        message: noteInput,
        updatedAt: new Date().toISOString(),
      });
      
      // 3. Provide User Feedback: Clear the input and show a temporary success message.
      setNoteInput(""); 
      setNoteSent(true); 
      setTimeout(() => setNoteSent(false), 2000); // Hide the "Sent!" message after 2 seconds

    } catch (error) {
      console.error("Failed to send note:", error);
      alert("Error sending note. Please check your connection and try again.");
    } finally {
      setIsSending(false);
    }
  };
 const exportEnhancedReport = () => {
    const doc = new jsPDF();
    
    // --- Document Header ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("CastiCare - Patient Health Report", 105, 22, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });

    // --- Patient Information ---
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Patient Name:`, 14, 45);
    doc.setFont("helvetica", "normal");
    doc.text(patient.name || "N/A", 50, 45);

    doc.setFont("helvetica", "bold");
    doc.text(`Patient ID:`, 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(patient.id, 50, 52);

    // --- AI Health Insight Section ---
    doc.setLineWidth(0.5);
    doc.line(14, 62, 196, 62); // Separator line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Latest AI Insight", 14, 70);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    if (aiInsight) {
      // Set color based on alert level
      if (aiInsight.alertLevel === 'critical') doc.setTextColor(200, 0, 0); // Red
      else if (aiInsight.alertLevel === 'warning') doc.setTextColor(255, 165, 0); // Orange
      else doc.setTextColor(0, 128, 0); // Green

      doc.text(`Status: ${aiInsight.alertLevel.toUpperCase()}`, 14, 78);
      doc.setTextColor(0); // Reset color
      doc.text(`Details: ${aiInsight.message}`, 14, 85, { maxWidth: 180 });
    } else {
      doc.text("No AI insight is currently available.", 14, 78);
    }

    // --- Detailed Sensor Readings Section ---
    doc.line(14, 95, 196, 95);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Latest Sensor Readings", 14, 103);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    if (latest) {
      const pressure = get(latest, 'sensors.pressure', {});
      const strain = get(latest, 'sensors.strain', {});
      const env = get(latest, 'sensors.environment', {});
      const battery = get(latest, 'deviceStatus.battery');

      let yPos = 112; // Initial Y position for text
      const writeLine = (label, value) => {
          doc.setFont("helvetica", "bold");
          doc.text(label, 20, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(String(value), 70, yPos);
          yPos += 8; // Move to the next line
      };
      
      writeLine("Temperature:", `${get(env, 'temperature')} °C`);
      writeLine("Humidity:", `${get(env, 'humidity')} %`);
      writeLine("Device Battery:", `${battery} %`);
      writeLine("Pressure (Front):", `${get(pressure, 'front')} psi`);
      writeLine("Pressure (Back):", `${get(pressure, 'back')} psi`);
      writeLine("Pressure (Left):", `${get(pressure, 'left')} psi`);
      writeLine("Pressure (Right):", `${get(pressure, 'right')} psi`);
      writeLine("Strain (Gauge 1):", String(get(strain, 'gauge1')));
      writeLine("Strain (Gauge 2):", String(get(strain, 'gauge2')));
    } else {
      doc.text("No live sensor data is available.", 20, 112);
    }

    // --- Footer ---
    doc.line(14, 280, 196, 280);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("This is an auto-generated report from the CastiCare platform.", 105, 285, { align: "center" });

    // --- Save the PDF ---
    doc.save(`CastiCare_Report_${patient.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };
  const { latest, ai_insight } = patient;
  const alertConfig = ai_insight ? {
    critical: { icon: AlertTriangle, color: "border-red-500 bg-red-50 dark:bg-red-900/10", glow: "shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse" },
    warning: { icon: AlertTriangle, color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10", glow: "" },
    normal: { icon: CheckCircle, color: "border-green-500 bg-green-50 dark:bg-green-900/10", glow: "" },
  }[ai_insight.alertLevel] : { icon: ShieldQuestion, color: "border-gray-300 dark:border-gray-600", glow: "" };
  const AlertIcon = alertConfig.icon;

  const lastUpdated = useMemo(() => {
    if (!latest) return "No data yet";
    const lastTs = get(latest, 'timestamp', 0);
    const diffMinutes = Math.round((Date.now() - lastTs) / 60000);
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    return `${Math.floor(diffMinutes / 60)}h ago`;
  }, [latest]);

  const battery = get(latest, 'deviceStatus.battery', 0);
  const batteryColor = battery > 70 ? '#22c55e' : battery > 30 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div layout variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} exit={{ opacity: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md border-l-4 transition-shadow duration-300 hover:shadow-xl ${alertConfig.color} ${alertConfig.glow}`}>
      <div className="p-5 flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{patient.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{patient.email}</p>
          <div className="mt-2 flex items-start space-x-2">
            <AlertIcon className={`w-5 h-5 ${alertConfig.color.replace('bg-', 'text-').replace('-50', '-500')} flex-shrink-0`} />
            <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{ai_insight ? ai_insight.message : "Awaiting AI insight..."}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}><ChevronDown className="w-6 h-6 text-gray-500" /></motion.div>
          <div className="flex items-center text-xs text-gray-400 mt-2"><Clock size={12} className="mr-1" /> {lastUpdated}</div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <span className="flex items-center dark:text-gray-300"><HeartPulse className="w-4 h-4 mr-1 text-indigo-500" />{get(latest, 'sensors.pressure.front')} psi</span>
                  <span className="flex items-center dark:text-gray-300"><Thermometer className="w-4 h-4 mr-1 text-red-500" />{get(latest, 'sensors.environment.temperature')}°C</span>
                  <span className="flex items-center dark:text-gray-300"><Waves className="w-4 h-4 mr-1 text-teal-500" />{get(latest, 'sensors.strain.gauge1')}</span>
                </div>
                <div className="h-20 sm:col-span-1">
                  <ResponsiveContainer><LineChart data={history}><YAxis domain={['dataMin - 20', 'dataMax + 20']} hide /><Line type="monotone" dataKey="pressure" stroke="#4f46e5" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer>
                  <p className="text-xs text-center text-gray-400 -mt-2">Pressure Trend</p>
                </div>
                <div className="h-24 sm:col-span-1 flex flex-col items-center justify-center">
                  <div className="w-20 h-20"><CircularProgressbar value={battery} text={`${battery}%`} styles={buildStyles({ pathColor: batteryColor, textColor: batteryColor, trailColor: '#d6d6d6', })} /></div>
                  <p className="text-xs text-center text-gray-400 mt-1">Device Battery</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex-1 w-full flex items-center relative">
                  <MessageSquare className="w-5 h-5 mr-2 text-gray-400" /><input type="text" value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Send a note to the patient..." className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-700 transition" />
                  <button onClick={handleSendNote} disabled={isSending} className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg disabled:bg-indigo-300 transition"><Send className="w-5 h-5" /></button>
                  <AnimatePresence>{noteSent && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -top-6 right-0 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Sent!</motion.span>}</AnimatePresence>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/doctor/patient/${patient.id}`)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition shadow-md">View Full Dashboard</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={exportEnhancedReport} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition shadow-md"><Download className="w-5 h-5 mr-2" />PDF</motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}