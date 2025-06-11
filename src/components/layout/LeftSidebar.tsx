import { HiOutlineHome, HiOutlineUser, HiOutlineBell, HiOutlineChat } from 'react-icons/hi';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { EventNote, CalendarToday, Article } from '@mui/icons-material';
import NotificationCenter from '../ui/NotificationCenter';
import { useNotificationStore } from '../../store/notificationStore';

const menuItems = [
  { icon: <HiOutlineHome size={22} />, label: 'Inicio', path: '/' },
  { icon: <HiOutlineUser size={22} />, label: 'Perfil', path: '/profile' },
  { icon: <HiOutlineChat size={22} />, label: 'Mensajes', path: '/direct-messages' },
];

interface LeftSidebarProps {
  onOpenConversations?: () => void;
}

export default function LeftSidebar({ onOpenConversations }: LeftSidebarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  // Obtener notificaciones desde el store, no volver a usar el hook aquí
  const notifications = useNotificationStore(state => state.notifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="hidden lg:block flex flex-col h-full p-4 gap-6 bg-white dark:bg-gray-900">
      {/* Logo */}
      {/* Se eliminó la palabra VientoSur */}
      {/* Menú */}
      <nav className="flex flex-col gap-2">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition focus:outline focus:ring-2 focus:ring-primary-500" onClick={() => navigate('/')} aria-label="Ir a inicio" type="button">{menuItems[0].icon}<span>{menuItems[0].label}</span></button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition focus:outline focus:ring-2 focus:ring-primary-500" onClick={() => navigate(user?.username ? `/profile/${user.username}` : '/profile')} aria-label="Ir a perfil" type="button">{menuItems[1].icon}<span>{menuItems[1].label}</span></button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition focus:outline focus:ring-2 focus:ring-primary-500" onClick={onOpenConversations} aria-label="Ir a mensajes" type="button">{menuItems[2].icon}<span>{menuItems[2].label}</span></button>
        {/* Botones adicionales debajo de Mensajes */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition focus:outline focus:ring-2 focus:ring-primary-500" onClick={() => navigate('/agenda')} aria-label="Ir a agenda" type="button">
          <EventNote fontSize="small" />
          <span>Agenda</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition focus:outline focus:ring-2 focus:ring-primary-500" onClick={() => navigate('/calendar')} aria-label="Ir a calendario" type="button">
          <CalendarToday fontSize="small" />
          <span>Calendario</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition focus:outline focus:ring-2 focus:ring-primary-500" onClick={() => navigate('/blogs')} aria-label="Ir a blogs" type="button">
          <Article fontSize="small" />
          <span>Blogs</span>
        </button>
      </nav>
      {/* Perfil */}
      <div className="rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 mb-2">
        <div className="flex items-center gap-3">
          <img src={user?.avatar || 'https://i.pravatar.cc/40'} alt={user?.displayName ? `Avatar de ${user.displayName}` : user?.username ? `Avatar de ${user.username}` : 'Avatar de usuario'} className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-100">{user?.displayName || 'Usuario'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">@{user?.username || 'usuario'}</div>
          </div>
        </div>
        <button className="mt-3 flex items-center gap-2 text-sm text-red-500 hover:underline focus:outline focus:ring-2 focus:ring-primary-500" onClick={handleLogout} aria-label="Cerrar sesión" type="button">
          <FiLogOut /> Cerrar sesión
        </button>
      </div>
      {/* Notificaciones reales */}
      <div className="rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
        <div className="font-semibold mb-2 text-gray-700 dark:text-gray-100 flex items-center gap-2">
          <HiOutlineBell /> Notificaciones
        </div>
        <NotificationCenter notifications={notifications} onMarkAsRead={markAsRead} />
      </div>
    </div>
  );
}
