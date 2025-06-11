import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { FaUserPlus } from 'react-icons/fa';

interface UserSuggestion {
  id: string;
  nombre_usuario: string;
  nombre_completo?: string;
  avatar_url?: string;
}

const SuggestionsToFollow: React.FC = () => {
  const { user, checkAuth } = useAuthStore();
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_usuario, nombre_completo, avatar_url')
        .neq('id', user?.id)
        .limit(5);
      if (!error && data) setSuggestions(data);
      setLoading(false);
    }
    if (user?.id) fetchSuggestions();
  }, [user]);

  const handleFollow = async (userId: string) => {
    if (!user?.id) return;
    setFollowing((prev) => [...prev, userId]);
    // Lógica real para seguir usuario en Supabase (tabla followers)
    const { error } = await supabase
      .from('followers')
      .insert({ follower_id: user.id, following_id: userId });
    if (error) {
      setFollowing((prev) => prev.filter((id) => id !== userId));
      // Si el error es por duplicado (ya lo sigues), también quitar la sugerencia
      if (error.code === '23505' || (error.message && error.message.toLowerCase().includes('duplicate'))) {
        setSuggestions((prev) => prev.filter((s) => s.id !== userId));
      }
      // No mostrar ningún mensaje
    } else {
      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
      // Refrescar usuario autenticado para actualizar contador de siguiendo
      if (typeof checkAuth === 'function') checkAuth();
    }
  };

  if (loading) return <div className="p-4">...</div>;
  if (!suggestions.length) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-800 p-4 mb-6">
      <h2 className="font-bold text-base mb-3 text-gray-700 dark:text-gray-200">Sugerencias para ti</h2>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar py-1">
        {suggestions.map((s) => (
          <div key={s.id} className="flex flex-col items-center w-32 min-w-[7rem] bg-gray-50 dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-100 dark:border-gray-800 mx-1">
            <img src={s.avatar_url || '/default-avatar.png'} alt={s.nombre_completo || s.nombre_usuario} className="w-14 h-14 rounded-full object-cover border-2 border-primary-400 mb-2" />
            <div className="font-medium text-xs truncate text-center text-gray-800 dark:text-gray-100">{s.nombre_completo || s.nombre_usuario}</div>
            <div className="text-[11px] text-gray-500 truncate mb-2">@{s.nombre_usuario}</div>
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary-600 text-white hover:bg-primary-700 transition text-xs font-semibold disabled:opacity-60"
              onClick={() => handleFollow(s.id)}
              disabled={following.includes(s.id)}
            >
              <FaUserPlus className="w-3 h-3" /> {following.includes(s.id) ? 'Siguiendo' : 'Seguir'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsToFollow;
