import React from "react";
import { motion } from "framer-motion";
import { Activity, Clock, ShieldCheck } from "lucide-react";
import { get } from "../data/helpers";

export default function ActivityTimeline({ history = [] }) {
  // 1. Data Parsing & Filtering
  const events = history
    .map((h) => ({
      time: h.name || "Unknown",
      activity: get(h, "sensors.mpu6050.activity", "Unknown"), // Updated to MPU6050
    }))
    .filter((e) => {
      const act = e.activity.toLowerCase();
      // Only keep events that are NOT low, moderate, or unknown
      return act && act !== "low" && act !== "moderate" && act !== "unknown";
    });

  // 2. Animation Variants for smooth UI
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="p-6 bg-white rounded-2xl shadow-lg h-full flex flex-col"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h3 className="font-semibold text-gray-800 flex items-center text-lg">
          <Activity className="w-5 h-5 mr-2 text-indigo-500" />
          Critical Activity Log
        </h3>
        <span className="text-xs font-medium bg-gray-100 text-gray-500 px-3 py-1 rounded-full shadow-sm">
          MPU6050 Sensor
        </span>
      </div>

      {/* Timeline Body */}
      <div className="flex-1 overflow-y-auto pr-2">
        {events.length > 0 ? (
          <motion.div variants={containerVariants} className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
            {events.map((event, index) => {
              // Dynamic styling based on severity
              const isSevere = event.activity.toLowerCase().includes("high");
              const dotColor = isSevere ? "bg-red-500" : "bg-orange-400";
              const textColor = isSevere ? "text-red-700" : "text-orange-700";
              const bgColor = isSevere ? "bg-red-50" : "bg-orange-50";

              return (
                <motion.div key={index} variants={itemVariants} className="relative pl-6">
                  {/* Timeline Dot */}
                  <span className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${dotColor}`} />
                  
                  {/* Event Card */}
                  <div className={`p-4 rounded-xl border ${bgColor} border-transparent transition-all hover:shadow-md hover:border-red-100`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-bold text-sm tracking-wide ${textColor}`}>
                        {event.activity.toUpperCase()}
                      </span>
                      <span className="flex items-center text-xs text-gray-500 font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {event.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {isSevere 
                        ? "Action required: Immediate rest recommended to prevent bone displacement." 
                        : "Caution: Elevated motion detected. Monitor patient closely."}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Premium Empty State */
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center text-center py-10 opacity-80">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-800 font-bold text-md">No Critical Events</p>
            <p className="text-sm text-gray-500 mt-2 max-w-[220px]">
              The patient is maintaining proper rest and safe movement levels.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}