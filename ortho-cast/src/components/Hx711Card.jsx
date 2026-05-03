import React from "react";
import { motion } from "framer-motion";
import { Scale, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { get } from "../data/helpers";

export default function Hx711Card({ hx711Data, maxSafeWeight = 30 }) {
  // 1. Fetch & Parse current weight
  const currentWeight = parseFloat(get(hx711Data, "weight", 0));
  
  // 2. Calculate percentage for the progress bar (Cap at 100%)
  const percentage = Math.min((currentWeight / maxSafeWeight) * 100, 100);

  // 3. Dynamic Threshold Logic (Senior Dev Touch)
  let statusText = "Safe Weight Bearing";
  let StatusIcon = CheckCircle;
  let theme = {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    bar: "bg-emerald-500",
    border: "border-emerald-100",
    glow: "shadow-emerald-500/20",
  };

  if (currentWeight > maxSafeWeight) {
    statusText = "Overload Warning!";
    StatusIcon = AlertCircle;
    theme = {
      text: "text-red-600",
      bg: "bg-red-50 animate-pulse", // Pulses when in danger
      bar: "bg-red-500",
      border: "border-red-200",
      glow: "shadow-red-500/40",
    };
  } else if (currentWeight > maxSafeWeight * 0.7) {
    statusText = "Approaching Limit";
    StatusIcon = AlertTriangle;
    theme = {
      text: "text-amber-600",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
      border: "border-amber-200",
      glow: "shadow-amber-500/20",
    };
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col justify-between h-full hover:shadow-xl transition-shadow ${theme.glow}`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-800">Load / Force</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">HX711 Load Cell</p>
        </div>
        <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.text}`}>
          <Scale className="w-5 h-5" />
        </div>
      </div>

      {/* Main Value Display */}
      <div className="text-center my-2">
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-1">
          Current Force
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <p className={`text-5xl font-black tracking-tight ${theme.text}`}>
            {currentWeight.toFixed(1)}
          </p>
          <span className="text-xl font-bold text-gray-400">kg</span>
        </div>
      </div>

      {/* Progress Bar & Status Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        {/* Progress Bar Track */}
        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${theme.bar}`}
          />
        </div>
        
        {/* Status Text */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <StatusIcon className={`w-4 h-4 ${theme.text}`} />
            <span className={`text-xs font-bold uppercase tracking-wide ${theme.text}`}>
              {statusText}
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            Max: {maxSafeWeight}kg
          </span>
        </div>
      </div>
    </motion.div>
  );
}