import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowLeft, Bell, Moon, Sun, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Modal from '../ui/Modal';
import { UserSearch } from '../profile/UserSearch';

const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showUserSearch, setShowUserSearch] = useState(false);
  
  const shouldShowBackButton = !['/'].includes(location.pathname);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Inicio';
      case '/favorites': return 'Favoritos';
      case '/create': return 'Crear';
      case '/calendar': return 'Calendario';
      case '/profile': return 'Perfil';
      case '/blogs': return 'Blogs';
      case '/stories': return 'Stories';
      case '/streams': return 'En Vivo';
      case '/messages': return 'Mensajes';
      default: return '';
    }
  };

  const [darkMode, setDarkMode] = React.useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };
  
  const [showMenu, setShowMenu] = React.useState(false);
  const [showConfigSubMenu, setShowConfigSubMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowConfigSubMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);
  
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center w-1/3">
            {shouldShowBackButton ? (
              <button 
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </button>
            ) : (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Red Viento Sur
              </h1>
            )}
          </div>
          {getPageTitle() && (
            <div className="flex items-center w-1/3 justify-center">
              <span className="text-base font-semibold text-gray-900 dark:text-white">{getPageTitle()}</span>
            </div>
          )}
          <div className="flex items-center w-1/3 justify-end gap-2">
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Buscar usuarios"
              onClick={() => setShowUserSearch(true)}
            >
              <Search className="h-5 w-5" />
            </button>
            <Modal open={showUserSearch} onClose={() => setShowUserSearch(false)}>
              <UserSearch onSelectUser={() => setShowUserSearch(false)} />
            </Modal>
            <button
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Notificaciones"
            >
              <Bell className="h-5 w-5" />
            </button>
            {/* Menú moderno */}
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Abrir menú"
                onClick={() => setShowMenu((v) => !v)}
                aria-haspopup="true"
                aria-expanded={showMenu}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {showMenu && (
                <div
                  ref={menuRef}
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in"
                  tabIndex={-1}
                  role="menu"
                  aria-label="Menú de usuario"
                >
                  <ul className="py-2">
                    <li>
                      <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => {navigate(user ? `/profile/${user.username}` : '/profile'); setShowMenu(false);}}>
                        <span className="font-medium">Mi perfil</span>
                      </button>
                    </li>
                    <li>
                      <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => {navigate('/direct-messages'); setShowMenu(false);}}>
                        <span className="font-medium">Mensajes</span>
                      </button>
                    </li>
                    <li>
                      <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => {navigate('/agenda'); setShowMenu(false);}}>
                        <span className="font-medium">Mi Agenda</span>
                      </button>
                    </li>
                    <li>
                      <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => {navigate('/calendar'); setShowMenu(false);}}>
                        <span className="font-medium">Calendario</span>
                      </button>
                    </li>
                    <li className="relative">
                      <button
                        className="w-full flex items-center gap-2 px-5 py-3 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors justify-between"
                        onClick={() => setShowConfigSubMenu((v) => !v)}
                        aria-haspopup="true"
                        aria-expanded={showConfigSubMenu}
                      >
                        <span className="font-medium">Configuración</span>
                        <span className="ml-2">{showConfigSubMenu ? '▲' : '▼'}</span>
                      </button>
                      {showConfigSubMenu && (
                        <div className="absolute left-0 right-0 mt-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
                          <ul className="py-2">
                            <li>
                              <button className="block w-full text-left px-5 py-3 hover:bg-primary-100 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => {setShowMenu(false); setShowConfigSubMenu(false);}}>Configuración y privacidad</button>
                            </li>
                            <li>
                              <button className="block w-full text-left px-5 py-3 hover:bg-primary-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2" onClick={toggleDarkMode}>
                                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}<span>Modo oscuro</span>
                              </button>
                            </li>
                            <li>
                              <button className="block w-full text-left px-5 py-3 hover:bg-primary-100 dark:hover:bg-gray-800 rounded-lg transition-colors" onClick={() => {setShowMenu(false); setShowConfigSubMenu(false);}}>Configuración de notificaciones</button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </li>
                    <li>
                      <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-red-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400 rounded-lg transition-colors font-medium" onClick={() => {logout && logout(); setShowMenu(false);}}>Salir</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

/* Animación fade-in para el menú */
// Puedes agregar esto en tu CSS global o tailwind.config.js:
// .animate-fade-in { animation: fadeIn 0.15s ease; }
// @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px);} to { opacity: 1; transform: none;} }