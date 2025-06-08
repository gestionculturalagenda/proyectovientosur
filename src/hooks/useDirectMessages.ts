import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../store/authStore';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  reply_to?: { id: string; content: string } | null; // Soporte para reply
  // reacciones solo frontend, no persistente
  // reactions?: { [emoji: string]: number };
}

export function useDirectMessages(currentUserId: string) {
  const [conversations, setConversations] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Obtener conversaciones recientes (usuarios con los que he hablado)
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    // Consulta: obtener usuarios con los que hay mensajes
    const { data, error } = await supabase.rpc('get_conversations', { user_id: currentUserId });
    if (!error && data) setConversations(data);
    setLoading(false);
  }, [currentUserId]);

  // Obtener historial de mensajes con otro usuario
  const fetchMessages = useCallback(async (otherUserId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });
    if (!error && data) setMessages(data);
    setLoading(false);
  }, [currentUserId]);

  // Enviar mensaje
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: currentUserId, receiver_id: receiverId, content })
      .select()
      .single();
    if (!error && data) setMessages((prev) => [...prev, data]);
    return { data, error };
  }, [currentUserId]);

  // Suscripción realtime (opcional, se puede mejorar)
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  return {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
  };
}
