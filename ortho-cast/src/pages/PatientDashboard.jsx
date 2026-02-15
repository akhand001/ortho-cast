import React, { useState, useEffect } from "react";
// We are keeping the Firebase imports for when you want to switch back
import { ref, onValue } from "firebase/database";
import { rdb, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Thermometer, Droplets, HeartPulse, List, Battery, AlertTriangle, CheckCircle, ShieldQuestion, MessageSquare, Waves } from 'lucide-react';
import SidebarNav from "../components/SidebarNav";
// --- DUMMY DATA WITH ALL SENSOR READINGS ---
const dummyData = {
  latest: {
    sensors: {
      pressure: { front: 550, back: 560, left: 545, right: 555 },
      strain: { gauge1: 0.021, gauge2: 0.023 },
      environment: { temperature: 37.8, humidity: 75 },
      movement: { activity: "Moderate" },
    },
    deviceStatus: { battery: 85 },
  },
  ai_insight: {
    alertLevel: "warning",
    message: "⚠️ WARNING: Temperature is rising steadily. Monitor closely.",
    analyzedAt: new Date().toISOString(),
  },
  doctor_note: {
      message: "Akhand, please remember to elevate your leg for at least 15 minutes every 2 hours. Your progress looks good otherwise!",
      updatedAt: new Date().toISOString(),
  },
  history: {
    [Date.now() - 3600000 * 4]: { sensors: { pressure: { front: 700 }, strain: { gauge1: 0.020, gauge2: 0.022 }, environment: { temperature: 37.2 }, movement: { activity: "Low" } } },
    [Date.now() - 3600000 * 3]: { sensors: { pressure: { front: 520 }, strain: { gauge1: 0.020, gauge2: 0.022 }, environment: { temperature: 37.2 }, movement: { activity: "Low" } } },
    [Date.now() - 3600000 * 2]: { sensors: { pressure: { front: 535 }, strain: { gauge1: 0.021, gauge2: 0.021 }, environment: { temperature: 37.4 }, movement: { activity: "Moderate" } } },
    [Date.now() - 3600000 * 1]: { sensors: { pressure: { front: 550 }, strain: { gauge1: 0.021, gauge2: 0.023 }, environment: { temperature: 37.8 }, movement: { activity: "High - Please Rest" } } },
  },
};

// (Helper function remains the same)
const get = (obj, path, defaultValue = "-") => {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;
  for (const key of keys) { if (result === null || result === undefined) return defaultValue; result = result[key]; }
  return result ?? defaultValue;
};

// --- Reusable Components ---

