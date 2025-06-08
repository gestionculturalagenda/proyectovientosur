import { create } from 'zustand';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';

export type PostType = 'text' | 'image' | 'video' | 'audio' | 'document';

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likes: string[];
  comments: Comment[];
  isFavorite: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
}

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  
  fetchPosts: () => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, userId: string, content: string) => Promise<void>;
  toggleFavorite: (postId: string) => Promise<void>;
  getFavoritePosts: () => Post[];
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  
  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          autor:usuarios(*),
          comentarios:comentarios_post(*),
          reacciones:reacciones_post(*)
        `)
        .order('creado_en', { ascending: false });

      if (error) throw error;

      // Transform data to match Post interface
      const transformedPosts: Post[] = await Promise.all(posts.map(async (post) => {
        // Check if post is favorited by current user
        const { data: favorite } = await supabase
          .from('favoritos_post')
          .select('*')
          .eq('post_id', post.id)
          .single();

        return {
          id: post.id,
          userId: post.autor_id,
          type: post.tipo,
          content: post.contenido,
          mediaUrl: post.multimedia_url?.[0],
          createdAt: post.creado_en,
          likes: post.reacciones.map((r: any) => r.usuario_id),
          comments: post.comentarios.map((c: any) => ({
            id: c.id,
            userId: c.autor_id,
            content: c.contenido,
            createdAt: c.creado_en
          })),
          isFavorite: !!favorite
        };
      }));

      set({ posts: transformedPosts, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar posts', 
        isLoading: false 
      });
    }
  },
  
  addPost: async (post) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      const insertData = {
        autor_id: post.userId,
        tipo: post.type,
        contenido: post.content,
        multimedia_url: post.mediaUrl ? [post.mediaUrl] : [],
        creado_en: now,
        actualizado_en: now
      };
      const { data, error } = await supabase
        .from('posts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      const newPost: Post = {
        id: data.id,
        userId: data.autor_id,
        type: data.tipo,
        content: data.contenido,
        mediaUrl: data.multimedia_url?.[0],
        createdAt: data.creado_en,
        likes: [],
        comments: [],
        isFavorite: false
      };
      set(state => ({ 
        posts: [newPost, ...state.posts],
        isLoading: false 
      }));
      toast.success('¡Publicación creada exitosamente!');
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear post', 
        isLoading: false 
      });
      toast.error('Error al crear post');
    }
  },
  
  toggleLike: async (postId, userId) => {
    try {
      const post = get().posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likes.includes(userId);

      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('reacciones_post')
          .delete()
          .eq('post_id', postId)
          .eq('usuario_id', userId);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('reacciones_post')
          .insert({
            post_id: postId,
            usuario_id: userId,
            tipo: 'like'
          });

        if (error) throw error;
      }

      // Update local state
      set(state => ({
        posts: state.posts.map(p => 
          p.id === postId
            ? {
                ...p,
                likes: isLiked
                  ? p.likes.filter(id => id !== userId)
                  : [...p.likes, userId]
              }
            : p
        )
      }));
    } catch (error) {
      toast.error('Error al actualizar reacción');
    }
  },
  
  addComment: async (postId, userId, content) => {
    try {
      const { data, error } = await supabase
        .from('comentarios_post')
        .insert({
          post_id: postId,
          autor_id: userId,
          contenido: content
        })
        .select()
        .single();

      if (error) throw error;

      const newComment: Comment = {
        id: data.id,
        userId: data.autor_id,
        content: data.contenido,
        createdAt: data.creado_en
      };

      set(state => ({
        posts: state.posts.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      }));
      
      toast.success('Comentario agregado');
    } catch (error) {
      toast.error('Error al agregar comentario');
    }
  },
  
  toggleFavorite: async (postId) => {
    try {
      const post = get().posts.find(p => p.id === postId);
      if (!post) return;

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      if (post.isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('favoritos_post')
          .delete()
          .eq('post_id', postId)
          .eq('usuario_id', session.session.user.id);

        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favoritos_post')
          .insert({
            post_id: postId,
            usuario_id: session.session.user.id
          });

        if (error) throw error;
      }

      // Update local state
      set(state => ({
        posts: state.posts.map(p =>
          p.id === postId
            ? { ...p, isFavorite: !p.isFavorite }
            : p
        )
      }));
    } catch (error) {
      toast.error('Error al actualizar favoritos');
    }
  },
  
  getFavoritePosts: () => {
    return get().posts.filter(post => post.isFavorite);
  }
}));

// Helper function to get user by ID
export const getUserById = async (userId: string) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;

  return {
    id: data.id,
    username: data.nombre_usuario,
    displayName: data.nombre_completo,
    avatar: data.avatar_url
  };
};

// Helper function to format post date
export const formatPostDate = (dateString: string) => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};