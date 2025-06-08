import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RecentConversation {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
}

export function useRecentConversations(currentUserId: string) {
  const [conversations, setConversations] = useState<RecentConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    // Consulta: obtener usuarios con los que hay mensajes y el último mensaje
    const { data, error } = await supabase.rpc('get_recent_conversations', { user_id: currentUserId });
    if (!error && data) setConversations(data);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    if (currentUserId) fetchConversations();
  }, [currentUserId, fetchConversations]);

  return { conversations, loading, fetchConversations };
}
