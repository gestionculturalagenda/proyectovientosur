import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRecentConversations } from '../../hooks/useRecentConversations';
import Modal from '../ui/Modal';
import { UserSearch } from '../profile/UserSearch';
import { Pencil } from 'lucide-react';

interface ConversationsListProps {
  onSelectUser: (userId: string, userName: string, userAvatar: string) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({ onSelectUser }) => {
  const { user } = useAuthStore();
  const { conversations, loading, fetchConversations } = useRecentConversations(user?.id || '');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) fetchConversations();
  }, [user, fetchConversations]);

  // Handler para seleccionar usuario desde el buscador
  const handleUserSearchSelect = (selectedUser: any) => {
    setShowModal(false);
    if (selectedUser) {
      setSelectedConvId(selectedUser.id);
      onSelectUser(selectedUser.id, selectedUser.nombre_completo || selectedUser.nombre_usuario, selectedUser.avatar_url || '/default-avatar.png');
    }
  };

  // Handler para seleccionar conversación de la lista
  const handleSelectConv = (u: any) => {
    setSelectedConvId(u.id);
    onSelectUser(u.id, u.displayName, u.avatar);
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header con avatar, nombre y botón */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <img src={user?.avatar || '/default-avatar.png'} alt={user?.displayName || user?.username} className="w-10 h-10 rounded-full" />
          <div className="font-semibold text-sm">@{user?.username}</div>
        </div>
        <button
          className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition"
          aria-label="Escribir mensaje"
          onClick={() => setShowModal(true)}
        >
          <Pencil className="h-5 w-5" />
        </button>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div className="p-4">
          <h2 className="font-bold mb-2 text-lg">Buscar usuario para chatear</h2>
          <UserSearch onSelectUser={(user: any) => { handleUserSearchSelect(user); }} />
        </div>
      </Modal>
      {/* Barra de búsqueda */}
      <div className="p-2 border-b bg-gray-50 dark:bg-gray-800">
        <input
          type="text"
          className="w-full px-3 py-2 rounded bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Buscar conversaciones..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Lista de conversaciones */}
      <div className="flex-1 overflow-y-auto divide-y" style={{ minHeight: 0 }}>
        {loading ? (
          <div className="p-4">Cargando conversaciones...</div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 gap-4" data-testid="no-conversations">
            <span className="text-gray-400 text-center">No tienes conversaciones aún.</span>
            <button
              className="px-4 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 transition text-sm"
              onClick={() => setShowModal(true)}
              data-testid="start-conversation-btn"
            >
              Iniciar nueva conversación
            </button>
          </div>
        ) : (
          conversations
            .slice()
            .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())
            .filter(u =>
              (u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
                u.username?.toLowerCase().includes(search.toLowerCase()))
            )
            .map((u) => (
              <div
                key={u.id}
                data-testid="conversation-item"
                className={`p-4 cursor-pointer flex items-center gap-3 rounded-lg transition-all ${selectedConvId === u.id ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                onClick={() => handleSelectConv(u)}
                tabIndex={0}
                aria-label={`Conversación con ${u.displayName}`}
              >
                <img src={u.avatar} alt={u.displayName} className="w-10 h-10 rounded-full mr-1 object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{u.displayName}</div>
                  <div className="text-xs text-gray-500 truncate">@{u.username}</div>
                  <div className="text-xs text-gray-400 truncate max-w-[180px]">{u.lastMessage}</div>
                  <div className="text-[10px] text-gray-400">{new Date(u.lastTime).toLocaleString()}</div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
