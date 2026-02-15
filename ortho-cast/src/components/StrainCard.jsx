import { motion } from "framer-motion";
import { Waves } from "lucide-react";
import CountUp from "react-countup";
import { get } from "../data/helpers";

export default function StrainCard({ strainData }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="p-6 bg-white rounded-2xl shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-600">Strain (Micro-Movement)</h3>
        <Waves className="w-6 h-6 text-teal-500" />
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-400">Gauge 1</p>
          <p className="text-2xl font-bold">
            <CountUp end={get(strainData, "gauge1")} duration={1.5} decimals={3} />
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Gauge 2</p>
          <p className="text-2xl font-bold">
            <CountUp end={get(strainData, "gauge2")} duration={1.5} decimals={3} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
