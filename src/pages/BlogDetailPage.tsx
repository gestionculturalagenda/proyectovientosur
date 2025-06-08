import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import NotFoundPage from './NotFoundPage';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useAuthStore } from '../store/authStore';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  authorAvatar: string;
  published: string;
  category: string;
  commentsCount?: number;
  likesCount?: number;
}

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [commentUsers, setCommentUsers] = useState<Record<string, any>>({});
  const [likes, setLikes] = useState<string[]>([]);
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const commentInputRef = React.useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const isLiked = user ? likes.includes(user.id) : false;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('publicaciones')
        .select('id, titulo, excerpt, imagen_portada, categoria, publicado_en, autor_id')
        .eq('id', id)
        .eq('tipo', 'blog')
        .single();
      if (!data || error) {
        setBlog(null);
        setLoading(false);
        return;
      }
      // Obtener datos de autor
      let autor = { nombre_completo: 'Autor', avatar_url: '/default-avatar.png', id: '', nombre_usuario: '' };
      if (data.autor_id) {
        const { data: userData } = await supabase.from('usuarios').select('id, nombre_completo, avatar_url, nombre_usuario').eq('id', data.autor_id).single();
        if (userData) autor = userData;
      }
      // Comentarios y likes count
      const { count: commentsCount } = await supabase
        .from('comentarios_blog')
        .select('*', { count: 'exact', head: true })
        .eq('publicacion_id', data.id);
      const { count: likesCount } = await supabase
        .from('reacciones_blog')
        .select('*', { count: 'exact', head: true })
        .eq('publicacion_id', data.id)
        .eq('tipo', 'like');
      setBlog({
        id: data.id,
        title: data.titulo,
        excerpt: data.excerpt,
        coverImage: data.imagen_portada,
        authorId: autor.id,
        authorUsername: autor.nombre_usuario,
        authorName: autor.nombre_completo,
        authorAvatar: autor.avatar_url,
        published: data.publicado_en,
        category: data.categoria || 'General',
        commentsCount: commentsCount || 0,
        likesCount: likesCount || 0
      });
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!blog) return;
    // Cargar comentarios y usuarios
    const fetchComments = async () => {
      setLoadingComments(true);
      const { data } = await supabase
        .from('comentarios_blog')
        .select('*, autor:usuarios(id, nombre_completo, avatar_url)')
        .eq('publicacion_id', blog.id)
        .order('creado_en', { ascending: true });
      setComments(data || []);
      // Cargar usuarios de los comentarios
      if (data && data.length > 0) {
        const userMap: Record<string, any> = {};
        data.forEach((c: any) => {
          if (c.autor) userMap[c.autor.id] = c.autor;
        });
        setCommentUsers(userMap);
      }
      setLoadingComments(false);
    };
    // Cargar likes
    const fetchLikes = async () => {
      const { data } = await supabase
        .from('reacciones_blog')
        .select('usuario_id')
        .eq('publicacion_id', blog.id)
        .eq('tipo', 'like');
      setLikes(data ? data.map((r: any) => r.usuario_id) : []);
    };
    fetchComments();
    fetchLikes();
  }, [blog]);

  const handleLike = async () => {
    if (!user || !blog) return;
    if (isLiked) {
      await supabase
        .from('reacciones_blog')
        .delete()
        .eq('publicacion_id', blog.id)
        .eq('usuario_id', user.id)
        .eq('tipo', 'like');
      setLikes(likes.filter(id => id !== user.id));
    } else {
      await supabase
        .from('reacciones_blog')
        .insert({ publicacion_id: blog.id, usuario_id: user.id, tipo: 'like' });
      setLikes([...likes, user.id]);
    }
  };

  const handleShare = () => {
    if (!blog) return;
    const url = window.location.origin + '/blogs/' + blog.id;
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt,
        url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      // @ts-ignore
      if (typeof toast !== 'undefined') toast.success('¡Enlace copiado!');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && commentText.trim() && blog) {
      const { error, data } = await supabase
        .from('comentarios_blog')
        .insert({
          publicacion_id: blog.id,
          autor_id: user.id,
          contenido: commentText.trim()
        })
        .select('*, autor:usuarios(id, nombre_completo, avatar_url)')
        .single();
      if (!error && data) {
        setCommentText('');
        setShowEmojiPicker(false);
        setComments(prev => [...prev, data]);
        setCommentUsers(prev => ({ ...prev, [user.id]: data.autor }));
      }
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    if (commentInputRef.current) {
      const input = commentInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue =
        commentText.slice(0, start) +
        (emoji.native || emoji.skins?.[0]?.native || '') +
        commentText.slice(end);
      setCommentText(newValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + 2, start + 2);
      }, 0);
    } else {
      setCommentText(commentText + (emoji.native || emoji.skins?.[0]?.native || ''));
    }
    setShowEmojiPicker(false);
  };

  if (loading) return <div className="py-8 flex justify-center"><LoadingSpinner message="Cargando artículo..." /></div>;
  if (!blog) return <NotFoundPage />;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button onClick={() => window.location.href = '/'} className="text-primary-600 dark:text-primary-400 hover:underline mb-4">
        ← Volver a inicio
      </button>
      <div className="mb-4">
        <img src={blog.coverImage} alt={blog.title} className="w-full h-64 object-cover rounded-lg mb-4" />
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
            {blog.category}
          </span>
          <span className="mx-2">•</span>
          <span>{new Date(blog.published).toLocaleDateString('es-ES')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{blog.title}</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{blog.excerpt}</p>
        <div className="flex items-center gap-2 mb-4">
          <img src={blog.authorAvatar} alt={blog.authorName} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700" />
          <span className="font-medium text-gray-900 dark:text-white text-sm">{blog.authorName}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <button onClick={handleLike} className="flex items-center space-x-1 group">
            <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`} />
            <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`}>{likes.length}</span>
          </button>
          <button onClick={() => setIsCommentExpanded(!isCommentExpanded)} className="flex items-center space-x-1 group">
            <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-500">{comments.length}</span>
          </button>
          <button onClick={handleShare} className="flex items-center group" title="Compartir">
            <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
          </button>
        </div>
        {((comments.length > 0) || isCommentExpanded) && (
          <div className="px-0 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
            {comments.length > 0 && (
              <div className="mb-3 space-y-3">
                {comments.slice(0, isCommentExpanded ? undefined : 2).map(comment => {
                  const commentUser = commentUsers[comment.autor_id] || comment.autor;
                  return (
                    <div key={comment.id} className="flex space-x-2">
                      <div className="flex-shrink-0">
                        <div className="avatar w-8 h-8">
                          {loadingComments ? (
                            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                          ) : (
                            <img
                              src={commentUser?.avatar_url || '/default-avatar.png'}
                              alt={commentUser?.nombre_completo || 'Usuario'}
                              className="avatar-img"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="bg-white dark:bg-gray-900 p-2 rounded-lg">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {loadingComments ? <span className="bg-gray-200 rounded w-16 h-3 inline-block animate-pulse" /> : commentUser?.nombre_completo || 'Usuario'}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {comment.contenido}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.creado_en).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {(comments.length > 2 && !isCommentExpanded) && (
                  <button
                    onClick={() => setIsCommentExpanded(true)}
                    className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                  >
                    Ver los {comments.length} comentarios
                  </button>
                )}
              </div>
            )}
            {user && (
              <form onSubmit={handleComment} className="flex items-center space-x-2 relative">
                <div className="avatar w-8 h-8">
                  <img
                    src={user.avatar}
                    alt={user.displayName}
                    className="avatar-img"
                  />
                </div>
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Añade un comentario..."
                  className="flex-1 bg-white dark:bg-gray-900 rounded-full px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  aria-label="Insertar emoji"
                  tabIndex={-1}
                >
                  <span role="img" aria-label="emoji">😊</span>
                </button>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 disabled:opacity-50"
                >
                  Publicar
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-50 bottom-12 right-0">
                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" />
                  </div>
                )}
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetailPage;
