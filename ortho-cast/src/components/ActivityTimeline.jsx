import { motion } from "framer-motion";
import { List } from "lucide-react";
import { get } from "../data/helpers";

export default function ActivityTimeline({ history }) {
  const events = history
    .map((h) => ({
      time: h.name,
      activity: get(h, "sensors.movement.activity", "Unknown"),
    }))
    .filter(
      (e) =>
        e.activity &&
        e.activity.toLowerCase() !== "low" &&
        e.activity.toLowerCase() !== "moderate"
    );

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="p-6 bg-white rounded-2xl shadow-lg"
    >
      <h3 className="font-semibold text-gray-600 mb-4 flex items-center">
        <List className="w-5 h-5 mr-2 text-gray-400" />
        Recent High-Activity Events
      </h3>
      {events.length > 0 ? (
        <ul className="space-y-2">
          {events.map((event, index) => (
            <li key={index} className="flex items-center text-sm">
              <span className="font-bold text-gray-700 mr-2">
                {event.time}:
              </span>
              <span className="text-red-500">{event.activity}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">
          No significant events detected recently.
        </p>
      )}
    </motion.div>
  );
}
