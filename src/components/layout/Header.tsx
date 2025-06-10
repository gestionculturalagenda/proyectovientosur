import { useState } from 'react';
import { HiOutlineSearch, HiOutlineMenu } from 'react-icons/hi';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';
import { UserSearch } from '../profile/UserSearch';
import { useNavigate } from 'react-router-dom';
import ConversationModal from './ConversationModal';
import MobileDrawerMenu from './MobileDrawerMenu';
import NotificationCenter from '../ui/NotificationCenter';
import { useNotifications } from '../../hooks/useNotifications';

const Header = () => {
  const { user, logout } = useAuthStore();
  const { notifications, markAsRead } = useNotifications();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileSearch, setShowProfileSearch] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const navigate = useNavigate();

  // Maneja la selección de usuario desde el buscador
  const handleSelectUser = (selectedUser: any) => {
    setShowProfileSearch(false);
    if (selectedUser) {
      navigate(`/profile/${selectedUser.nombre_usuario}`);
    }
  };

  return (
    <header className="flex items-center justify-between px-2 sm:px-4 md:px-8 py-2 sm:py-4 bg-white dark:bg-gray-900 shadow-md w-full z-40 border-b border-gray-100 dark:border-gray-800">
      {/* Menú hamburguesa solo en móvil */}
      <button
        className="lg:hidden p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 mr-2"
        onClick={() => setDrawerOpen(true)}
        aria-label="Abrir menú"
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
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition ${showProfileSearch ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
            aria-label="Buscar perfil"
            onClick={() => setShowProfileSearch((v) => !v)}
          >
            <HiOutlineSearch size={22} />
          </button>
        </div>
        {/* Notificaciones */}
        <NotificationCenter notifications={notifications} onMarkAsRead={markAsRead} />
        {/* Mensajes */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Mensajes"
          onClick={() => setShowConversationModal(true)}
        >
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-3.2A7.97 7.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </button>
        {/* Perfil y menú */}
        <div className="relative">
          <button
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setShowMenu((v) => !v)}
            aria-label="Menú de usuario"
          >
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.displayName || user?.username}
              className="w-9 h-9 rounded-full object-cover border"
            />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 shadow-lg rounded-lg py-2 z-50 border border-gray-100 dark:border-gray-800">
              <a href={`/profile/${user?.username}`} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Mi perfil</a>
              <a href="/create" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Crear contenido</a>
              <a href="#" onClick={() => { setShowConversationModal(true); setShowMenu(false); }} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Mensajes</a>
              <a href="/agenda" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Agenda</a>
              <a href="/calendario" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Calendario</a>
              <a href="/blogs" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Blogs</a>
              <a href="/settings" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">Configuración</a>
              <div className="px-4 py-2">
                <ThemeToggle onToggle={() => { document.documentElement.classList.toggle('dark'); }} />
              </div>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-red-600"
                onClick={logout}
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
