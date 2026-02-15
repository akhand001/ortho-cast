import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";

export default function DoctorNoteCard({ doctorNote }) {
  if (!doctorNote) return null;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="p-6 bg-white rounded-2xl shadow-lg"
    >
      <h3 className="font-semibold text-gray-600 mb-2 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
        Doctor's Note
      </h3>
      <p className="text-gray-700">{doctorNote.message}</p>
    </motion.div>
  );
}
