import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRecentConversations } from '../../hooks/useRecentConversations';
import { supabase } from '../../lib/supabase';
import Modal from '../ui/Modal';
import { UserSearch } from '../profile/UserSearch';

interface ConversationsListProps {
  onSelectUser: (userId: string, userName: string, userAvatar: string) => void;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({ onSelectUser }) => {
  const { user } = useAuthStore();
  const { conversations, loading, fetchConversations } = useRecentConversations(user?.id || '');
  const [showModal, setShowModal] = useState(false);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user?.id) fetchConversations();
  }, [user, fetchConversations]);

  // Sugerencias reales: usuarios con los que no hay conversación reciente
  useEffect(() => {
    async function fetchSuggested() {
      setSuggestedLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_usuario, nombre_completo, avatar_url')
        .neq('id', user?.id)
        .limit(5);
      if (!error && data) {
        // Excluir usuarios ya en conversaciones
        const convIds = conversations.map((c: any) => c.id);
        setSuggested(data.filter((u: any) => !convIds.includes(u.id)));
      } else {
        setSuggested([]);
      }
      setSuggestedLoading(false);
    }
    if (user?.id) fetchSuggested();
  }, [user, conversations]);

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
        <input
          type="text"
          className="w-full max-w-xs px-3 py-2 rounded bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Buscar conversaciones..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {/* Sugerencias reales */}
      <div className="p-2 border-b bg-gray-50 flex flex-col gap-2">
        <div>
          <div className="font-semibold text-xs text-gray-500 mb-1">Sugerencias</div>
          {suggestedLoading ? (
            <div className="text-xs text-gray-400">Cargando...</div>
          ) : suggested.length === 0 ? (
            <div className="text-xs text-gray-400">Sin sugerencias</div>
          ) : suggested.map((s) => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded hover:bg-blue-50 cursor-pointer"
              onClick={async () => {
                if (!user) return;
                // Crear chat con el usuario sugerido si no existe
                const existing = conversations.find((c: any) => c.id === s.id);
                if (!existing) {
                  await supabase.from('conversaciones').insert({ user1: user.id, user2: s.id });
                  await fetchConversations();
                }
                window.location.href = `/chat?userId=${s.id}&userName=${encodeURIComponent(s.nombre_completo || s.nombre_usuario)}&userAvatar=${encodeURIComponent(s.avatar_url || '/default-avatar.png')}`;
              }}
            >
              <img src={s.avatar_url || '/default-avatar.png'} alt={s.nombre_completo || s.nombre_usuario} className="w-8 h-8 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{s.nombre_completo || s.nombre_usuario}</div>
                <div className="text-xs text-gray-500 truncate">@{s.nombre_usuario}</div>
              </div>
            </div>
          ))}
        </div>
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <div className="p-4">
            <h2 className="font-bold mb-2 text-lg">Buscar usuario para chatear</h2>
            <UserSearch onSelectUser={(user: any) => { handleUserSearchSelect(user); }} />
          </div>
        </Modal>
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
