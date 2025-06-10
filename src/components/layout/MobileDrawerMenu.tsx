import { HiOutlineUser, HiOutlineChat, HiOutlineHome } from 'react-icons/hi';
import { CalendarToday, Article } from '@mui/icons-material';
import { FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface MobileDrawerMenuProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: <HiOutlineHome size={22} />, label: 'Inicio', path: '/' },
  { icon: <HiOutlineUser size={22} />, label: 'Perfil', path: '/profile' },
  { icon: <HiOutlineChat size={22} />, label: 'Mensajes', path: '/direct-messages' },
  { icon: <CalendarToday fontSize="small" />, label: 'Agenda', path: '/agenda' },
  { icon: <Article fontSize="small" />, label: 'Blogs', path: '/blogs' },
];

const MobileDrawerMenu = ({ open, onClose }: MobileDrawerMenuProps) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} />
      <aside className="relative w-64 max-w-full h-full bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-fade-in border-r border-gray-100 dark:border-gray-800">
        <button className="self-end m-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onClose} aria-label="Cerrar menú">
          ×
        </button>
        <nav className="flex flex-col gap-2 p-4">
          {menuItems.map((item) => (
            <button key={item.label} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100 font-medium transition" onClick={() => {navigate(item.path); onClose();}}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <div className="flex items-center gap-3 mb-2">
            <img src={user?.avatar || 'https://i.pravatar.cc/40'} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-semibold text-gray-800 dark:text-gray-100">{user?.displayName || 'Usuario'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-300">@{user?.username || 'usuario'}</div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm text-red-500 hover:underline" onClick={async () => {await logout(); navigate('/login');}}>
            <FiLogOut /> Cerrar sesión
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileDrawerMenu;
