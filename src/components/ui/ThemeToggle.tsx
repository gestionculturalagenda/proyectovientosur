import { Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface ThemeToggleProps {
  onToggle?: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle }) => {
  const [dark, setDark] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleToggle = () => {
    setDark((prev) => !prev);
    if (onToggle) onToggle();
  };

  return (
    <button
      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
      onClick={handleToggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      type="button"
    >
      {dark ? (
        <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
      )}
      {dark ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
};

export default ThemeToggle;
