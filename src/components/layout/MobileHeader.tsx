import { HiOutlineMenu, HiOutlineDotsHorizontal } from 'react-icons/hi';
import NotificationCenter from '../ui/NotificationCenter';
import { useNotificationStore } from '../../store/notificationStore';

interface MobileHeaderProps {
  onOpenLeft: () => void;
  onOpenRight: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenLeft, onOpenRight }) => {
  // Obtener notificaciones desde el store, no volver a usar el hook aquí
  const notifications = useNotificationStore((state: any) => state.notifications);
  const markAsRead = useNotificationStore((state: any) => state.markAsRead);

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-md flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
      <button onClick={onOpenLeft} className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800">
        <HiOutlineMenu size={26} className="text-blue-600 dark:text-blue-300" />
      </button>
      <span className="font-bold text-lg text-blue-600 dark:text-blue-300">VientoSur</span>
      <NotificationCenter notifications={notifications} onMarkAsRead={markAsRead} />
      <button onClick={onOpenRight} className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800">
        <HiOutlineDotsHorizontal size={26} className="text-blue-600 dark:text-blue-300" />
      </button>
    </header>
  );
};

export default MobileHeader;
