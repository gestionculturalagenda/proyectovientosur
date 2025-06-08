import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlineBell, HiOutlineChatAlt2 } from 'react-icons/hi';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ui/ThemeToggle';
import { UserSearch } from '../profile/UserSearch';
import { useNavigate } from 'react-router-dom';

const Header: React.FC<{ onOpenConversations?: () => void }> = ({ onOpenConversations }) => {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileSearch, setShowProfileSearch] = useState(false);
  const navigate = useNavigate();

  // Maneja la selección de usuario desde el buscador
  const handleSelectUser = (selectedUser: any) => {
    setShowProfileSearch(false);
    if (selectedUser) {
      navigate(`/profile/${selectedUser.nombre_usuario}`);
    }
  };

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white shadow-md w-full z-40">
      <span className="font-bold text-2xl text-blue-600">VientoSur</span>
      <nav className="flex gap-6">
        {/* Aquí puedes agregar enlaces de navegación principales si lo deseas */}
      </nav>
      <div className="flex items-center gap-4 relative">
        {/* Buscador de perfil desplegable */}
        <div className="relative flex items-center">
          {showProfileSearch && (
            <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 z-50 w-80">
              <UserSearch onSelectUser={handleSelectUser} />
            </div>
          )}
          <button
            className={`p-2 rounded-full hover:bg-gray-100 transition ${showProfileSearch ? 'bg-gray-100' : ''}`}
            aria-label="Buscar perfil"
            onClick={() => setShowProfileSearch((v) => !v)}
          >
            <HiOutlineSearch size={22} />
          </button>
        </div>
        {/* Mensajes */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Mensajes"
          onClick={onOpenConversations}
        >
          <HiOutlineChatAlt2 size={22} />
        </button>
        {/* Notificaciones */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Notificaciones"
        >
          <HiOutlineBell size={22} />
        </button>
        {/* Perfil y menú */}
        <div className="relative">
          <button
            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition"
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
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 z-50 border">
              <a href={`/profile/${user?.username}`} className="block px-4 py-2 hover:bg-gray-100 text-sm">Mi perfil</a>
              <a href="/settings" className="block px-4 py-2 hover:bg-gray-100 text-sm">Configuración</a>
              <ThemeToggle onToggle={() => { document.documentElement.classList.toggle('dark'); }} />
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
                onClick={logout}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
