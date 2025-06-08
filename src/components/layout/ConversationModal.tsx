import React, { useState } from 'react';
import { HiOutlineMinus, HiOutlineX } from 'react-icons/hi';
import { ConversationsList } from '../messages/ConversationsList';
import { useAuthStore } from '../../store/authStore';
import { useRecentConversations } from '../../hooks/useRecentConversations';

interface ConversationModalProps {
  open: boolean;
  onClose: () => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const { conversations, loading } = useRecentConversations(user?.id || '');
  const [minimized, setMinimized] = useState(false);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-auto" onClick={onClose} />
      {/* Modal flotante */}
      <aside
        className={`relative mt-8 mr-8 w-[min(22rem,90vw)] max-w-full h-[80vh] bg-white shadow-2xl rounded-xl z-50 flex flex-col pointer-events-auto animate-fade-in ${minimized ? 'h-16 overflow-hidden' : ''}`}
        style={{ minWidth: '18rem' }}
      >
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <img src={user?.avatar || '/default-avatar.png'} alt={user?.displayName || user?.username} className="w-10 h-10 rounded-full" />
            <div className="font-semibold text-sm text-blue-600">@{user?.username}</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMinimized((v) => !v)} className="text-gray-400 hover:text-blue-500 text-xl" title="Minimizar">
              <HiOutlineMinus />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl" title="Cerrar">
              <HiOutlineX />
            </button>
          </div>
        </div>
        {!minimized && (
          <>
            {/* Sugerencias y barra de búsqueda ahora están en ConversationsList */}
            <div className="flex-1 overflow-y-auto">
              <ConversationsList
                onSelectUser={() => {}}
              />
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default ConversationModal;
