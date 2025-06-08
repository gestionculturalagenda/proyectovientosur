import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRecentConversations } from '../../hooks/useRecentConversations';
import { HiOutlineChatAlt2 } from 'react-icons/hi';

interface ConversationModalProps {
  open: boolean;
  onClose: () => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({ open, onClose }) => {
  const { user } = useAuthStore();
  const { conversations, loading } = useRecentConversations(user?.id || '');

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-auto" onClick={onClose} />
      {/* Modal flotante */}
      <aside
        className="relative mt-8 mr-8 w-[min(22rem,90vw)] max-w-full h-[80vh] bg-white shadow-2xl rounded-xl z-50 flex flex-col pointer-events-auto animate-fade-in"
        style={{ minWidth: '18rem' }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg flex items-center gap-2 text-blue-600">
            <HiOutlineChatAlt2 /> Conversaciones
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Cargando...</div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No tienes conversaciones aún.</div>
          ) : (
            <ul className="space-y-2">
              {conversations.map((c) => (
                <li key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 cursor-pointer">
                  <img src={c.avatar} alt={c.displayName} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{c.displayName}</div>
                    <div className="text-xs text-gray-500 truncate">@{c.username}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[180px]">{c.lastMessage}</div>
                    <div className="text-[10px] text-gray-400">{new Date(c.lastTime).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
};

export default ConversationModal;
