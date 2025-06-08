import React from 'react';

interface ThemeToggleProps {
  onToggle?: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle }) => {
  return (
    <button
      className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm"
      onClick={onToggle}
      aria-label="Cambiar modo oscuro"
    >
      <span className="material-icons text-lg">dark_mode</span>
      Modo oscuro
    </button>
  );
};

export default ThemeToggle;
