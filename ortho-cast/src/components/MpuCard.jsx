import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Footprints, 
  BedDouble, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  ActivitySquare,
  TrendingDown
} from "lucide-react";
import { get } from "../data/helpers";

export default function MpuCard({ mpuData }) {
  // 1. Safe Biometric Extraction
  const ax = parseFloat(get(mpuData, "ax", 0));
  const ay = parseFloat(get(mpuData, "ay", 0));
  const az = parseFloat(get(mpuData, "az", 0));
  
  const rawActivity = get(mpuData, "activity", "sedentary").toLowerCase();

  // 2. Advanced Biomechanical Logic
  // Resultant Vector (Total G-Force)
  const totalG = Math.sqrt(ax**2 + ay**2 + az**2);
  
  // Conditional Alert: Only triggers if mechanical shock exceeds safe threshold
  const isImpactDetected = totalG > 2.5; 

  // Derived Orthopedic Metrics (0 to 100 scale based on G-Force variance from 1G gravity)
  const calculateStress = (g) => Math.min(Math.max(((g - 1) / 1.5) * 100, 0), 100);
  const mechanicalStress = calculateStress(totalG);
  
  // Stability drops when stress is high
  const fractureStability = Math.max(100 - (mechanicalStress * 0.85), 15); 

  // 3. Clinical State Engine (Recovery State)
  const theme = useMemo(() => {
    if (isImpactDetected || rawActivity.includes("high")) {
      return {
        color: "text-red-600",
        bg: "bg-red-50",
        accent: "bg-red-500",
        border: "border-red-200",
        icon: AlertTriangle,
        stateTitle: "Critical Overexertion",
        stateDesc: "Immediate cessation of movement advised.",
        glow: "shadow-red-500/20"
      };
    }
    if (rawActivity.includes("moderate") || rawActivity.includes("walking")) {
      return {
        color: "text-blue-600",
        bg: "bg-blue-50",
        accent: "bg-blue-500",
        border: "border-blue-200",
        icon: Footprints,
        stateTitle: "Controlled Load-Bearing",
        stateDesc: "Ambulatory phase within safe parameters.",
        glow: "shadow-blue-500/10"
      };
    }
    return {
      color: "text-slate-600",
      bg: "bg-slate-50",
      accent: "bg-slate-500",
      border: "border-slate-200",
      icon: BedDouble,
      stateTitle: "Optimal Healing Phase",
      stateDesc: "Basal metabolic state. Maximum stability.",
      glow: "shadow-slate-500/5"
    };
  }, [rawActivity, isImpactDetected]);

  const StatusIcon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-6 bg-white rounded-[2rem] shadow-xl border ${theme.border} overflow-hidden transition-all duration-700 ${theme.glow} flex flex-col h-full`}
    >
      {/* Background Decorative Pulse */}
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.03] ${theme.accent}`} />

      {/* Header: Orthopedic Telemetry */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Kinematics</h3>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-widest text-white uppercase ${theme.accent} animate-pulse`}>
              Live Feed
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <ActivitySquare className="w-3 h-3" /> Orthopedic Telemetry
          </p>
        </div>
        <div className={`p-3 rounded-2xl ${theme.bg} ${theme.color}`}>
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* Tri-Axial Telemetry Display */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Lateral (X)", val: ax },
          { label: "Vertical (Y)", val: ay },
          { label: "Depth (Z)", val: az }
        ].map((item, idx) => (
          <div key={idx} className="bg-slate-50/50 p-3 rounded-[1.25rem] border border-slate-100 flex flex-col items-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">{item.label}</p>
            <p className="text-base font-black text-slate-800 font-mono italic">
              {item.val >= 0 ? `+${item.val.toFixed(2)}` : item.val.toFixed(2)}<span className="text-[10px] text-slate-400 ml-0.5 opacity-50">g</span>
            </p>
          </div>
        ))}
      </div>

      {/* NEW: Recovery Assessment Section */}
      <div className="mb-6 p-4 rounded-[1.5rem] bg-slate-50 border border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recovery Assessment</h4>
        
        {/* Fracture Stability Metric */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Fracture Stability
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">{fractureStability.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${fractureStability}%` }}
              className="h-full bg-emerald-500 rounded-full"
             />
          </div>
        </div>

        {/* Mechanical Stress Metric */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-orange-500" /> Mechanical Stress
            </span>
            <span className="text-xs font-mono font-bold text-orange-600">{mechanicalStress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
             <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${mechanicalStress}%` }}
              className="h-full bg-orange-500 rounded-full"
             />
          </div>
        </div>
      </div>

      {/* IMPACT ALERT ONLY IF NEEDED */}
      <AnimatePresence>
        {isImpactDetected && (
          <motion.div 
            initial={{ height: 0, opacity: 0, scale: 0.9 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.9 }}
            className="mb-6 p-4 bg-red-600 rounded-2xl flex items-center gap-4 text-white shadow-lg shadow-red-200"
          >
            <div className="bg-white/20 p-2 rounded-xl">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Critical Alert</span>
              <span className="block text-xs font-medium leading-tight">Acute Shock Detected. Risk of for fracture.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer: Recovery State */}
      <div className={`mt-auto p-4 rounded-[1.5rem] ${theme.bg} border ${theme.border} flex items-center justify-between transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 bg-white rounded-xl shadow-sm ${theme.color}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Recovery State</span>
            <span className={`text-sm font-black italic uppercase leading-none mb-1 ${theme.color}`}>
              {theme.stateTitle}
            </span>
            <span className="text-[10px] font-medium text-slate-600 opacity-80 leading-tight">
              {theme.stateDesc}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}