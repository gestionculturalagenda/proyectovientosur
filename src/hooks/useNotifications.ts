import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export function useNotifications() {
  const { user } = useAuthStore();
  const { notifications, fetchNotifications, addNotification, markAsRead } = useNotificationStore();

  // Cargar notificaciones históricas al iniciar
  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user?.id, fetchNotifications]);

  // Suscripción realtime a mensajes, comentarios y reacciones
  useEffect(() => {
    if (!user?.id) return;
    // Mensajes directos recibidos
    const msgChannel = supabase
      .channel('notifications-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user.id}`
      }, (payload) => {
        const msg = payload.new;
        addNotification({
          id: `msg-${msg.id}`,
          type: 'message',
          title: 'Nuevo mensaje',
          description: 'Has recibido un mensaje directo',
          createdAt: msg.created_at,
          read: false,
          link: `/direct-messages?to=${msg.sender_id}`
        });
      })
      .subscribe();
    // Comentarios en posts del usuario
    const commentChannel = supabase
      .channel('notifications-comments')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comentarios_post',
      }, (payload) => {
        const comment = payload.new;
        addNotification({
          id: `comment-${comment.id}`,
          type: 'comment',
          title: 'Nuevo comentario',
          description: 'Han comentado en una de tus publicaciones',
          createdAt: comment.creado_en,
          read: false,
          link: `/posts/${comment.post_id}`
        });
      })
      .subscribe();
    // Reacciones a posts del usuario
    const reactionChannel = supabase
      .channel('notifications-reactions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reacciones_post',
      }, (payload) => {
        const reaction = payload.new;
        addNotification({
          id: `reaction-${reaction.id}`,
          type: 'reaction',
          title: 'Nueva reacción',
          description: 'A alguien le gustó tu publicación',
          createdAt: reaction.creado_en,
          read: false,
          link: `/posts/${reaction.post_id}`
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(reactionChannel);
    };
  }, [user?.id]);

  return { notifications, markAsRead };
}
