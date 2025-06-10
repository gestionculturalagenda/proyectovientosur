import { create } from 'zustand';
import { Notification } from '../components/ui/NotificationCenter';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface NotificationState {
  notifications: Notification[];
  fetchNotifications: () => Promise<void>;
  addNotification: (n: Notification) => void;
  markAsRead: (id: string) => void;
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
  addNotification: (n) => {
    set(state => ({ notifications: [n, ...state.notifications] }));
    // Guardar en la tabla 'notificaciones'
    const { user } = useAuthStore.getState();
    if (!user?.id) return;
    supabase.from('notificaciones').insert({
      user_id: user.id,
      tipo: n.type,
      titulo: n.title,
      descripcion: n.description,
      created_at: n.createdAt,
      leida: n.read || false,
      link: n.link || null
    });
  },
  markAsRead: (id) => {
    set(state => ({ notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n) }));
    supabase.from('notificaciones').update({ leida: true }).eq('id', id);
  }
}));
