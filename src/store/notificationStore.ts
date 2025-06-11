import { create } from 'zustand';
import { Notification } from '../components/ui/NotificationCenter';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
  subscribeToNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  fetchNotifications: async () => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;
    // Cargar notificaciones históricas desde la tabla 'notificaciones'
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      set({ notifications: data.map((n: any) => ({
        id: n.id,
        type: n.tipo,
        title: n.titulo,
        description: n.descripcion,
        createdAt: n.created_at,
        read: n.leida,
        link: n.link
      })) });
    }
  },
  // Agregar notificación real a la tabla y al estado local
  addNotification: async (n) => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;
    // Insertar en la tabla notificaciones
    const { data, error } = await supabase.from('notificaciones').insert({
      user_id: user.id,
      tipo: n.type,
      titulo: n.title,
      descripcion: n.description,
      created_at: n.createdAt || new Date().toISOString(),
      leida: n.read || false,
      link: n.link || null
    }).select().single();
    if (!error && data) {
      set(state => ({ notifications: [{
        id: data.id,
        type: data.tipo,
        title: data.titulo,
        description: data.descripcion,
        createdAt: data.created_at,
        read: data.leida,
        link: data.link
      }, ...state.notifications] }));
    }
  },
  // Marcar como leída en la tabla y en el estado local
  markAsRead: async (id) => {
    set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
    await supabase.from('notificaciones').update({ leida: true }).eq('id', id);
  },
  // Suscripción en tiempo real a nuevas notificaciones para el usuario autenticado
  subscribeToNotifications: () => {
    const { user } = useAuthStore.getState();
    if (!user?.id) return;
    // Evitar múltiples suscripciones
    if ((window as any)._notiSub) return;
    const channel = supabase
      .channel('notificaciones-realtime-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const n = payload.new;
          set(state => ({ notifications: [{
            id: n.id,
            type: n.tipo,
            title: n.titulo,
            description: n.descripcion,
            createdAt: n.created_at,
            read: n.leida,
            link: n.link
          }, ...state.notifications] }));
        }
      )
      .subscribe();
    (window as any)._notiSub = channel;
  }
}));
