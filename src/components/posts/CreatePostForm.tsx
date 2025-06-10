import React, { useState, useRef } from 'react';
import { FileText, Mic, Send, Camera, Paperclip, Image, Music } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PostType, usePostStore } from '../../store/postStore';
import { toast } from 'sonner';
import FileUploadWithPreview from '../ui/FileUploadWithPreview';
import AudioRecorder from '../ui/AudioRecorder';
import VideoRecorder from '../ui/VideoRecorder';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onSuccess }) => {
  const [content, setContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<Array<{ url: string; type: string; name: string }>>([]);
  const [postType, setPostType] = useState<PostType>('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const audioRecorderRef = useRef<any>(null);
  const videoRecorderRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachType, setAttachType] = useState<'media' | 'music' | 'document' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState<Array<{ url: string; type: string; name: string }>>([]);
  const [modalText, setModalText] = useState('');
  const [showModalEmojiPicker, setShowModalEmojiPicker] = useState(false);

  const { user } = useAuthStore();
  const { addPost } = usePostStore();

  // Limpiar estados tras publicar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para crear una publicación');
      return;
    }
    if (!content.trim() && mediaUrls.length === 0) {
      toast.error('Por favor, agrega contenido o un archivo');
      return;
    }
    setIsSubmitting(true);
    try {
      await addPost({
        userId: user.id,
        type: postType,
        content: content.trim(),
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined, // Cambia a mediaUrls
        isFavorite: false
      });
      setContent('');
      setMediaUrls([]);
      setPostType('text');
      toast.success('¡Publicación creada exitosamente!');
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Error al crear la publicación');
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nuevo handler para integración con FileUploadWithPreview
  const handleFileSelect = (fileUrl: string | null) => {
    setMediaUrls(fileUrl ? [{ url: fileUrl, type: 'document', name: '' }] : []);
    if (fileUrl) {
      // Detectar tipo por extensión
      if (fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) setPostType('image');
      else if (fileUrl.match(/\.(mp4|webm|mov)$/i)) setPostType('video');
      else if (fileUrl.match(/\.(mp3|wav|ogg)$/i)) setPostType('audio');
      else setPostType('document');
    } else {
      setPostType('text');
    }
  };

  // Nuevo handler para integración con AudioRecorder
  const handleAudioReady = (audioUrl: string | null) => {
    setMediaUrls(audioUrl ? [{ url: audioUrl, type: 'audio', name: '' }] : []);
    setPostType(audioUrl ? 'audio' : 'text');
    setShowAudioRecorder(false); // Cierra el modal de grabación y previsualización al adjuntar el audio
    setIsRecording(false);
  };

  // Nuevo handler para integración con VideoRecorder
  const handleVideoReady = (videoUrl: string | null) => {
    setMediaUrls(videoUrl ? [{ url: videoUrl, type: 'video', name: '' }] : []);
    setPostType(videoUrl ? 'video' : 'text');
    setShowVideoRecorder(false);
  };

  // Handlers para grabación tipo WhatsApp
  const handleMicPress = () => {
    setShowAudioRecorder(true);
    setShowFileUpload(false);
    setShowVideoRecorder(false);
    setIsRecording(true);
    if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);
    setTimeout(() => {
      audioRecorderRef.current?.startRecording();
    }, 50); // pequeño delay para asegurar montaje
  };
  const handleMicRelease = () => {
    if (isRecording) {
      audioRecorderRef.current?.stopRecording();
      setIsRecording(false);
    }
  };
  const handleMicCancel = () => {
    if (isRecording) {
      audioRecorderRef.current?.cancelRecording();
      setIsRecording(false);
    }
  };

  const handleCameraPress = () => {
    setShowVideoRecorder(true);
    setShowFileUpload(false);
    setShowAudioRecorder(false);
    setTimeout(() => {
      videoRecorderRef.current?.startRecording();
    }, 50);
  };
  const handleCameraRelease = () => {
    videoRecorderRef.current?.stopRecording();
  };
  const handleCameraCancel = () => {
    videoRecorderRef.current?.cancelRecording();
  };

  const handleEmojiSelect = (emoji: any) => {
    setContent(content + (emoji.native || emoji.skins?.[0]?.native || ''));
    setShowEmojiPicker(false);
  };

  // Nuevo handler para adjuntar
  const handleAttachClick = () => {
    setShowAttachModal(true);
    setAttachType(null);
  };
  const handleAttachType = (type: 'media' | 'music' | 'document') => {
    setAttachType(type);
    setTimeout(() => fileInputRef.current?.click(), 200);
  };
  // Modifica handleAttachFile para permitir múltiples archivos
  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).map(file => {
      const url = URL.createObjectURL(file);
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      return { url, type, name: file.name };
    });
    setPreviewFiles(prev => [...prev, ...newFiles]);
    setShowPreviewModal(true);
    setShowAttachModal(false);
    setAttachType(null);
  };
  // Eliminar archivo del modal
  const handleRemovePreviewFile = (idx: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== idx));
  };
  // Agregar emoji al texto del modal
  const handleModalEmojiSelect = (emoji: any) => {
    setModalText(modalText + (emoji.native || emoji.skins?.[0]?.native || ''));
    setShowModalEmojiPicker(false);
  };
  // Handler para confirmar adjunto múltiple
  const handleConfirmPreview = () => {
    if (previewFiles.length > 0) {
      setMediaUrls(previewFiles);
      setPostType(previewFiles[0].type as PostType); // El tipo principal será el del primer archivo
      setContent(modalText);
    }
    setShowPreviewModal(false);
    setPreviewFiles([]);
    setModalText('');
  };
  const handleCancelPreview = () => {
    setShowPreviewModal(false);
    setPreviewFiles([]);
    setModalText('');
  };

  return (
    <div className="feed-item mb-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* Contenido superior (avatar y preview) */}
        <div className="p-4 pb-2">
          <div className="flex items-start space-x-3">
            <div className="avatar">
              <img 
                src={user?.avatar} 
                alt={user?.displayName} 
                className="avatar-img"
              />
            </div>
            <textarea
              placeholder={`Hola ${user?.displayName || ''} ¿Qué está pasando?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 p-4 text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm resize-none min-h-[48px] max-h-[160px] transition-all placeholder-gray-400 dark:placeholder-gray-500"
              rows={2}
              aria-label="Contenido de la publicación"
              required={!mediaUrls.length}
              disabled={isSubmitting}
              style={{height: 'auto', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)'}}
              onInput={e => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
          </div>
        </div>
        {/* Barra inferior tipo Telegram */}
        <div className="px-4 py-2 flex items-end border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-b-2xl">
          {/* Botón emoji */}
          <button
            type="button"
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 mr-1"
            onClick={() => setShowEmojiPicker((v) => !v)}
            aria-label="Insertar emoji"
            disabled={isSubmitting}
          >
            <span role="img" aria-label="emoji">😊</span>
          </button>
          {/* Botón clip para archivos: ahora abre modal de opciones */}
          <button
            type="button"
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 mr-1"
            onClick={handleAttachClick}
            aria-label="Adjuntar archivo"
            disabled={isSubmitting}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          {/* Espacio flexible para empujar los botones a la derecha */}
          <div className="flex-1" />
          {/* Botón micrófono o enviar, cambia según contenido */}
          {content.trim() || mediaUrls.length > 0 ? (
            <button 
              type="submit"
              disabled={isSubmitting || (!content.trim() && mediaUrls.length === 0)}
              className="btn btn-primary p-2 rounded-full flex items-center justify-center ml-1"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loader h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          ) : (
            // 1. Animación visual del botón de micrófono
            // Cambia el color y agrega animación de círculo creciente durante la grabación
            <button
              type="button"
              className={`relative p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ml-1 transition-all duration-200
                ${showAudioRecorder ? 'bg-red-200 text-red-600 ring-4 ring-red-400/30 animate-pulse' : ''}`}
              onMouseDown={handleMicPress}
              onMouseUp={handleMicRelease}
              onMouseLeave={handleMicCancel}
              onTouchStart={handleMicPress}
              onTouchEnd={handleMicRelease}
              onTouchCancel={handleMicCancel}
              aria-label="Grabar nota de voz"
              disabled={isSubmitting}
            >
              {isRecording && (
                <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
              )}
              <Mic className="h-5 w-5 relative z-10" />
            </button>
          )}
          {/* Botón cámara opcional, puedes dejarlo si lo usas mucho */}
          <button
            type="button"
            className={`p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 ml-1 ${showVideoRecorder ? 'bg-blue-200 text-blue-600' : ''}`}
            onMouseDown={handleCameraPress}
            onMouseUp={handleCameraRelease}
            onMouseLeave={handleCameraCancel}
            onTouchStart={handleCameraPress}
            onTouchEnd={handleCameraRelease}
            onTouchCancel={handleCameraCancel}
            aria-label="Grabar nota de video"
            disabled={isSubmitting}
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>
        {/* Subida de archivos con previsualización y progreso, solo si showFileUpload */}
        {showFileUpload && (
          <div className="px-4 pb-2">
            <FileUploadWithPreview onFileSelect={handleFileSelect} />
          </div>
        )}
        {/* Grabación de voz controlada por ref, solo si showAudioRecorder */}
        {showAudioRecorder && (
          <div className="px-4 pb-2">
            <AudioRecorder ref={audioRecorderRef} onAudioReady={handleAudioReady} />
            {isRecording && (
              <div className="text-red-600 font-bold mt-2 flex items-center gap-2">
                <Mic className="h-4 w-4 animate-pulse" /> Grabando... Suelta para enviar, desliza fuera para cancelar
              </div>
            )}
          </div>
        )}
        {/* Grabación de video controlada por ref, solo si showVideoRecorder */}
        {showVideoRecorder && (
          <div className="px-4 pb-2">
            <VideoRecorder ref={videoRecorderRef} onVideoReady={handleVideoReady} />
            <div className="text-blue-600 font-bold mt-2 flex items-center gap-2">
              <Camera className="h-4 w-4 animate-pulse" /> Grabando video... Suelta para enviar, desliza fuera para cancelar
            </div>
          </div>
        )}
        {/* Selector de emoji */}
        {showEmojiPicker && (
          <div
            className="fixed left-12 bottom-8 z-50 animate-slide-down shadow-2xl rounded-2xl bg-white dark:bg-gray-900 border border-primary-200 dark:border-primary-700"
          >
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="auto" />
          </div>
        )}
        {/* Modal de adjuntar */}
        {showAttachModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center gap-4 relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowAttachModal(false)}>&times;</button>
              <h3 className="text-lg font-bold mb-2">¿Qué quieres adjuntar?</h3>
              <div className="flex flex-col gap-3 w-full">
                <button type="button" className="w-full flex items-center gap-2 justify-center rounded-full py-2 text-base font-semibold bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-primary-700 dark:text-primary-200" onClick={() => handleAttachType('media')}><Image className="h-5 w-5" /> Foto/Video</button>
                <button type="button" className="w-full flex items-center gap-2 justify-center rounded-full py-2 text-base font-semibold bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-primary-700 dark:text-primary-200" onClick={() => handleAttachType('music')}><Music className="h-5 w-5" /> Música</button>
                <button type="button" className="w-full flex items-center gap-2 justify-center rounded-full py-2 text-base font-semibold bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-700 shadow-sm hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors text-primary-700 dark:text-primary-200" onClick={() => handleAttachType('document')}><FileText className="h-5 w-5" /> Documento</button>
              </div>
              {/* Input file oculto, cambia accept según tipo */}
              <input
                ref={fileInputRef}
                type="file"
                accept={attachType === 'media' ? 'image/*,video/*' : attachType === 'music' ? 'audio/*' : attachType === 'document' ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv' : '*/*'}
                style={{ display: 'none' }}
                onChange={handleAttachFile}
              />
            </div>
          </div>
        )}
        {/* Modal de previsualización de archivos adjuntos personalizado */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-full max-w-md flex flex-col items-center gap-4 relative animate-slide-up">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl" onClick={handleCancelPreview}>&times;</button>
              <h3 className="text-lg font-bold mb-2">Previsualización de archivos</h3>
              <div className="w-full flex flex-wrap gap-3 items-center justify-center">
                {previewFiles.map((file, idx) => (
                  <div key={file.url} className="relative group">
                    {file.type === 'image' && (
                      <img src={file.url} alt="Previsualización" className="rounded-lg max-h-32 max-w-[120px] object-contain border" />
                    )}
                    {file.type === 'video' && (
                      <video src={file.url} controls className="rounded-lg max-h-32 max-w-[120px] object-contain border" />
                    )}
                    {file.type === 'audio' && (
                      <audio src={file.url} controls className="w-28" />
                    )}
                    {file.type === 'document' && (
                      <div className="flex flex-col items-center w-28">
                        <FileText className="h-8 w-8 text-primary-500 mb-1" />
                        <span className="text-xs text-gray-700 dark:text-gray-200 truncate">{file.name}</span>
                      </div>
                    )}
                    <button type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 group-hover:opacity-100" onClick={() => handleRemovePreviewFile(idx)} title="Eliminar archivo">&times;</button>
                  </div>
                ))}
                {/* Botón para agregar más archivos */}
                <label className="flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-primary-300 rounded-lg p-4 hover:bg-primary-50 dark:hover:bg-gray-800 transition-colors">
                  <Paperclip className="h-6 w-6 text-primary-500 mb-1" />
                  <span className="text-xs text-primary-700 dark:text-primary-200">Agregar más</span>
                  <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv" className="hidden" onChange={handleAttachFile} />
                </label>
              </div>
              {/* Textarea y emojis */}
              <div className="w-full mt-2">
                <div className="flex items-center mb-2">
                  <button type="button" className="p-1 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800" onClick={() => setShowModalEmojiPicker(v => !v)} aria-label="Insertar emoji">
                    😊
                  </button>
                </div>
                <textarea
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none min-h-[48px]"
                  placeholder="Escribe un mensaje para acompañar tus archivos..."
                  value={modalText}
                  onChange={e => setModalText(e.target.value)}
                />
                {showModalEmojiPicker && (
                  <div className="absolute z-50 mt-2">
                    <Picker data={data} onEmojiSelect={handleModalEmojiSelect} theme="auto" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" className="btn btn-primary px-4 py-2 rounded-full" onClick={handleConfirmPreview} disabled={previewFiles.length === 0}>Adjuntar</button>
                <button type="button" className="btn btn-secondary px-4 py-2 rounded-full" onClick={handleCancelPreview}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePostForm;

/* Agrega la animación slide-up en tu CSS/tailwind:
@keyframes slide-up {
  0% { opacity: 0; transform: translateY(16px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slide-up {
  animation: slide-up 0.18s cubic-bezier(0.4,0,0.2,1);
}
*/
