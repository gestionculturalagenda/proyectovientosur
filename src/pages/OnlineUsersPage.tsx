import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  nombre_usuario: string;
  displayName?: string;
  avatar_url?: string;
  online?: boolean;
}

const OnlineUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      // Simulación: en un caso real, deberías tener un campo 'online' o usar Supabase Realtime
      const { data } = await supabase.from('usuarios').select('id, nombre_usuario, displayName, avatar_url').limit(30);
      setUsers(data || []);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Usuarios en línea</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <ul className="space-y-3">
          {users.map(user => (
            <li key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800">
              <img src={user.avatar_url || '/default-avatar.png'} alt={user.nombre_usuario} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-medium">{user.displayName || user.nombre_usuario}</div>
                <div className="text-xs text-gray-500">@{user.nombre_usuario}</div>
              </div>
              <Link to={`/messages?to=${user.id}`} className="ml-auto btn btn-primary btn-sm">Chatear</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OnlineUsersPage;
