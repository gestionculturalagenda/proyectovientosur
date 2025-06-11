import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Heart, 
  MessageCircle, 
  Send,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { getUserById } from '../../store/postStore';
import { Link } from 'react-router-dom';

interface EventoCulturalCardProps {
  event: {
    id: string;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    ubicacion: string;
    imagen_url?: string;
    categoria: string;
    tipo: string;
    userId?: string; // <-- Añadido para control de edición
    metadata: {
      target_audience: string;
      responsible_person: {
        name: string;
        phone: string;
        social_media?: string;
      };
      technical_requirements: string[];
      tags: string[];
    };
  };
  onEdit?: () => void;
  disableCardNavigation?: boolean;
  onDeleted?: () => void;
}

const EventoCulturalCard: React.FC<EventoCulturalCardProps> = ({ event, onEdit, disableCardNavigation, onDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [commentUsers, setCommentUsers] = useState<Record<string, any>>({});
  const [likes, setLikes] = useState<string[]>([]);
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const { user } = useAuthStore();
  const isCreator = user && event.userId && user.id === event.userId;
  const isLiked = user ? likes.includes(user.id) : false;

  React.useEffect(() => {
    // Cargar comentarios y usuarios
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comentarios_evento')
        .select('*')
        .eq('evento_id', event.id)
        .order('creado_en', { ascending: true });
      setComments(data || []);
      // Cargar usuarios de los comentarios
      if (data && data.length > 0) {
        const userMap: Record<string, any> = {};
        await Promise.all(
          Array.from(new Set(data.map((c: any) => c.autor_id))).map(async (userId: string) => {
            const userData = await getUserById(userId);
            if (userData) userMap[userId] = userData;
          })
        );
        setCommentUsers(userMap);
      }
    };
    const fetchLikes = async () => {
      const { data } = await supabase
        .from('reacciones_evento')
        .select('usuario_id')
        .eq('evento_id', event.id);
      setLikes(data ? data.map((r: any) => r.usuario_id) : []);
    };
    fetchComments();
    fetchLikes();
  }, [event.id]);

  const handleLike = async () => {
    if (!user) return;
    if (isLiked) {
      await supabase
        .from('reacciones_evento')
        .delete()
        .eq('evento_id', event.id)
        .eq('usuario_id', user.id);
      setLikes(likes.filter(id => id !== user.id));
    } else {
      await supabase
        .from('reacciones_evento')
        .insert({ evento_id: event.id, usuario_id: user.id });
      setLikes([...likes, user.id]);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      // Insertar en comentarios_evento
      const { data, error } = await supabase
        .from('comentarios_evento')
        .insert({ evento_id: event.id, autor_id: user.id, contenido: newComment.trim() })
        .select()
        .single();
      if (error) throw error;
      // Obtener datos de usuario para el nuevo comentario
      let userData = commentUsers[user.id];
      if (!userData) {
        userData = await getUserById(user.id);
        setCommentUsers(prev => ({ ...prev, [user.id]: userData }));
      }
      setComments([...comments, data]);
      setNewComment('');
    } catch (error) {
      toast.error('Error al agregar el comentario');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', event.id);
      if (error) throw error;
      toast.success('Evento eliminado exitosamente');
      if (typeof onDeleted === 'function') onDeleted();
    } catch (error) {
      toast.error('Error al eliminar el evento');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.titulo,
        text: event.descripcion,
        url: window.location.origin + '/eventos/' + event.id
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.origin + '/eventos/' + event.id);
      toast.success('¡Enlace copiado!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-lg shadow-md overflow-hidden mb-6 mx-0 sm:mx-auto">
      <div className="relative h-48 w-full">
        <img
          src={event.imagen_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
          alt={event.titulo}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {event.titulo}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {event.descripcion}
            </p>
          </div>
          <div className="flex space-x-2 relative">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline focus:ring-2 focus:ring-primary-500"
              onClick={e => { e.stopPropagation(); setShowMenu((v) => !v); }}
              aria-label="Abrir menú de opciones del evento"
              data-menu="evento-menu"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-10 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[180px] animate-fade-in"
              >
                <ul className="py-2">
                  <li>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {navigator.clipboard.writeText(window.location.origin + '/eventos/' + event.id); setShowMenu(false); toast.success('¡Enlace copiado!')}} aria-label="Copiar enlace del evento">
                      Guardar enlace
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={handleShare} aria-label="Compartir evento">
                      Compartir evento
                    </button>
                  </li>
                  {isCreator && (
                    <>
                      <li>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { setShowMenu(false); onEdit && onEdit(); }} aria-label="Editar evento">
                          Editar evento
                        </button>
                      </li>
                      <li>
                        <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800" onClick={async () => { await handleDelete(); setShowMenu(false); }} aria-label="Eliminar evento">
                          Eliminar evento
                        </button>
                      </li>
                    </>
                  )}
                  <li>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={e => { e.stopPropagation(); setShowMenu(false); }} aria-label="Cerrar menú de opciones">
                      Cancelar
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Fecha y categoría */}
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
            {event.categoria || event.categoria}
          </span>
          <span className="mx-2">•</span>
          {disableCardNavigation ? (
            <span><span className="sr-only">Fecha:</span> {format(new Date(event.fecha_inicio), 'dd MMM yyyy', { locale: es })}</span>
          ) : (
            <Link to={`/eventos/${event.id}`} className="group hover:underline">
              <span><span className="sr-only">Fecha:</span> {format(new Date(event.fecha_inicio), 'dd MMM yyyy', { locale: es })}</span>
            </Link>
          )}
        </div>

        {/* Reacciones y comentarios */}
        <div className="flex items-center space-x-6 mb-4">
          <button onClick={handleLike} className="flex items-center space-x-1 group focus:outline focus:ring-2 focus:ring-primary-500" aria-pressed={isLiked} aria-label={isLiked ? 'Quitar me gusta' : 'Dar me gusta'} type="button">
            <Heart className={`h-5 w-5 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`} />
            <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-red-500'}`}>{likes.length}</span>
          </button>
          <button onClick={() => setIsCommentExpanded(!isCommentExpanded)} className="flex items-center space-x-1 group focus:outline focus:ring-2 focus:ring-primary-500" aria-expanded={isCommentExpanded} aria-label={isCommentExpanded ? 'Ocultar comentarios' : 'Mostrar comentarios'} type="button">
            <MessageCircle className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-primary-500">{comments.length}</span>
          </button>
        </div>

        {/* Comentarios */}
        {isCommentExpanded && (
          <div className="mt-4">
            <div className="space-y-4">
              {/* Lista de comentarios */}
              {comments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                  No hay comentarios aún.
                </p>
              ) : (
                comments.map((comment) => {
                  const isAuthor = comment.autor_id === user?.id;
                  const userData = commentUsers[comment.autor_id];
                  return (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          src={userData?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData?.name || '')}
                          alt={userData?.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {userData?.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(comment.creado_en), 'dd MMM yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.contenido}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={async () => {
                              if (!isAuthor) return;
                              await supabase
                                .from('comentarios_evento')
                                .delete()
                                .eq('id', comment.id);
                              setComments(comments.filter(c => c.id !== comment.id));
                            }}
                            className="text-red-600 dark:text-red-400 text-xs flex items-center space-x-1 hover:underline"
                            aria-label="Eliminar comentario"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Formulario de nuevo comentario */}
            {user && (
              <form onSubmit={handleAddComment} className="mt-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-3 text-sm rounded-lg border focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
                      rows={2}
                      placeholder="Escribe un comentario..."
                      aria-label="Escribe un comentario"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-label="Agregar comentario"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoCulturalCard;