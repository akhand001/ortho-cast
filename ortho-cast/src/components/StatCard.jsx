import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function StatCard({ title, value, unit, icon: Icon, color }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="p-4 bg-white rounded-2xl shadow-lg flex items-center space-x-4"
    >
      <div className={`p-3 rounded-full ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
      <div>
        <h3 className="font-semibold text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">
          <CountUp
            end={value}
            duration={1}
            separator=","
            decimals={title.includes("Temp") ? 1 : 0}
          />
          <span className="text-lg ml-1">{unit}</span>
        </p>
      </div>
    </motion.div>
  );
}
