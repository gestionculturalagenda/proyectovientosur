import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal } from 'lucide-react';
import { Post, formatPostDate, getUserById, usePostStore } from '../../store/postStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { Link } from 'react-router-dom';
import ReactDOM from 'react-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface PostCardProps {
  post: Post;
  disableCardNavigation?: boolean;
  onDeleted?: () => void;
}

const urlRegex = /(https?:\/\/[\w\-\.\/?#&=;%+~]+)|(www\.[\w\-\.\/?#&=;%+~]+)/gi;

const PostCard: React.FC<PostCardProps> = ({ post, disableCardNavigation, onDeleted }) => {
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postUser, setPostUser] = useState<any>(null);
  const [commentUsers, setCommentUsers] = useState<Record<string, any>>({});
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const { user } = useAuthStore();
  const { toggleLike, addComment, toggleFavorite } = usePostStore();
  const commentInputRef = React.useRef<HTMLInputElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);

  // Cargar usuario del post
  useEffect(() => {
    let isMounted = true;
    setLoadingUser(true);
    (async () => {
      const u = await getUserById(post.userId);
      if (isMounted) {
        setPostUser(u);
        setLoadingUser(false);
      }
    })();
    return () => { isMounted = false; };
  }, [post.userId]);

  // Cargar usuarios de los comentarios
  useEffect(() => {
    let isMounted = true;
    setLoadingComments(true);
    (async () => {
      const ids = Array.from(new Set(post.comments.map(c => c.userId)));
      const users: Record<string, any> = {};
      await Promise.all(ids.map(async (id) => {
        const u = await getUserById(id);
        if (u) users[id] = u;
      }));
      if (isMounted) {
        setCommentUsers(users);
        setLoadingComments(false);
      }
    })();
    return () => { isMounted = false; };
  }, [post.comments]);

  const isLiked = user ? post.likes.includes(user.id) : false;
  
  const handleLike = () => {
    if (user) {
      toggleLike(post.id, user.id);
    }
  };
  
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && commentText.trim()) {
      await addComment(post.id, user.id, commentText);
      setCommentText('');
      // Refrescar usuarios de comentarios tras agregar uno nuevo
      const ids = Array.from(new Set([...post.comments.map(c => c.userId), user.id]));
      const users: Record<string, any> = {};
      await Promise.all(ids.map(async (id) => {
        const u = await getUserById(id);
        if (u) users[id] = u;
      }));
      setCommentUsers(users);
    }
  };
  
  const handleFavorite = () => {
    toggleFavorite(post.id);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.content?.slice(0, 60) || 'Post de Red Viento Sur',
        text: post.content,
        url: window.location.origin + '/posts/' + post.id
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + '/posts/' + post.id);
      toast.success('¡Enlace copiado!');
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== post.userId) return;
    if (!window.confirm('¿Estás seguro de eliminar este post?')) return;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);
      if (error) throw error;
      toast.success('Post eliminado exitosamente');
      if (typeof onDeleted === 'function') onDeleted();
    } catch (error) {
      toast.error('Error al eliminar el post');
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    // Insertar emoji en la posición actual del cursor
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
        input.setSelectionRange(start + 2, start + 2); // 2 = longitud típica de emoji
      }, 0);
    } else {
      setCommentText(commentText + (emoji.native || emoji.skins?.[0]?.native || ''));
    }
    setShowEmojiPicker(false);
  };
  
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((v) => {
      const next = !v;
      if (next && menuButtonRef.current) {
        const rect = menuButtonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
      return next;
    });
  };
  
  if (!post || !postUser) {
    return null;
  }
  
  return (
    <article className="feed-item rounded-none sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-shadow duration-200 mb-6 overflow-visible relative mx-0 sm:mx-auto">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          {postUser?.username ? (
            <Link to={`/profile/${postUser.username}`} className="avatar" aria-label={`Ver perfil de ${postUser.displayName || 'Usuario'}`}> 
              {loadingUser ? (
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              ) : (
                <img 
                  src={postUser?.avatar || '/default-avatar.png'} 
                  alt={postUser?.displayName || 'Usuario'} 
                  className="avatar-img"
                />
              )}
            </Link>
          ) : (
            <div className="avatar">
              <img 
                src={postUser?.avatar || '/default-avatar.png'} 
                alt={postUser?.displayName || 'Usuario'} 
                className="avatar-img opacity-50"
              />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {loadingUser ? (
                <span className="bg-gray-200 rounded w-20 h-4 inline-block animate-pulse" />
              ) : postUser?.username ? (
                <Link to={`/profile/${postUser.username}`} className="hover:underline" aria-label={`Ver perfil de ${postUser.displayName || 'Usuario'}`}> 
                  {postUser?.displayName || 'Usuario'}
                </Link>
              ) : (
                <span className="text-gray-400">{postUser?.displayName || 'Usuario'}</span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {disableCardNavigation ? (
                <span>{formatPostDate(post.createdAt)}</span>
              ) : (
                <Link to={`/posts/${post.id}`} className="hover:underline" onClick={e => {
                  const target = e.target as HTMLElement;
                  if (target.closest('[data-menu="post-menu"]')) {
                    e.preventDefault();
                  }
                }}>
                  <span>{formatPostDate(post.createdAt)}</span>
                </Link>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 relative">
          <button
            ref={menuButtonRef}
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleMenuClick}
            aria-label="Abrir menú"
            data-menu="post-menu"
          >
            <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          {showMenu && menuPosition && ReactDOM.createPortal(
            <div
              className="z-[9999] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[180px] animate-fade-in"
              style={{
                position: 'absolute',
                top: menuPosition.top,
                left: menuPosition.left,
                overflow: 'visible',
              }}
            >
              <ul className="py-2">
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {navigator.clipboard.writeText(window.location.origin + '/posts/' + post.id); setShowMenu(false); toast.success('¡Enlace copiado!')}}>
                    Guardar enlace
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={handleShare}>
                    Compartir publicación
                  </button>
                </li>
                {user && user.id === post.userId && (
                  <>
                    <li>
                      <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {setShowMenu(false); /* Aquí podrías abrir un modal de edición */}}>
                        Editar publicación
                      </button>
                    </li>
                    <li>
                      <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800" onClick={async () => {await handleDelete(); setShowMenu(false);}}>
                        Eliminar publicación
                      </button>
                    </li>
                  </>
                )}
                <li>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={e => { e.stopPropagation(); setShowMenu(false); }}>
                    Cancelar
                  </button>
                </li>
              </ul>
            </div>,
            document.body
          )}
        </div>
      </div>
      
      {/* Post Media */}
      {(Array.isArray((post as any).mediaUrls) && (post as any).mediaUrls.length > 0) ? (
        <div className="relative pb-3">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-full rounded-xl"
            style={{ maxWidth: '100%', maxHeight: 360 }}
          >
            {(post as any).mediaUrls.map((media: {url: string, type: string, name?: string}, idx: number) => (
              media.type === 'image' ? (
                <SwiperSlide key={media.url}>
                  <img
                    src={media.url}
                    alt={`Imagen ${idx + 1}`}
                    className="w-full h-[320px] object-cover rounded-xl border border-gray-200 dark:border-gray-800 cursor-pointer"
                    onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                  />
                </SwiperSlide>
              ) : media.type === 'video' ? (
                <SwiperSlide key={media.url}>
                  <video src={media.url} controls className="w-full h-[320px] object-cover rounded-xl border border-gray-200 dark:border-gray-800" />
                </SwiperSlide>
              ) : media.type === 'audio' ? (
                <SwiperSlide key={media.url}>
                  <audio src={media.url} controls className="w-full" />
                </SwiperSlide>
              ) : media.type === 'document' ? (
                <SwiperSlide key={media.url}>
                  <div className="flex items-center justify-center h-[320px]">
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Ver documento {media.name || ''}</a>
                  </div>
                </SwiperSlide>
              ) : null
            ))}
          </Swiper>
          {/* Lightbox/Modal para imágenes */}
          {lightboxOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setLightboxOpen(false)}>
              <button
                className="absolute top-4 right-4 text-white text-3xl font-bold bg-black/40 rounded-full p-2 hover:bg-black/70"
                onClick={e => { e.stopPropagation(); setLightboxOpen(false); }}
                aria-label="Cerrar"
              >
                ×
              </button>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl font-bold bg-black/40 rounded-full p-2 hover:bg-black/70"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + (post as any).mediaUrls.length) % (post as any).mediaUrls.length); }}
                aria-label="Anterior"
              >
                ‹
              </button>
              <img
                src={(post as any).mediaUrls[lightboxIndex].url}
                alt={`Imagen ampliada ${lightboxIndex + 1}`}
                className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-2xl border-4 border-white object-contain"
                onClick={e => e.stopPropagation()}
              />
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl font-bold bg-black/40 rounded-full p-2 hover:bg-black/70"
                onClick={e => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % (post as any).mediaUrls.length); }}
                aria-label="Siguiente"
              >
                ›
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/40 rounded px-3 py-1">
                {lightboxIndex + 1} / {(post as any).mediaUrls.length}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Soporte retrocompatibilidad mediaUrl único
        <>
          {post.mediaUrl && post.type === 'image' && (
            <div className="relative pb-3 flex justify-center">
              <img 
                src={post.mediaUrl} 
                alt="Post media" 
                className="rounded-xl border border-gray-200 dark:border-gray-800 w-auto max-w-full max-h-[350px] object-contain shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </div>
          )}
          {post.mediaUrl && post.type === 'video' && (
            <div className="relative pb-3 flex justify-center">
              <video src={post.mediaUrl} controls className="rounded-xl border border-gray-200 dark:border-gray-800 w-auto max-w-full max-h-[350px] object-contain shadow-sm" />
            </div>
          )}
          {post.mediaUrl && post.type === 'audio' && (
            <div className="relative pb-3 flex items-center">
              <audio src={post.mediaUrl} controls className="w-full" />
            </div>
          )}
          {post.mediaUrl && post.type === 'document' && (
            <div className="relative pb-3 flex items-center">
              <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline">Ver documento</a>
            </div>
          )}
        </>
      )}
      
      {/* Post Content (TEXTO) debajo del media */}
      <div className="px-4 pb-3 pt-2">
        <p className="mb-3 text-gray-900 dark:text-white text-base leading-relaxed whitespace-pre-line break-words">{post.content}</p>
      </div>
      {/* Enlaces en el contenido del post */}
      {post.content && post.content.match(urlRegex) && (
        <div className="mb-3 px-4">
          {post.content.match(urlRegex)?.map((url, idx) => (
            <div key={idx} className="mb-2">
              <a
                href={url.startsWith('http') ? url : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 underline break-all"
              >
                {url}
              </a>
            </div>
          ))}
        </div>
      )}
      
      {/* Post Actions */}
      <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 rounded-b-2xl">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className="flex items-center space-x-1 group"
          >
            <Heart 
              className={`h-5 w-5 ${isLiked 
                ? 'text-red-500 fill-red-500' 
                : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`} 
            />
            <span className={`text-sm ${isLiked 
              ? 'text-red-500' 
              : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`}>
              {post.likes.length}
            </span>
          </button>
          
          <button 
            onClick={() => setIsCommentExpanded(!isCommentExpanded)}
            className="flex items-center space-x-1 group"
          >
            <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-500">
              {post.comments.length}
            </span>
          </button>
          
          <button 
            onClick={handleShare}
            className="flex items-center group"
            title="Compartir"
          >
            <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
          </button>
        </div>
        
        <button 
          onClick={handleFavorite}
          className="flex items-center group"
        >
          <Bookmark 
            className={`h-5 w-5 ${post.isFavorite 
              ? 'text-primary-500 fill-primary-500' 
              : 'text-gray-600 dark:text-gray-400 group-hover:text-primary-500'}`}
          />
        </button>
      </div>
      
      {/* Comments */}
      {(post.comments.length > 0 || isCommentExpanded) && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          {post.comments.length > 0 && (
            <div className="mb-3 space-y-3">
              {post.comments.slice(0, isCommentExpanded ? undefined : 2).map(comment => {
                const commentUser = commentUsers[comment.userId];
                return (
                  <div key={comment.id} className="flex space-x-2">
                    <div className="flex-shrink-0">
                      <div className="avatar w-8 h-8">
                        {loadingComments ? (
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                        ) : (
                          <img 
                            src={commentUser?.avatar || '/default-avatar.png'} 
                            alt={commentUser?.displayName || 'Usuario'} 
                            className="avatar-img"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-white dark:bg-gray-900 p-2 rounded-lg">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {loadingComments ? <span className="bg-gray-200 rounded w-16 h-3 inline-block animate-pulse" /> : commentUser?.displayName || 'Usuario'}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatPostDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {post.comments.length > 2 && !isCommentExpanded && (
                <button 
                  onClick={() => setIsCommentExpanded(true)}
                  className="text-sm text-primary-600 dark:text-primary-400 font-medium"
                >
                  View all {post.comments.length} comments
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
    </article>
  );
};

export default PostCard;