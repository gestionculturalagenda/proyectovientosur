import { HiOutlineHome, HiOutlineUser, HiOutlineBell, HiOutlineChat } from 'react-icons/hi';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { EventNote, CalendarToday, Article } from '@mui/icons-material';

const menuItems = [
  { icon: <HiOutlineHome size={22} />, label: 'Inicio', path: '/' },
  { icon: <HiOutlineUser size={22} />, label: 'Perfil', path: '/profile' },
  { icon: <HiOutlineChat size={22} />, label: 'Mensajes', path: '/direct-messages' },
];

const notifications = [
  'Tienes 2 mensajes nuevos',
  'Nuevo evento agregado',
  'Actualización de perfil completada',
];

interface LeftSidebarProps {
  onOpenConversations?: () => void;
}

export default function LeftSidebar({ onOpenConversations }: LeftSidebarProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full p-4 gap-6 bg-white dark:bg-gray-900">
      {/* Logo */}
      {/* Se eliminó la palabra VientoSur */}
      {/* Menú */}
      <nav className="flex flex-col gap-2">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition" onClick={() => navigate('/')}>{menuItems[0].icon}<span>{menuItems[0].label}</span></button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition" onClick={() => navigate('/profile')}>{menuItems[1].icon}<span>{menuItems[1].label}</span></button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition" onClick={onOpenConversations}>{menuItems[2].icon}<span>{menuItems[2].label}</span></button>
        {/* Botones adicionales debajo de Mensajes */}
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition" onClick={() => navigate('/agenda')}>
          <EventNote fontSize="small" />
          <span>Agenda</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition" onClick={() => navigate('/calendar')}>
          <CalendarToday fontSize="small" />
          <span>Calendario</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition" onClick={() => navigate('/blogs')}>
          <Article fontSize="small" />
          <span>Blogs</span>
        </button>
      </nav>
      {/* Perfil */}
      <div className="rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 mb-2">
        <div className="flex items-center gap-3">
          <img src={user?.avatar || 'https://i.pravatar.cc/40'} alt="avatar" className="w-10 h-10 rounded-full" />
          <div>
            <div className="font-semibold text-gray-800 dark:text-gray-100">{user?.displayName || 'Usuario'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">@{user?.username || 'usuario'}</div>
          </div>
        </div>
        <button className="mt-3 flex items-center gap-2 text-sm text-red-500 hover:underline" onClick={handleLogout}>
          <FiLogOut /> Cerrar sesión
        </button>
      </div>
      {/* Notificaciones */}
      <div className="rounded-lg shadow-md p-4 bg-white dark:bg-gray-800">
        <div className="font-semibold mb-2 text-gray-700 dark:text-gray-100 flex items-center gap-2">
          <HiOutlineBell /> Notificaciones
        </div>
        <ul className="text-sm text-gray-600 dark:text-gray-200 space-y-1">
          {notifications.map((n, i) => (
            <li key={i} className="list-disc ml-4">{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
