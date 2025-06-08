import { useEffect, useState } from 'react';
import CreatePostForm from '../components/posts/CreatePostForm';
import PostCard from '../components/posts/PostCard';
import SkeletonCard from '../components/ui/SkeletonCard';
import { usePostStore } from '../store/postStore';
import { useEventStore } from '../store/eventStore';
import EventoCulturalCard from '../components/cultural/EventoCulturalCard';
import CreateEventForm from '../components/calendar/CreateEventForm';
import { Event } from '../store/eventStore';
import StoriesPage from './StoriesPage';

const FEED_MODES = [
  { label: 'Para ti', value: 'feed' },
  { label: 'Lo último', value: 'timeline' }
];

const HomePage = () => {
  const { posts, isLoading: isLoadingPosts, fetchPosts } = usePostStore();
  const { events, isLoading: isLoadingEvents, fetchEvents } = useEventStore();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [feedMode, setFeedMode] = useState<'feed' | 'timeline'>('feed');
  // Estados locales para manipulación inmediata de UI
  const [localPosts, setLocalPosts] = useState(posts);
  const [localEvents, setLocalEvents] = useState(events);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  useEffect(() => {
    fetchPosts();
    fetchEvents();
  }, [fetchPosts, fetchEvents]);

  // Simulación de cumpleaños (puedes reemplazar por tu fuente real)
  const [localBirthdays] = useState<any[]>([
    // Ejemplo:
    // { id: 'b1', name: 'Juan Pérez', date: '2025-06-01' },
  ]);

  // Unificar feed: posts, eventos y cumpleaños
  const unifiedFeed = [
    ...localPosts.map(post => ({
      type: 'post',
      date: new Date(post.createdAt),
      post
    })),
    ...localEvents
      .filter(event => event.date && !isNaN(new Date(event.date).getTime()))
      .map(event => ({
        type: 'event',
        date: new Date(event.date),
        event
      })),
    ...localBirthdays.map(birthday => ({
      type: 'birthday',
      date: new Date(birthday.date),
      birthday
    }))
  ];

  // Ordenar según modo
  const sortedFeed = feedMode === 'feed'
    ? unifiedFeed.slice().sort((a, b) => {
        if (a.type === 'post' && b.type === 'post' && 'post' in a && 'post' in b) {
          return b.post.likes.length - a.post.likes.length;
        }
        // Si solo uno es post, el post va primero
        if (a.type === 'post') return -1;
        if (b.type === 'post') return 1;
        // Si ambos no son post, ordenar por fecha
        return b.date.getTime() - a.date.getTime();
      })
    : unifiedFeed.slice().sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      {/* Stories Circles en la parte superior */}
      <StoriesPage />
      <CreatePostForm onSuccess={() => {
        setTimeout(() => {
          const firstPost = document.querySelector('.feed-item');
          if (firstPost) firstPost.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }} />

      {/* Modal de edición de evento */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
              onClick={() => setEditingEvent(null)}
            >
              ✕
            </button>
            <h2 className="text-lg font-bold mb-4">Editar evento</h2>
            <CreateEventForm
              date={new Date(editingEvent.date)}
              onSuccess={() => { setEditingEvent(null); fetchEvents(); }}
              onCancel={() => setEditingEvent(null)}
              initialData={{
                id: editingEvent.id,
                title: editingEvent.title,
                description: editingEvent.description,
                event_type: editingEvent.type,
                date: editingEvent.date.split('T')[0],
                location: editingEvent.location,
                target_audience: (['Infantil', 'Adultos', 'Todo Público'].includes(editingEvent.metadata?.target_audience ?? '')
                  ? editingEvent.metadata?.target_audience
                  : undefined) as 'Infantil' | 'Adultos' | 'Todo Público' | undefined,
                cost: { type: 'free' },
                responsible_person: editingEvent.metadata?.responsible_person || { name: '', phone: '' },
                technical_requirements: editingEvent.metadata?.technical_requirements || [],
                image_url: editingEvent.imagen_url,
                tags: editingEvent.metadata?.tags || [],
                recurrence: (
                  editingEvent.metadata?.recurrence &&
                  typeof editingEvent.metadata?.recurrence.type === 'string' &&
                  ['custom', 'none', 'daily', 'weekly', 'monthly'].includes(editingEvent.metadata?.recurrence.type)
                )
                  ? {
                      ...editingEvent.metadata?.recurrence,
                      type: editingEvent.metadata?.recurrence.type as 'custom' | 'none' | 'daily' | 'weekly' | 'monthly'
                    }
                  : { type: 'none' }
              }}
            />
          </div>
        </div>
      )}

      {/* Selector Feed/Timeline */}
      <div className="flex justify-center gap-4 my-4">
        {FEED_MODES.map((mode) => (
          <button
            key={mode.value}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-150 ${feedMode === mode.value ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
            onClick={() => setFeedMode(mode.value as 'feed' | 'timeline')}
            aria-pressed={feedMode === mode.value}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Feed unificado */}
      {(isLoadingPosts || isLoadingEvents) ? (
        <div>
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} type="post" />)}
        </div>
      ) : sortedFeed.length === 0 ? (
        <div className="card py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">No hay novedades aún</p>
          <p className="text-sm text-gray-400">¡Crea tu primera publicación, evento o cumpleaños para comenzar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedFeed.map((item) => {
            if (item.type === 'post' && 'post' in item) {
              return <PostCard key={item.post.id} post={item.post} onDeleted={() => setLocalPosts((prev) => prev.filter((p) => p.id !== item.post.id))} />;
            }
            if (item.type === 'event' && 'event' in item) {
              return <EventoCulturalCard key={item.event.id} event={{
                id: item.event.id,
                titulo: item.event.title,
                descripcion: item.event.description,
                fecha_inicio: item.event.date,
                ubicacion: item.event.location || '',
                imagen_url: item.event.imagen_url,
                categoria: '',
                tipo: item.event.type,
                userId: item.event.userId,
                metadata: {
                  target_audience: item.event.metadata?.target_audience as any || '',
                  responsible_person: item.event.metadata?.responsible_person || { name: '', phone: '' },
                  technical_requirements: item.event.metadata?.technical_requirements || [],
                  tags: item.event.metadata?.tags || [],
                }
              }} onEdit={() => setEditingEvent(item.event)} onDeleted={() => setLocalEvents((prev) => prev.filter((e) => e.id !== item.event.id))} />;
            }
            if (item.type === 'birthday' && 'birthday' in item) {
              return <div key={item.birthday.id} className="card">Cumpleaños: {item.birthday.name}</div>;
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
};

export default HomePage;