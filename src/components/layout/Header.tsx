import { useRef, useEffect, useState } from 'react';
import { HiOutlineSearch, HiOutlineMenu } from 'react-icons/hi';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';
import { UserSearch } from '../profile/UserSearch';
import { useNavigate } from 'react-router-dom';
import ConversationModal from './ConversationModal';
import MobileDrawerMenu from './MobileDrawerMenu';
import NotificationCenter from '../ui/NotificationCenter';
import { useNotificationStore } from '../../store/notificationStore';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuthStore();
  // Obtener notificaciones desde el store, no volver a usar el hook aquí
  const notifications = useNotificationStore(state => state.notifications);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileSearch, setShowProfileSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Maneja la selección de usuario desde el buscador
  const handleSelectUser = (selectedUser: any) => {
    setShowProfileSearch(false);
    if (selectedUser) {
      navigate(`/profile/${selectedUser.nombre_usuario}`);
    }
  };

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <header className="flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-4 bg-white dark:bg-gray-900 shadow-md w-full z-40 border-b border-gray-100 dark:border-gray-800">
      {/* Menú hamburguesa solo en móvil */}
      <button
        className="lg:hidden p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 mr-2 focus:outline focus:ring-2 focus:ring-primary-500"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menú lateral"
        type="button"
      >
        <HiOutlineMenu size={26} className="text-blue-600 dark:text-blue-300" />
      </button>
      {/* Logo */}
      <span className="font-bold text-lg sm:text-2xl text-blue-600 dark:text-blue-300">VientoSur</span>
      {/* Navegación e iconos */}
      <nav className="flex gap-2 sm:gap-6 items-center">
        {/* Iconos principales, visibles siempre */}
        {/* Botón de mensajes eliminado */}
        {/* Buscador de perfil desplegable */}
        <div className="relative flex items-center">
          {showProfileSearch && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 z-50 w-80">
              <UserSearch onSelectUser={handleSelectUser} />
            </div>
          )}
          <button
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition ${showProfileSearch ? 'bg-gray-100 dark:bg-gray-800' : ''} focus:outline focus:ring-2 focus:ring-primary-500`}
            aria-label="Buscar perfil"
            onClick={() => setShowProfileSearch((v) => !v)}
            type="button"
          >
            <HiOutlineSearch size={22} />
          </button>
        </div>
        {/* Notificaciones */}
        <NotificationCenter notifications={notifications} onMarkAsRead={markAsRead} />
        {/* Mensajes */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition focus:outline focus:ring-2 focus:ring-primary-500"
          aria-label="Mensajes"
          onClick={() => setShowConversationModal(true)}
          type="button"
        >
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.2A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
        {/* Perfil y menú */}
        <div className="relative">
          <button
            className="relative flex items-center p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline focus:ring-2 focus:ring-primary-500"
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Menú de usuario"
            type="button"
            aria-expanded={showMenu}
            aria-haspopup="true"
          >
            <span className="relative w-9 h-9 flex items-center justify-center">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt={user?.displayName ? `Avatar de ${user.displayName}` : user?.username ? `Avatar de ${user.username}` : 'Avatar de usuario'}
                className="w-9 h-9 rounded-full object-cover border"
              />
              <span className="absolute bottom-0 right-0 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow -mb-1 -mr-1">
                <ChevronDown className="w-3 h-3 text-gray-500 dark:text-gray-300" aria-hidden="true" />
              </span>
            </span>
          </button>
          {showMenu && (
            <div ref={menuRef} className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 shadow-lg rounded-lg py-2 z-50 border border-gray-100 dark:border-gray-800">
              <a href={`/profile/${user?.username}`}
                 className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                 aria-label="Ir a mi perfil"
              >Mi perfil</a>
              <a href="/create" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" aria-label="Crear contenido">Crear contenido</a>
              <a href="#" onClick={() => { setShowConversationModal(true); setShowMenu(false); }} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" aria-label="Abrir mensajes">Mensajes</a>
              <a href="/agenda" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" aria-label="Ir a agenda">Agenda</a>
              <a href="/calendario" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" aria-label="Ir a calendario">Calendario</a>
              <a href="/blogs" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" aria-label="Ir a blogs">Blogs</a>
              <a href="/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm" aria-label="Ir a configuración">Configuración</a>
              <div className="px-4 py-2">
                <ThemeToggle />
              </div>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-red-600 focus:outline focus:ring-2 focus:ring-primary-500"
                onClick={logout}
                type="button"
                aria-label="Cerrar sesión"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>
      <MobileDrawerMenu open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {/* Modal de conversaciones */}
      <div className="fixed top-0 right-0 z-50">
        <ConversationModal open={showConversationModal} onClose={() => setShowConversationModal(false)} />
      </div>
    </header>
  );
};

export default Header;
