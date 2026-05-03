import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, ShieldQuestion, Activity, Info } from "lucide-react";

export default function AiAlertBanner({ insights = [] }) {
  // Empty State / Safety Check
  if (!insights || insights.length === 0) return null;

  // Scalable Configuration Dictionary
  const alertConfig = {
    critical: {
      icon: AlertTriangle,
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-900",
      iconColor: "text-red-600",
      badge: "bg-red-100 text-red-800 border-red-200",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-900",
      iconColor: "text-yellow-600",
      badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    normal: {
      icon: CheckCircle,
      bg: "bg-green-50",
      border: "border-green-500",
      text: "text-green-900",
      iconColor: "text-green-600",
      badge: "bg-green-100 text-green-800 border-green-200",
    },
  };

  // Staggered Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: -15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 250, damping: 20 } },
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center tracking-tight">
          <ShieldQuestion className="w-6 h-6 mr-2 text-indigo-600" />
          AI Health Analysis & Prescriptions
        </h2>
        <span className="flex items-center text-xs font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
          <Activity className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
          Live IoT Monitoring
        </span>
      </div>

      {/* Dynamic Grid of Insights */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <AnimatePresence>
          {insights.map((insight, index) => {
            const config = alertConfig[insight.level] || {
              icon: Info,
              bg: "bg-gray-50",
              border: "border-gray-500",
              text: "text-gray-900",
              iconColor: "text-gray-600",
              badge: "bg-gray-200 text-gray-800 border-gray-300",
            };
            const Icon = config.icon;

            return (
              <motion.div
                key={`${insight.title}-${index}`} // Stable keys for React reconciliation
                variants={cardVariants}
                layout
                role="alert"
                aria-live="polite"
                className={`p-5 rounded-xl shadow-sm border-l-4 ${config.bg} ${config.border} hover:shadow-md transition-all duration-300 relative overflow-hidden group`}
              >
                {/* Decorative Background Accent */}
                <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.08] transition-transform group-hover:scale-110 ${config.iconColor.replace('text-', 'bg-')}`} />

                <div className="flex items-start space-x-4 relative z-10">
                  {/* Glassmorphism Icon Box */}
                  <div className={`p-2.5 rounded-xl bg-white/70 backdrop-blur-md shadow-sm border border-white/50 flex-shrink-0 ${config.iconColor}`}>
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  
                  <div className="flex-1 pt-0.5">
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <h3 className={`font-bold text-base leading-tight ${config.text}`}>
                        {insight.title}
                      </h3>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider flex-shrink-0 ${config.badge}`}>
                        {insight.level}
                      </span>
                    </div>
                    <p className={`text-sm mt-1.5 ${config.text} opacity-90 leading-relaxed font-medium`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}