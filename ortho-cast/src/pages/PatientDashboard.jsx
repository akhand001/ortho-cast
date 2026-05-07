import React, { useState, useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { rdb, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import { Thermometer, Droplets, Battery, LogOut, Bell, Wifi, WifiOff, CheckCircle } from 'lucide-react';

// --- CUSTOM UTILS & HELPERS ---
import { generateAiInsights } from "../utils/aiEngine";
import { get } from "../data/helpers";
import dummyData from "../data/dummyData";

// --- EXTERNAL COMPONENTS ---
import Hx711Card from "../components/Hx711Card";
import MpuCard from "../components/MpuCard";
import AiAnalysisPanel from "../components/AiAlertBanner"; 
import ActivityTimeline from "../components/ActivityTimeline";
import DoctorNoteCard from "../components/DoctorNoteCard";

// --- STAT CARD COMPONENT ---
const StatCard = ({ title, value, unit, icon: Icon, color }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-5 bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100 flex items-center space-x-4 hover:-translate-y-1 transition-transform duration-300">
    <div className={`p-3.5 rounded-xl ${color.bg}`}><Icon className={`w-6 h-6 ${color.text}`} /></div>
    <div>
      <h3 className="font-semibold text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-black text-gray-800 tracking-tight">
        <CountUp end={parseFloat(value) || 0} duration={1} separator="," decimals={title.includes('Temp') ? 1 : 0} />
        <span className="text-lg font-bold text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  </motion.div>
);

export default function PatientDashboard() {
  const [latest, setLatest] = useState(dummyData.latest); 
  const [history, setHistory] = useState([]);
  const [aiInsight, setAiInsight] = useState([]);
  const [doctorNote, setDoctorNote] = useState(dummyData.doctor_note);
  const [isLoading, setIsLoading] = useState(true);
  
  // Notification & Status States
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false); // Default to false initially
  
  const notificationRef = useRef(null); 
  const navigate = useNavigate();

  // --- Click Outside to Close Notification Logic ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Firebase Real-time Connection & Heartbeat Logic ---
  useEffect(() => {
    const patientDataRef = ref(rdb, 'patients/patient_001/latest');
    let timeoutId; // Timer to check if ESP32 goes offline

    const unsubscribe = onValue(patientDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const fireData = snapshot.val();
        
        setLatest(prev => ({
          ...prev,
          ...fireData,
          sensors: { ...prev.sensors, ...(fireData.sensors || {}) }
        }));
        
        setIsDeviceConnected(true);
        setAiInsight(generateAiInsights(fireData.sensors));

        // HEARTBEAT LOGIC: Reset the 10-second timer every time new data arrives.
        // If 10 seconds pass without new data, the ESP32 is considered disconnected.
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsDeviceConnected(false);
        }, 10000); 

      } else {
        setIsDeviceConnected(false);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase error:", error);
      setIsDeviceConnected(false);
      setIsLoading(false);
    });

    const historyArray = Object.entries(dummyData.history).map(([ts, d]) => ({
      ts,
      name: new Date(parseInt(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      weight: get(d, 'sensors.hx711.weight', 0),
      ...d
    }));
    setHistory(historyArray);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId); // Cleanup timer on unmount
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const activeAlerts = aiInsight.filter(insight => insight.level === 'critical' || insight.level === 'warning');
  const hasAlerts = activeAlerts.length > 0;

  if (isLoading) { 
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 font-medium animate-pulse">Establishing secure connection to CastiCare...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-7xl mx-auto space-y-8">
        
        {/* --- APP HEADER --- */}
        <header className="relative z-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              Cast<span className="font-script text-5xl text-indigo-600 mx-[-2px]">i</span>Care
            </h1>

            {/* Live Device Connection Badge */}
            <div className={`flex items-center space-x-2.5 px-4 py-1.5 rounded-full border transition-colors duration-500 ${isDeviceConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <div className="relative flex h-3 w-3">
                {isDeviceConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 transition-colors duration-500 ${isDeviceConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center ${isDeviceConnected ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isDeviceConnected ? <Wifi className="w-3.5 h-3.5 mr-1" /> : <WifiOff className="w-3.5 h-3.5 mr-1" />}
                {isDeviceConnected ? 'ESP32 Live' : 'Device Offline'}
              </span>
            </div>
          </div>

          {/* User Profile & Actions (Unchanged) */}
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="hidden md:block text-right">
              <h2 className="text-lg font-bold text-slate-800">Hi, Akhand 👋</h2>
              <p className="text-xs text-slate-500 font-medium">Recovery Dashboard</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full transition-colors border border-slate-200"
                >
                  <Bell className="w-5 h-5" />
                  {hasAlerts && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                </button>
                {/* Notification Dropdown (Unchanged) */}
              </div>

              <button onClick={handleLogout} className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full transition-colors border border-rose-100">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <AiAnalysisPanel insights={aiInsight} />

        {/* --- MAIN GRID LAYOUT WITH OFFLINE PROTECTION --- */}
        <div className="relative">
          
          {/* OFFLINE OVERLAY: Appears when ESP32 disconnects */}
          <AnimatePresence>
            {!isDeviceConnected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-40 flex items-center justify-center bg-white/40 backdrop-blur-[6px] rounded-[2rem]"
              >
                <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-rose-100 flex flex-col items-center text-center max-w-sm mt-10">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-5">
                    <WifiOff className="w-10 h-10 text-rose-500 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Sensor Offline</h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    Connection to the orthopedic cast has been lost. Live telemetry is paused to prevent reading stale data. Please check the ESP32 power supply.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Dashboard Data - Blurs out when disconnected */}
          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-700 ${!isDeviceConnected ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
            
            <div className="lg:col-span-1 space-y-6">
              <StatCard title="Skin Temp." value={get(latest, 'sensors.dht22.temperature')} unit="°C" icon={Thermometer} color={{bg:'bg-rose-50', text:'text-rose-500'}}/>
              <StatCard title="Humidity" value={get(latest, 'sensors.dht22.humidity')} unit="%" icon={Droplets} color={{bg:'bg-sky-50', text:'text-sky-500'}}/>
              <StatCard title="Device Battery" value={get(latest, 'deviceStatus.battery')} unit="%" icon={Battery} color={{bg:'bg-emerald-50', text:'text-emerald-500'}}/>
              <DoctorNoteCard doctorNote={doctorNote} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Hx711Card hx711Data={get(latest, 'sensors.hx711')} />
                  <MpuCard mpuData={get(latest, 'sensors.mpu6050')} />
              </div>
              
              <ActivityTimeline history={history} />
              
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-6 bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-gray-100">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center text-lg tracking-tight">
                    <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                    Load Bearing Trends (Last 4 Hours)
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs><linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                            <Area type="monotone" dataKey="weight" stroke="#4f46e5" strokeWidth={4} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}