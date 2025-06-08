import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  cover_image?: string;
  bio?: string;
  website?: string;
  disciplines?: string[];
  social_links?: Array<{ name: string; url: string; }>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const { data: { user: authUser }, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;

      // Buscar usuario en la tabla usuarios
      let { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', authUser?.id)
        .single();

      // Si no existe, crearlo automáticamente
      if (dbError && dbError.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              id: authUser?.id,
              email: authUser?.email,
              nombre_usuario: authUser?.user_metadata?.username || authUser?.email?.split('@')[0] || '',
              nombre_completo: authUser?.user_metadata?.full_name || authUser?.email || '',
              avatar_url: authUser?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${authUser?.email}`,
              disciplines: [],
              social_links: []
            }
          ])
          .select()
          .single();
        if (insertError) throw insertError;
        dbUser = newUser;
      } else if (dbError) {
        throw dbError;
      }

      set({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          username: dbUser.nombre_usuario,
          displayName: dbUser.nombre_completo,
          avatar: dbUser.avatar_url,
          cover_image: dbUser.cover_image,
          bio: dbUser.bio,
          website: dbUser.website,
          disciplines: dbUser.disciplines,
          social_links: dbUser.social_links
        },
        isAuthenticated: true,
        isLoading: false
      });

      toast.success('¡Bienvenido de nuevo!');
    } catch (error) {
      toast.error('Error al iniciar sesión');
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, username: string, displayName: string) => {
    try {
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpError) throw signUpError;

      const { data: dbUser, error: dbError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authUser?.id,
            email,
            nombre_usuario: username,
            nombre_completo: displayName,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`,
            disciplines: [],
            social_links: []
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      set({
        user: {
          id: dbUser.id,
          email: dbUser.email,
          username: dbUser.nombre_usuario,
          displayName: dbUser.nombre_completo,
          avatar: dbUser.avatar_url,
          cover_image: dbUser.cover_image,
          bio: dbUser.bio,
          website: dbUser.website,
          disciplines: dbUser.disciplines,
          social_links: dbUser.social_links
        },
        isAuthenticated: true,
        isLoading: false
      });

      toast.success('¡Cuenta creada exitosamente!');
    } catch (error) {
      toast.error('Error al crear la cuenta');
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });

      toast.success('Sesión cerrada');
    } catch (error) {
      toast.error('Error al cerrar sesión');
      throw error;
    }
  },

  updateUser: async (data: Partial<User>) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre_usuario: data.username,
          nombre_completo: data.displayName,
          avatar_url: data.avatar,
          cover_image: data.cover_image,
          bio: data.bio,
          website: data.website,
          disciplines: data.disciplines,
          social_links: data.social_links
        })
        .eq('id', data.id);

      if (error) throw error;

      set(state => ({
        user: {
          ...state.user!,
          ...data
        }
      }));
    } catch (error) {
      toast.error('Error al actualizar el perfil');
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    let { data: dbUser, error: dbError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();
    // Si no existe, crearlo automáticamente
    if (dbError && dbError.code === 'PGRST116') {
      const { data: newUser, error: insertError } = await supabase
        .from('usuarios')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            nombre_usuario: data.user.user_metadata?.username || data.user.email?.split('@')[0] || '',
            nombre_completo: data.user.user_metadata?.full_name || data.user.email || '',
            avatar_url: data.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${data.user.email}`,
            disciplines: [],
            social_links: []
          }
        ])
        .select()
        .single();
      if (insertError) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      dbUser = newUser;
    } else if (dbError) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    set({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.nombre_usuario,
        displayName: dbUser.nombre_completo,
        avatar: dbUser.avatar_url,
        cover_image: dbUser.cover_image,
        bio: dbUser.bio,
        website: dbUser.website,
        disciplines: dbUser.disciplines,
        social_links: dbUser.social_links
      },
      isAuthenticated: true,
      isLoading: false
    });
  },
}));