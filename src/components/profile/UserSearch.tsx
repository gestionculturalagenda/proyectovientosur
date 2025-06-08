import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface User {
  id: string;
  nombre_usuario: string;
  nombre_completo?: string;
  avatar_url?: string;
  email?: string;
}

interface UserSearchProps {
  onSelectUser?: (user: User) => void;
}

const highlight = (text: string, query: string) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 rounded px-0.5">{part}</mark> : part
  );
};

const UserSearch = ({ onSelectUser }: UserSearchProps): JSX.Element => {
  const currentUser = useAuthStore(state => state.user);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      // Búsqueda mejorada: nombre_usuario, nombre_completo, email, sin acentos
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_usuario, nombre_completo, avatar_url, email')
        .or(`nombre_usuario.ilike.%${query}%,nombre_completo.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(8);
      if (!error && data) {
        // Excluir el usuario autenticado
        const filtered = currentUser ? data.filter(u => u.id !== currentUser.id) : data;
        setResults(filtered);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
      setLoading(false);
    }, 250); // Debounce
    return () => clearTimeout(timeout);
  }, [query]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      setHighlighted((h) => (h + 1) % results.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setHighlighted((h) => (h - 1 + results.length) % results.length);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (results[highlighted]) {
        setShowDropdown(false);
        if (onSelectUser) onSelectUser(results[highlighted]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative max-w-md mx-auto w-full" style={{ padding: 8 }}>
      <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-500">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none text-sm"
          placeholder="Buscar usuarios por nombre o usuario..."
          value={query}
          onChange={e => { setQuery(e.target.value); setHighlighted(0); }}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
        />
        {loading && <span className="ml-2 text-xs text-gray-400">Buscando...</span>}
      </div>
      {showDropdown && results.length > 0 && (
        <div ref={dropdownRef} className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto animate-fade-in">
          {results.map((user, idx) => (
            <div
              key={user.id}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-800 ${highlighted === idx ? 'bg-primary-100 dark:bg-gray-800' : ''}`}
              onMouseDown={() => {
                setShowDropdown(false);
                if (onSelectUser) onSelectUser(user);
              }}
              onMouseEnter={() => setHighlighted(idx)}
            >
              <img
                src={user.avatar_url || '/default-avatar.png'}
                alt={user.nombre_completo || user.nombre_usuario}
                className="w-8 h-8 rounded-full mr-3"
              />
              <div className="flex flex-col">
                <span className="font-medium text-sm">{highlight(user.nombre_completo || user.nombre_usuario, query)}</span>
                <span className="text-xs text-gray-500">@{highlight(user.nombre_usuario, query)}</span>
                {user.email && <span className="text-xs text-gray-400">{highlight(user.email, query)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
      {showDropdown && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 animate-fade-in">
          No se encontraron usuarios.
        </div>
      )}
    </div>
  );
};

export { UserSearch };
