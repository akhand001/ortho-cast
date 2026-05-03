import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, CalendarClock, User } from "lucide-react";

export default function DoctorNoteCard({ doctorNote }) {
  // Defensive checking: Ensure the note exists and has a message
  if (!doctorNote || !doctorNote.message) return null;

  // Format the date dynamically if provided, else fallback to 'Recently'
  const formattedDate = doctorNote.updatedAt
    ? new Date(doctorNote.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="relative p-6 bg-gradient-to-br from-white to-purple-50/50 rounded-2xl shadow-lg border border-purple-100 overflow-hidden group"
    >
      {/* Subtle Decorative Background Blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/40 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

      {/* Header Section */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center space-x-3">
          {/* Doctor Avatar Placeholder */}
          <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl shadow-sm border border-purple-200">
            {/* Fixed Icon Here */}
            <User className="w-5 h-5" /> 
          </div>
          <div>
            <h3 className="font-bold text-gray-800 tracking-tight">
              Attending Doctor
            </h3>
            <span className="flex items-center text-xs text-gray-500 mt-0.5 font-medium">
              <CalendarClock className="w-3.5 h-3.5 mr-1 text-purple-400" />
              {formattedDate}
            </span>
          </div>
        </div>
        
        {/* Status Badge */}
        <span className="px-2.5 py-1 bg-white text-purple-700 border border-purple-200 text-[10px] font-bold uppercase rounded-full shadow-sm tracking-widest">
          Prescription
        </span>
      </div>

      {/* Note Content Block */}
      <div className="relative pl-4 border-l-2 border-purple-300 bg-white/50 py-2 rounded-r-lg">
        {/* Faded Background Icon for aesthetics */}
        <MessageSquare className="absolute -top-2 -left-3 w-8 h-8 text-purple-100 -z-10 rotate-12" />
        
        <p className="text-sm text-gray-700 leading-relaxed font-medium italic">
          "{doctorNote.message}"
        </p>
      </div>
    </motion.div>
  );
}