import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, ShieldQuestion } from "lucide-react";

export default function AiAlertBanner({ insight }) {
  if (!insight) return null;

  const alertConfig = {
    critical: { icon: AlertTriangle, color: "bg-red-100 text-red-700" },
    warning: { icon: AlertTriangle, color: "bg-yellow-100 text-yellow-700" },
    normal: { icon: CheckCircle, color: "bg-green-100 text-green-700" },
  };

  const config = alertConfig[insight.alertLevel] || {
    icon: ShieldQuestion,
    color: "bg-gray-100",
  };
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-2xl shadow-md flex items-center space-x-4 ${config.color}`}
    >
      <Icon className="w-8 h-8 flex-shrink-0" />
      <div>
        <h3 className="font-bold">AI Health Insight</h3>
        <p>{insight.message}</p>
      </div>
    </motion.div>
  );
}
