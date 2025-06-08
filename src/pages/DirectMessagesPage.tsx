import React, { useState, useEffect } from 'react';
import { ConversationsList } from '../components/messages/ConversationsList';
import { ChatWindow } from '../components/messages/ChatWindow';
import { useSearchParams } from 'react-router-dom';

const DirectMessagesPage: React.FC = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | undefined>(undefined);
  const [selectedUserAvatar, setSelectedUserAvatar] = useState<string | undefined>(undefined);
  const [searchParams] = useSearchParams();

  // Leer parámetros de la URL al cargar
  useEffect(() => {
    const to = searchParams.get('to');
    const name = searchParams.get('name');
    const avatar = searchParams.get('avatar');
    if (to) {
      setSelectedUserId(to);
      setSelectedUserName(name || undefined);
      setSelectedUserAvatar(avatar || undefined);
    }
  }, [searchParams]);

  // Handler para seleccionar usuario desde la lista
  const handleSelectUser = (userId: string, userName?: string, userAvatar?: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setSelectedUserAvatar(userAvatar);
  };

  return (
    <div className="flex h-[80vh] max-w-4xl mx-auto mt-6 border rounded shadow bg-white overflow-hidden">
      {/* Lista de conversaciones */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-3 font-bold border-b">Conversaciones</div>
        <ConversationsList onSelectUser={(userId, userName, userAvatar) => handleSelectUser(userId, userName, userAvatar)} />
      </div>
      {/* Ventana de chat */}
      <div className="flex-1 flex flex-col">
        {selectedUserId ? (
          <ChatWindow otherUserId={selectedUserId} otherUserName={selectedUserName} otherUserAvatar={selectedUserAvatar} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Selecciona una conversación para comenzar a chatear
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagesPage;
