import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false,
  message = 'Cargando...'
}) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <img
        src="/vite.svg"
        alt="loading"
        className={sizeMap[size]}
        style={{ filter: 'drop-shadow(0 0 6px #2563eb88)' }}
      />
      {message && <p className="mt-2 text-primary-700 dark:text-primary-300 font-semibold animate-pulse">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
