import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatWindow } from '../components/messages/ChatWindow';

const ChatWindowPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const otherUserId = searchParams.get('userId') || '';
  const otherUserName = searchParams.get('userName') || undefined;
  const otherUserAvatar = searchParams.get('userAvatar') || undefined;

  if (!otherUserId) {
    return <div className="flex items-center justify-center h-[80vh] text-gray-400">Usuario no especificado</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50">
      <div className="w-full max-w-4xl">
        <ChatWindow otherUserId={otherUserId} otherUserName={otherUserName} otherUserAvatar={otherUserAvatar} />
      </div>
    </div>
  );
};

export default ChatWindowPage;
