import React, { useState, useEffect, useRef } from 'react';
import { PlusCircle, ChevronLeft, ChevronRight, Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  description: string;
  createdAt: string;
  likes: number;
  isViewed: boolean;
}

const StoriesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStoryText, setNewStoryText] = useState('');
  const [newStoryImage, setNewStoryImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [likeLoading, setLikeLoading] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [createMode, setCreateMode] = useState<'menu' | 'text' | 'photo'>('menu');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadStories = async () => {
      setIsLoading(true);
      // Traer stories reales (posts tipo 'story')
      const { data, error } = await supabase
        .from('posts')
        .select('id, autor_id, tipo, contenido, multimedia_url, creado_en, autor:usuarios(id, nombre_completo, avatar_url)')
        .eq('tipo', 'story')
        .order('creado_en', { ascending: false });
      if (error) {
        setStories([]);
        setIsLoading(false);
        return;
      }
      // Mapear a estructura Story
      const storiesMapped: Story[] = (data || []).map((s: any) => ({
        id: s.id,
        userId: s.autor_id,
        userName: s.autor?.nombre_completo || 'Usuario',
        userAvatar: s.autor?.avatar_url || '/default-avatar.png',
        imageUrl: s.multimedia_url?.[0] || '',
        description: s.contenido || '',
        createdAt: s.creado_en,
        likes: 0, // Puedes implementar conteo real de likes si tienes tabla de reacciones
        isViewed: false // Puedes implementar lógica de vistos
      }));
      setStories(storiesMapped);
      setIsLoading(false);
    };
    loadStories();
  }, []);
  
  const handleStoryClick = (story: Story, index: number) => {
    setActiveStory(story);
    setStoryIndex(index);
  };
  
  const handleCloseStory = () => {
    setActiveStory(null);
  };
  
  const handleNextStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (storyIndex < stories.length - 1) {
      setStoryIndex(storyIndex + 1);
      setActiveStory(stories[storyIndex + 1]);
    } else {
      handleCloseStory();
    }
  };
  
  const handlePrevStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
      setActiveStory(stories[storyIndex - 1]);
    }
  };
  
  // Crear story
  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!newStoryText && !newStoryImage)) {
      toast.error('Agrega una imagen o texto');
      return;
    }
    setIsUploading(true);
    let imageUrl = '';
    if (newStoryImage) {
      const fileExt = newStoryImage.name.split('.').pop();
      const fileName = `stories/${user.id}_${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('event-images').upload(fileName, newStoryImage);
      if (uploadError) {
        toast.error('Error al subir la imagen');
        setIsUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }
    // Insertar story en posts
    const { error } = await supabase.from('posts').insert({
      autor_id: user.id,
      tipo: 'story',
      contenido: newStoryText,
      multimedia_url: imageUrl ? [imageUrl] : [],
    });
    if (error) {
      toast.error('Error al crear story');
    } else {
      toast.success('¡Story publicada!');
      setShowCreateModal(false);
      setNewStoryText('');
      setNewStoryImage(null);
      // Refrescar stories
      const { data, error } = await supabase
        .from('posts')
        .select('id, autor_id, tipo, contenido, multimedia_url, creado_en, autor:usuarios(id, nombre_completo, avatar_url)')
        .eq('tipo', 'story')
        .order('creado_en', { ascending: false });
      if (!error) {
        const storiesMapped: Story[] = (data || []).map((s: any) => ({
          id: s.id,
          userId: s.autor_id,
          userName: s.autor?.nombre_completo || 'Usuario',
          userAvatar: s.autor?.avatar_url || '/default-avatar.png',
          imageUrl: s.multimedia_url?.[0] || '',
          description: s.contenido || '',
          createdAt: s.creado_en,
          likes: 0,
          isViewed: false
        }));
        setStories(storiesMapped);
      }
    }
    setIsUploading(false);
  };

  // Like a story
  const handleLike = async (story: Story) => {
    if (!user) return toast.error('Inicia sesión para dar like');
    setLikeLoading(story.id);
    // Consultar si ya dio like
    const { data: existing } = await supabase
      .from('reacciones_post')
      .select('*')
      .eq('post_id', story.id)
      .eq('usuario_id', user.id)
      .single();
    if (existing) {
      // Quitar like
      await supabase.from('reacciones_post').delete().eq('post_id', story.id).eq('usuario_id', user.id);
      toast('Like eliminado');
    } else {
      // Dar like
      await supabase.from('reacciones_post').insert({ post_id: story.id, usuario_id: user.id, tipo: 'like' });
      toast('¡Te gustó la story!');
    }
    setLikeLoading(null);
    // Refrescar stories (likes)
    // (Para optimizar, podrías solo actualizar el story actual)
    const { data, error } = await supabase
      .from('posts')
      .select('id, autor_id, tipo, contenido, multimedia_url, creado_en, autor:usuarios(id, nombre_completo, avatar_url)')
      .eq('tipo', 'story')
      .order('creado_en', { ascending: false });
    if (!error) {
      const storiesMapped: Story[] = (data || []).map((s: any) => ({
        id: s.id,
        userId: s.autor_id,
        userName: s.autor?.nombre_completo || 'Usuario',
        userAvatar: s.autor?.avatar_url || '/default-avatar.png',
        imageUrl: s.multimedia_url?.[0] || '',
        description: s.contenido || '',
        createdAt: s.creado_en,
        likes: 0,
        isViewed: false
      }));
      setStories(storiesMapped);
    }
  };

  // Comentar story
  const handleComment = async (story: Story) => {
    if (!user || !commentText.trim()) return;
    await supabase.from('comentarios_post').insert({
      post_id: story.id,
      autor_id: user.id,
      contenido: commentText.trim()
    });
    toast.success('Comentario enviado');
    setCommentText('');
    // Aquí podrías refrescar comentarios si los muestras
  };

  if (isLoading) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Modal para crear story */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md flex flex-col items-center gap-4 p-6">
            <button type="button" className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl z-20" onClick={() => { setShowCreateModal(false); setCreateMode('menu'); setNewStoryText(''); setNewStoryImage(null); }} aria-label="Cerrar">&times;</button>
            <h3 className="text-lg font-bold mb-2 text-center w-full">Crear historia</h3>
            {createMode === 'menu' && (
              <div className="flex flex-col gap-4 w-full">
                <button type="button" className="btn btn-primary w-full rounded-full py-2 text-base font-semibold" onClick={() => setCreateMode('text')}>Historia de texto</button>
                <button
                  type="button"
                  className="btn btn-accent w-full rounded-full py-2 text-base font-semibold"
                  onClick={() => {
                    setCreateMode('photo');
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                >
                  Historia de foto
                </button>
              </div>
            )}
            {createMode === 'text' && (
              <form onSubmit={handleCreateStory} className="flex flex-col items-center gap-4 w-full">
                {user && (
                  <div className="flex items-center gap-2 mb-2 w-full">
                    <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full border-2 border-white shadow" />
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{user.displayName?.split(' ')[0]}</span>
                  </div>
                )}
                <textarea
                  className="w-full rounded border p-2 text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="¿Qué quieres compartir? (máx. 180 caracteres)"
                  value={newStoryText}
                  onChange={e => setNewStoryText(e.target.value)}
                  rows={4}
                  maxLength={180}
                  required
                />
                <div className="flex gap-2 w-full">
                  <button type="button" className="btn btn-secondary flex-1 rounded-full" onClick={() => setCreateMode('menu')}>Volver</button>
                  <button type="submit" className="btn btn-primary flex-1 rounded-full" disabled={isUploading}>{isUploading ? 'Publicando...' : 'Publicar'}</button>
                </div>
              </form>
            )}
            {createMode === 'photo' && (
              <form onSubmit={handleCreateStory} className="flex flex-col items-center gap-4 w-full">
                {user && (
                  <div className="flex items-center gap-2 mb-2 w-full">
                    <img src={user.avatar} alt={user.displayName} className="w-10 h-10 rounded-full border-2 border-white shadow" />
                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{user.displayName?.split(' ')[0]}</span>
                  </div>
                )}
                <label className="w-full flex flex-col items-center cursor-pointer">
                  <span className="mb-1 text-sm text-gray-600 dark:text-gray-300">Selecciona una imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={e => setNewStoryImage(e.target.files?.[0] || null)}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    required
                    style={{ display: 'none' }}
                  />
                  {newStoryImage && (
                    <img src={URL.createObjectURL(newStoryImage)} alt="Vista previa" className="w-full h-48 object-cover rounded-lg border" />
                  )}
                </label>
                <textarea
                  className="w-full rounded border p-2 text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="Texto opcional (máx. 180 caracteres)"
                  value={newStoryText}
                  onChange={e => setNewStoryText(e.target.value)}
                  rows={2}
                  maxLength={180}
                />
                <div className="flex gap-2 w-full">
                  <button type="button" className="btn btn-secondary flex-1 rounded-full" onClick={() => setCreateMode('menu')}>Volver</button>
                  <button type="submit" className="btn btn-accent flex-1 rounded-full" disabled={isUploading}>{isUploading ? 'Publicando...' : 'Publicar'}</button>
                </div>
              </form>
            )}
            <p className="text-xs text-gray-400 text-center mt-1">Elige el tipo de historia que quieres crear.</p>
          </div>
        </div>
      )}

      {/* Story Circles */}
      <div className="pt-2 pb-2 rounded-xl shadow flex items-center mx-auto max-w-2xl border border-primary-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex overflow-x-auto space-x-4 px-4 py-2 hide-scrollbar w-full">
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center min-w-[80px] group cursor-pointer"
            onClick={() => setShowCreateModal(true)}
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary-500 flex items-center justify-center bg-gradient-to-br from-primary-100 via-primary-50 to-white dark:from-primary-900/40 dark:via-primary-900/10 dark:to-gray-900 relative group transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 ring-2 ring-primary-200 dark:ring-primary-900/40">
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Tu avatar"
                  className="w-14 h-14 rounded-full object-cover absolute top-1 left-1 z-10 border-2 border-white dark:border-gray-900 group-hover:ring-2 group-hover:ring-primary-400 shadow-lg"
                />
              ) : null}
              <PlusCircle className="h-8 w-8 text-primary-500 z-20 group-hover:text-accent-500 transition-colors drop-shadow-lg" />
            </div>
            <span className="text-xs mt-1 text-gray-700 dark:text-gray-300 font-bold group-hover:text-primary-600 tracking-wide uppercase letter-spacing-wider transition-colors">Crear</span>
          </motion.div>
          {stories.map((story, index) => (
            <motion.div
              key={story.id}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center min-w-[80px] transition-all duration-200 group ${story.isViewed ? 'opacity-60' : 'opacity-100'}`}
              onClick={() => handleStoryClick(story, index)}
              style={{ cursor: 'pointer' }}
            >
              <div className={`w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-primary-500 to-accent-500 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200 ${story.isViewed ? 'grayscale' : ''}`}>
                <img 
                  src={story.userAvatar}
                  alt={story.userName}
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900 group-hover:ring-2 group-hover:ring-accent-400"
                />
              </div>
              <span className="text-xs mt-1 text-center truncate w-20 font-semibold group-hover:text-accent-600">{story.userName.split(' ')[0]}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Full Screen Story Viewer */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={handleCloseStory}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full max-w-md mx-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Progress Bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex p-2 space-x-1">
                {stories.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full flex-1 ${idx <= storyIndex ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
              
              {/* Story Content */}
              <div className="h-full relative">
                <img 
                  src={activeStory.imageUrl}
                  alt={activeStory.description}
                  className="w-full h-full object-cover"
                />
                
                {/* User Info */}
                <div className="absolute top-0 left-0 right-0 p-6 pt-8 flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={activeStory.userAvatar}
                      alt={activeStory.userName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{activeStory.userName}</p>
                    <p className="text-xs text-gray-300">
                      {new Date(activeStory.createdAt).toLocaleString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Description */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <p className="text-white mb-4">{activeStory.description}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-5">
                    <button className="text-white flex items-center" onClick={() => handleLike(activeStory)} disabled={likeLoading === activeStory.id}>
                      <Heart className="h-6 w-6 mr-1" />
                      <span>{activeStory.likes}</span>
                    </button>
                    <form onSubmit={e => { e.preventDefault(); handleComment(activeStory); }} className="flex items-center">
                      <input
                        type="text"
                        className="rounded px-2 py-1 text-sm mr-2"
                        placeholder="Comentar..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                      />
                      <button type="submit" className="text-white"><MessageCircle className="h-6 w-6" /></button>
                    </form>
                    <button className="text-white">
                      <Share2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                
                {/* Navigation Buttons */}
                {storyIndex > 0 && (
                  <button 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-1 rounded-full"
                    onClick={handlePrevStory}
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </button>
                )}
                
                {storyIndex < stories.length - 1 && (
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-1 rounded-full"
                    onClick={handleNextStory}
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </button>
                )}
              </div>
            </motion.div>
            
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 text-white z-50"
              onClick={handleCloseStory}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoriesPage;
