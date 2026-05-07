import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  ActivitySquare
} from "lucide-react";
import { get } from "../data/helpers";

/**
 * Hx711Card: Skin-to-Cast Interface & Swelling Monitor
 * Evaluates cast tightness based on physical load applied by tissue swelling.
 */
export default function Hx711Card({ hx711Data, safeForceLimit = 40 }) {
  // --- STABLE HARDWARE SIMULATION ---
  // Baseline comfortable force inside a cast is around 10-15 Newtons (N).
  // Swelling changes happen slowly, so we keep fluctuations extremely low.
  const [simulatedForce, setSimulatedForce] = useState(14.2);
  const [isSwellingSimulation, setIsSwellingSimulation] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedForce(prev => {
        // Micro-fluctuation (only +/- 0.02) to show the sensor is "Alive" but stable
        const microNoise = (Math.random() * 0.04) - 0.02; 
        
        // Target: Normal fit (14.2) OR Swollen tight cast (45.5)
        const target = isSwellingSimulation ? safeForceLimit + 5.5 : 14.2; 
        
        // Very slow, smooth transition (looks like gradual tissue swelling)
        const smoothed = prev + (target - prev) * 0.05; 
        return smoothed + microNoise;
      });
    }, 1000); // 1 second refresh rate for stable, medical-grade feel

    return () => clearInterval(interval);
  }, [isSwellingSimulation, safeForceLimit]);

  // 1. Fetch Real Sensor Data (Fallback to simulation if ESP32 is off)
  const rawSensorForce = parseFloat(get(hx711Data, "force", 0));
  const isHardwareLive = rawSensorForce > 0;
  const contactForce = isHardwareLive ? rawSensorForce : simulatedForce;
  
  // 2. Calculate Swelling / Tightness Index (0% to 100%+)
  const tightnessIndex = Math.min((contactForce / safeForceLimit) * 100, 100);

  // 3. Clinical Fit & Comfort Logic
  const theme = useMemo(() => {
    if (contactForce > safeForceLimit) {
      return {
        state: "Critical Swelling",
        diagnosis: "Cast is excessively tight. Risk of skin necrosis.",
        icon: AlertOctagon,
        text: "text-red-600",
        bg: "bg-red-50",
        bar: "bg-red-500",
        border: "border-red-200",
        glow: "shadow-red-500/20",
        pulse: "animate-pulse"
      };
    }
    if (contactForce > safeForceLimit * 0.7) {
      return {
        state: "Swelling Detected",
        diagnosis: "Tightness increasing. Monitor patient comfort.",
        icon: AlertTriangle,
        text: "text-amber-600",
        bg: "bg-amber-50",
        bar: "bg-amber-500",
        border: "border-amber-200",
        glow: "shadow-amber-500/10",
        pulse: ""
      };
    }
    return {
      state: "Optimal Fit",
      diagnosis: "Patient is comfortable. No abnormal swelling.",
      icon: ShieldCheck,
      text: "text-emerald-600",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
      border: "border-emerald-100",
      glow: "shadow-emerald-500/5",
      pulse: ""
    };
  }, [contactForce, safeForceLimit]);

  const StatusIcon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 bg-white rounded-[2rem] shadow-lg border ${theme.border} overflow-hidden flex flex-col justify-between h-full transition-all duration-1000 ${theme.glow}`}
    >
      {/* Background Decorative Element */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.04] pointer-events-none ${theme.bar}`} />

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Cast Fit Interface</h3>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest text-white uppercase ${isHardwareLive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              {isHardwareLive ? 'Live Sensor' : 'Standby'}
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <ActivitySquare className="w-3 h-3" /> HX711 Micro-Load Cell
          </p>
        </div>
        
        {/* HIDDEN TEACHER DEMO TRIGGER: Double click to slowly simulate swelling */}
        <div 
          onDoubleClick={() => setIsSwellingSimulation(!isSwellingSimulation)}
          className={`p-3 rounded-2xl ${theme.bg} ${theme.text} cursor-pointer active:scale-95 transition-transform z-20`}
          title="Double-click to simulate tissue swelling"
        >
          <Maximize className={`w-6 h-6 ${theme.pulse}`} />
        </div>
      </div>

      {/* Main Display: Contact Force */}
      <div className="flex flex-col items-center justify-center my-6 relative">
        <div className="flex items-baseline justify-center gap-1.5 z-10">
          <motion.p 
            key={contactForce.toFixed(2)}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            className={`text-7xl font-black tracking-tighter font-mono italic ${theme.text}`}
          >
            {contactForce.toFixed(2)}
          </motion.p>
          <span className="text-xl font-bold text-slate-400 italic">N</span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">
          Skin-to-Cast Contact Force
        </p>
      </div>

      {/* Danger Alert Banner */}
      <AnimatePresence>
        {contactForce > safeForceLimit && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: 10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 10 }}
            className="mb-6 p-4 bg-red-600 rounded-[1.5rem] flex items-center gap-4 text-white shadow-lg shadow-red-200/50"
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <AlertOctagon className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Constriction Alert</span>
              <span className="block text-xs font-medium leading-tight text-red-50">High pressure detected. Patient comfort compromised.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: Tightness Index & Diagnosis */}
      <div className={`mt-auto p-5 rounded-[1.5rem] bg-slate-50 border ${theme.border} transition-colors duration-700`}>
        <div className="flex justify-between items-end mb-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tightness Index</span>
          <span className={`text-[10px] font-bold ${theme.text}`}>{tightnessIndex.toFixed(1)}%</span>
        </div>
        
        {/* Progress Bar showing how tight the cast is */}
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-4 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${tightnessIndex}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${theme.bar}`}
          />
        </div>
        
        {/* Doctor's Assessment */}
        <div className="flex items-start gap-3 pt-3 border-t border-slate-200/60">
          <div className={`p-1.5 rounded-lg bg-white shadow-sm mt-0.5 ${theme.text}`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className={`text-xs font-black uppercase tracking-wider mb-0.5 ${theme.text}`}>
              {theme.state}
            </span>
            <span className="text-[10px] font-medium text-slate-500 leading-tight">
              {theme.diagnosis}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}