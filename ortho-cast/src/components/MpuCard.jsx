import React from "react";
import { motion } from "framer-motion";
import { Activity, Footprints, BedDouble, AlertTriangle } from "lucide-react";
import { get } from "../data/helpers";

export default function MpuCard({ mpuData }) {
  // 1. Fetch & safely format sensor values to 2 decimal places
  const ax = parseFloat(get(mpuData, "ax", 0)).toFixed(2);
  const ay = parseFloat(get(mpuData, "ay", 0)).toFixed(2);
  const az = parseFloat(get(mpuData, "az", 0)).toFixed(2);
  
  const rawActivity = get(mpuData, "activity", "Unknown");
  const activityStr = rawActivity.toLowerCase();

  // 2. Dynamic Theme Engine based on Activity Level
  let theme = {
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: BedDouble,
    glow: "shadow-blue-500/10 hover:shadow-blue-500/20",
    readoutBg: "bg-gray-50",
  };

  if (activityStr.includes("high")) {
    theme = {
      color: "text-red-500",
      bg: "bg-red-50 animate-pulse",
      border: "border-red-200",
      icon: AlertTriangle,
      glow: "shadow-red-500/30 hover:shadow-red-500/40",
      readoutBg: "bg-red-50",
    };
  } else if (activityStr.includes("moderate") || activityStr.includes("walking")) {
    theme = {
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: Footprints,
      glow: "shadow-emerald-500/20 hover:shadow-emerald-500/30",
      readoutBg: "bg-emerald-50/50",
    };
  }

  const StatusIcon = theme.icon;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative p-6 bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between h-full transition-shadow duration-300 ${theme.glow}`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-semibold text-gray-800">Kinematics</h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">MPU6050 Motion Sensor</p>
        </div>
        <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.color} transition-colors duration-500`}>
          <Activity className="w-5 h-5" />
        </div>
      </div>

      {/* X, Y, Z Telemetry Panels */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* X Axis */}
        <div className={`p-3 rounded-lg border border-gray-100 text-center ${theme.readoutBg} transition-colors duration-300`}>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">X Axis</p>
          <p className="text-lg font-bold text-gray-700 font-mono">
            {ax}<span className="text-xs text-gray-400 ml-0.5">g</span>
          </p>
        </div>
        {/* Y Axis */}
        <div className={`p-3 rounded-lg border border-gray-100 text-center ${theme.readoutBg} transition-colors duration-300`}>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Y Axis</p>
          <p className="text-lg font-bold text-gray-700 font-mono">
            {ay}<span className="text-xs text-gray-400 ml-0.5">g</span>
          </p>
        </div>
        {/* Z Axis */}
        <div className={`p-3 rounded-lg border border-gray-100 text-center ${theme.readoutBg} transition-colors duration-300`}>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Z Axis</p>
          <p className="text-lg font-bold text-gray-700 font-mono">
            {az}<span className="text-xs text-gray-400 ml-0.5">g</span>
          </p>
        </div>
      </div>

      {/* Dynamic Status Footer */}
      <div className={`mt-auto p-4 rounded-xl border ${theme.bg} ${theme.border} transition-colors duration-500`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
              Current State
            </p>
            <p className={`text-lg font-bold capitalize ${theme.color}`}>
              {rawActivity}
            </p>
          </div>
          <StatusIcon className={`w-8 h-8 opacity-80 ${theme.color}`} />
        </div>
      </div>
    </motion.div>
  );
}