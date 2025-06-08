import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusSquare, Calendar, User, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/blogs', icon: BookOpen, label: 'Blogs' },
    { path: '/create', icon: PlusSquare, label: 'Crear' },
    { path: '/agenda', icon: Calendar, label: 'Agenda' },
    { path: user ? `/profile/${user.username}` : '/profile', icon: User, label: 'Perfil' }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 z-30">
      <div className="container mx-auto max-w-2xl">
        <div className="grid grid-cols-5 items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={path}
                to={path}
                className={`bottom-tab relative h-full flex items-center justify-center`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-500"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <div className="flex flex-col items-center">
                  <Icon 
                    className={`bottom-tab-icon ${isActive ? 'text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'}`} 
                  />
                  <span 
                    className={`text-xs ${isActive ? 'font-medium text-primary-600 dark:text-primary-500' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    {label}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;