const StatCard = ({ title, value, unit, icon: Icon, color }) => (
  <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-4 bg-white rounded-2xl shadow-lg flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color.bg}`}><Icon className={`w-6 h-6 ${color.text}`} /></div>
    <div>
      <h3 className="font-semibold text-gray-500">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">
        <CountUp end={value} duration={1} separator="," decimals={title.includes('Temp') ? 1 : 0} />
        <span className="text-lg ml-1">{unit}</span>
      </p>
    </div>
  </motion.div>
);

const PressureCard = ({ pressureData }) => (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-gray-600">4-Point Pressure Reading</h3><HeartPulse className="w-6 h-6 text-indigo-500" /></div>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-sm text-gray-400">Front</p><p className="text-2xl font-bold">{get(pressureData, 'front')} psi</p></div>
            <div><p className="text-sm text-gray-400">Back</p><p className="text-2xl font-bold">{get(pressureData, 'back')} psi</p></div>
            <div><p className="text-sm text-gray-400">Left</p><p className="text-2xl font-bold">{get(pressureData, 'left')} psi</p></div>
            <div><p className="text-sm text-gray-400">Right</p><p className="text-2xl font-bold">{get(pressureData, 'right')} psi</p></div>
        </div>
    </motion.div>
);

// RESTORED: Strain Gauge Card Component
const StrainCard = ({ strainData }) => (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-gray-600">Strain (Micro-Movement)</h3><Waves className="w-6 h-6 text-teal-500" /></div>
        <div className="grid grid-cols-2 gap-4 text-center">
            <div><p className="text-sm text-gray-400">Gauge 1</p><p className="text-2xl font-bold"><CountUp end={get(strainData, 'gauge1')} duration={1.5} decimals={3} /></p></div>
            <div><p className="text-sm text-gray-400">Gauge 2</p><p className="text-2xl font-bold"><CountUp end={get(strainData, 'gauge2')} duration={1.5} decimals={3} /></p></div>
        </div>
    </motion.div>
);

const AiAlertBanner = ({ insight }) => {
    if (!insight) return null;
    const alertConfig = {
        critical: { icon: AlertTriangle, color: "bg-red-100 text-red-700" },
        warning: { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700" },
        normal: { icon: CheckCircle, color: "bg-green-100 text-green-700" },
    };
    const config = alertConfig[insight.alertLevel] || { icon: ShieldQuestion, color: "bg-gray-100" };
    const Icon = config.icon;
    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`p-5 rounded-2xl shadow-md flex items-center space-x-4 ${config.color}`}>
            <Icon className="w-8 h-8 flex-shrink-0"/>
            <div>
                <h3 className="font-bold">AI Health Insight</h3>
                <p>{insight.message}</p>
            </div>
        </motion.div>
    );
};

const ActivityTimeline = ({ history }) => {
    const events = history
      .map(h => ({
        time: h.name,
        activity: get(h, 'sensors.movement.activity', 'Unknown')
      }))
      .filter(e => e.activity && e.activity.toLowerCase() !== 'low' && e.activity.toLowerCase() !== 'moderate');

    return (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-6 bg-white rounded-2xl shadow-lg">
             <h3 className="font-semibold text-gray-600 mb-4 flex items-center"><List className="w-5 h-5 mr-2 text-gray-400"/>Recent High-Activity Events</h3>
             {events.length > 0 ? (
                <ul className="space-y-2">
                    {events.map((event, index) => (
                        <li key={index} className="flex items-center text-sm">
                            <span className="font-bold text-gray-700 mr-2">{event.time}:</span>
                            <span className="text-red-500">{event.activity}</span>
                        </li>
                    ))}
                </ul>
             ) : <p className="text-sm text-gray-500">No significant events detected recently.</p>}
        </motion.div>
    );
};


// --- Main Dashboard Component ---

export default function PatientDashboard() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [doctorNote, setDoctorNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

   // --- NEW: Notification ke liye state variables ---
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setLatest(dummyData.latest);
    setAiInsight(dummyData.ai_insight);
    setDoctorNote(dummyData.doctor_note);
    
    const historyArray = Object.entries(dummyData.history).map(([ts, d]) => ({
      ts,
      name: new Date(parseInt(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pressure: get(d, 'sensors.pressure.front', 0),
      strain1: get(d, 'sensors.strain.gauge1', 0),
      strain2: get(d, 'sensors.strain.gauge2', 0),
      ...d
    }));
    setHistory(historyArray);
    
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (isLoading) { return <div className="min-h-screen bg-gray-100 p-6 animate-pulse"><div className="h-8 bg-gray-300 rounded w-1-3 mb-6"></div><div className="h-20 bg-gray-200 rounded-2xl"></div></div> }

  const lastUpdated = new Date().toLocaleString();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-gray-800">
            Cast<span className="font-script text-5xl text-indigo-600 mx-[-2px]">i</span>Care
          </h1>
          <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-md">Logout</button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Last updated: {lastUpdated}</p>
        <AiAlertBanner insight={aiInsight} />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="lg:col-span-1 space-y-6">
            <StatCard title="Temperature" value={get(latest, 'sensors.environment.temperature')} unit="°C" icon={Thermometer} color={{bg:'bg-red-100', text:'text-red-600'}}/>
            <StatCard title="Humidity" value={get(latest, 'sensors.environment.humidity')} unit="%" icon={Droplets} color={{bg:'bg-blue-100', text:'text-blue-600'}}/>
            <StatCard title="Battery" value={get(latest, 'deviceStatus.battery')} unit="%" icon={Battery} color={{bg:'bg-green-100', text:'text-green-600'}}/>
            {doctorNote && (
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="font-semibold text-gray-600 mb-2 flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-purple-500"/>Doctor's Note</h3>
                    <p className="text-gray-700">{doctorNote.message}</p>
                </motion.div>
            )}
          </motion.div>

          <div className="lg:col-span-2 space-y-6">
            <PressureCard pressureData={get(latest, 'sensors.pressure')} />
            {/* RESTORED: Strain Card is now displayed */}
            <StrainCard strainData={get(latest, 'sensors.strain')} />
            <ActivityTimeline history={history} />
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="p-5 bg-white rounded-2xl shadow-lg">
                <h3 className="font-semibold text-gray-700 mb-4">Pressure History (Front Sensor)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={history}>
                        <defs><linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/><stop offset="95%" stopColor="#818cf8" stopOpacity={0}/></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis domain={['dataMin - 50', 'dataMax + 50']} /><Tooltip />
                        <Area type="monotone" dataKey="pressure" stroke="#4f46e5" fill="url(#colorPressure)" />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>
            
            
            {/* RESTORED: Strain History Chart is now displayed */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="p-5 bg-white rounded-2xl shadow-lg">
                <h3 className="font-semibold text-gray-700 mb-4">Strain Gauge History</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 'dataMax + 0.01']} tickFormatter={(tick) => tick.toFixed(3)} />
                        <Tooltip formatter={(value) => value.toFixed(3)} />
                        <Legend />
                        <Line type="monotone" dataKey="strain1" name="Gauge 1" stroke="#2dd4bf" strokeWidth={2} />
                        <Line type="monotone" dataKey="strain2" name="Gauge 2" stroke="#a78bfa" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}