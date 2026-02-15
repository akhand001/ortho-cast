import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, MessageSquare } from 'lucide-react';

export default function NotificationPanel({ notifications, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-20 right-0 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-600">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notifications
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div key={index} className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-start space-x-3">
              {notif.type === 'alert' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
              ) : (
                <MessageSquare className="w-5 h-5 text-purple-500 mt-1 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-200">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 p-6">No new notifications.</p>
        )}
      </div>
    </motion.div>
  );
}
