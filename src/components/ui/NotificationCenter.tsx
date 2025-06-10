import { useState, useEffect } from 'react';
// @ts-ignore
import { AnimatePresence, motion } from 'framer-motion';
// @ts-ignore
import { Bell } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'reaction' | 'comment' | 'message';
  title: string;
  description: string;
  createdAt: string;
  read?: boolean;
  link?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (id: string) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onMarkAsRead }) => {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 focus:outline-none"
        onClick={() => setOpen(v => !v)}
        aria-label="Ver notificaciones"
      >
        <Bell className="h-6 w-6 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 max-w-xs bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 z-50"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="font-bold text-gray-700 dark:text-gray-200">Notificaciones</span>
              <button className="text-xs text-primary-600 hover:underline" onClick={() => setOpen(false)}>Cerrar</button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">Sin notificaciones</div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-4 flex flex-col gap-1 cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                  onClick={() => { onMarkAsRead?.(n.id); setOpen(false); }}
                >
                  <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{n.title}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{n.description}</span>
                  <span className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
