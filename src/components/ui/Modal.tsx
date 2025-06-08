import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, className }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full mx-2 p-0 relative animate-modal-in ${className || ''}`}>
        <button
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 focus:outline-none"
          aria-label="Cerrar"
          onClick={onClose}
        >
          <span aria-hidden>×</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
