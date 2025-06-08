import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, MoreVertical } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface UserQuickActionsProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

const UserQuickActions: React.FC<UserQuickActionsProps> = ({ user, initialIsFollowing = false, onFollowChange }) => {
  const { user: currentUser } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleFollow = async () => {
    if (!currentUser || currentUser.id === user.id) return;
    setLoading(true);
    await supabase.from('followers').insert({ follower_id: currentUser.id, following_id: user.id });
    setIsFollowing(true);
    setLoading(false);
    onFollowChange?.(true);
  };
  const handleUnfollow = async () => {
    if (!currentUser || currentUser.id === user.id) return;
    setLoading(true);
    await supabase.from('followers').delete().eq('follower_id', currentUser.id).eq('following_id', user.id);
    setIsFollowing(false);
    setLoading(false);
    onFollowChange?.(false);
  };

  // Enviar mensaje directo (redirección)
  const handleSendMessage = () => {
    navigate(`/direct-messages?to=${user.id}&name=${encodeURIComponent(user.displayName || user.username)}&avatar=${encodeURIComponent(user.avatar || '/default-avatar.png')}`);
  };

  return (
    <div className="flex items-center space-x-2 relative">
      {/* Seguir/Dejar de seguir */}
      {currentUser && currentUser.id !== user.id && (
        isFollowing ? (
          <button
            onClick={handleUnfollow}
            disabled={loading}
            className="p-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 focus:outline-none transition hover:scale-110 shadow-sm border border-primary-100 dark:border-primary-900"
            aria-label="Dejar de seguir"
          >
            <Heart className="h-4 w-4 fill-primary-600 dark:fill-primary-400" />
          </button>
        ) : (
          <button
            onClick={handleFollow}
            disabled={loading}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none transition hover:scale-110 shadow-sm border border-gray-200 dark:border-gray-700"
            aria-label="Seguir"
          >
            <Heart className="h-4 w-4" />
          </button>
        )
      )}
      {/* Mensaje directo */}
      {currentUser && currentUser.id !== user.id && (
        <button
          onClick={handleSendMessage}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none transition hover:scale-110 shadow-sm border border-gray-200 dark:border-gray-700"
          aria-label={`Enviar mensaje a ${user.displayName || user.username}`}
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      )}
      {/* Menú de acciones */}
      <div className="relative">
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition hover:scale-110"
          aria-label="Más acciones"
          onClick={() => setShowMenu((v) => !v)}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {showMenu && (
          <div ref={menuRef} className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              <li>
                <Link to={`/profile/${user.username}`} className="block px-4 py-2 hover:bg-primary-50 dark:hover:bg-gray-800 rounded">Ver perfil</Link>
              </li>
              <li>
                <button onClick={handleSendMessage} className="block w-full text-left px-4 py-2 hover:bg-primary-50 dark:hover:bg-gray-800 rounded">Enviar mensaje</button>
              </li>
              <li>
                <button className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400 rounded">Reportar/Bloquear</button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserQuickActions;
