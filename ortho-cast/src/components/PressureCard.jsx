import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { get } from "../data/helpers";

export default function PressureCard({ pressureData }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="p-6 bg-white rounded-2xl shadow-lg"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-600">4-Point Pressure Reading</h3>
        <HeartPulse className="w-6 h-6 text-indigo-500" />
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-400">Front</p>
          <p className="text-2xl font-bold">{get(pressureData, "front")} psi</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Back</p>
          <p className="text-2xl font-bold">{get(pressureData, "back")} psi</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Left</p>
          <p className="text-2xl font-bold">{get(pressureData, "left")} psi</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Right</p>
          <p className="text-2xl font-bold">{get(pressureData, "right")} psi</p>
        </div>
      </div>
    </motion.div>
  );
}
