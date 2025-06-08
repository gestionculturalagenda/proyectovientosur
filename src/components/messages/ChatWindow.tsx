import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDirectMessages, Message } from '../../hooks/useDirectMessages';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import AudioRecorder from '../ui/AudioRecorder';
import { Mic, MoreVertical, Image as ImageIcon, Music, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ChatWindowProps {
  otherUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ otherUserId, otherUserName, otherUserAvatar }) => {
  const { user } = useAuthStore();
  const { messages, fetchMessages, sendMessage, loading } = useDirectMessages(user?.id || '');
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionMenuMsgId, setActionMenuMsgId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<{ [msgId: string]: string }>({});
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const audioRecorderRef = useRef<any>(null);
  const [isMicPressed, setIsMicPressed] = useState(false);

  // Variables para gestos
  const micStartPos = useRef<{ x: number; y: number } | null>(null);
  const [dragAction, setDragAction] = useState<'none' | 'left' | 'up'>('none');

  // Umbrales de gesto (ajustables)
  const DRAG_LEFT_THRESHOLD = 60; // px
  const DRAG_UP_THRESHOLD = 60; // px

  useEffect(() => {
    if (user?.id && otherUserId) fetchMessages(otherUserId);
  }, [user, otherUserId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !audioUrl) || loading) return;
    if (audioUrl) {
      await sendMessage(otherUserId, audioUrl); // solo dos argumentos
      setAudioUrl(null);
    } else {
      // Si hay replyTo, incluirlo en el mensaje (solo frontend, no persistente en BD)
      const msgContent = input.trim();
      let msg: any = { sender_id: user?.id, receiver_id: otherUserId, content: msgContent, created_at: new Date().toISOString(), read: false };
      if (replyTo) {
        msg.reply_to = { id: replyTo.id, content: replyTo.content };
      }
      await sendMessage(otherUserId, msgContent); // solo texto a la BD
      // Simular reply en frontend (agregar reply_to al último mensaje propio)
      setTimeout(() => {
        setReplyTo(null);
      }, 100);
    }
    setInput('');
  };

  const handleEmojiSelect = (emoji: any) => {
    setInput(input + (emoji.native || ''));
    setShowEmojiPicker(false);
  };

  const handleAudioReady = async (url: string | null) => {
    if (url) {
      await sendMessage(otherUserId, url); // Enviar la nota de voz automáticamente
      setAudioUrl(null);
      setInput('');
    }
    setShowAudioRecorder(false);
  };

  const handleFileSelect = (type: 'media' | 'music' | 'doc') => {
    if (type === 'media') fileInputRef.current?.click();
    if (type === 'music') musicInputRef.current?.click();
    if (type === 'doc') docInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'media' | 'music' | 'doc') => {
    const file = e.target.files?.[0];
    setShowOptions(false);
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const folder = type === 'media' ? 'chat-media' : type === 'music' ? 'chat-music' : 'chat-docs';
      const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('media').upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      await sendMessage(otherUserId, urlData.publicUrl);
      toast.success('Archivo enviado');
    } catch (err) {
      toast.error('Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (musicInputRef.current) musicInputRef.current.value = '';
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  // Handlers de gestos para micrófono
  const handleMicDown = (e: React.MouseEvent | React.TouchEvent) => {
    setShowAudioRecorder(true);
    setIsMicPressed(true);
    setDragAction('none');
    let clientX = 0, clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    micStartPos.current = { x: clientX, y: clientY };
    setTimeout(() => {
      audioRecorderRef.current?.startRecording();
    }, 50);
  };

  const handleMicMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isMicPressed || !micStartPos.current) return;
    let clientX = 0, clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const dx = clientX - micStartPos.current.x;
    const dy = clientY - micStartPos.current.y;
    if (dx < -DRAG_LEFT_THRESHOLD) {
      setDragAction('left');
    } else if (dy < -DRAG_UP_THRESHOLD) {
      setDragAction('up');
    } else {
      setDragAction('none');
    }
  };

  // Feedback visual del gesto (opcional, puedes personalizar)
  const renderMicGestureHint = () => {
    if (!isMicPressed) return null;
    if (dragAction === 'left') {
      return <span className="absolute left-0 bottom-14 text-xs bg-red-600 text-white px-2 py-1 rounded shadow animate-shake">Desliza a la izquierda para cancelar</span>;
    }
    if (dragAction === 'up') {
      return <span className="absolute right-0 bottom-14 text-xs bg-blue-600 text-white px-2 py-1 rounded shadow animate-bounce">Desliza hacia arriba para previsualizar</span>;
    }
    return <span className="absolute bottom-14 left-1/2 -translate-x-1/2 text-xs bg-gray-700 text-white px-2 py-1 rounded shadow">Suelta para enviar</span>;
  };

  const handleMicUp = () => {
    setIsMicPressed(false);
    if (dragAction === 'left') {
      audioRecorderRef.current?.cancelRecording();
    } else {
      // Siempre enviar automáticamente al soltar (sin previsualización)
      audioRecorderRef.current?.stopRecording();
    }
    setDragAction('none');
    micStartPos.current = null;
  };

  const handleMicLeaveOrCancel = () => {
    setIsMicPressed(false);
    audioRecorderRef.current?.cancelRecording();
    setDragAction('none');
    micStartPos.current = null;
  };

  // Handler para agregar reacción (solo frontend, demo)
  const handleAddReaction = (msgId: string, emoji: string) => {
    setReactions(prev => ({ ...prev, [msgId]: emoji }));
    setActionMenuMsgId(null);
  };

  // Handler para responder
  const handleReply = (msg: Message) => {
    setReplyTo(msg);
    setActionMenuMsgId(null);
  };

  // Handler para eliminar mensaje (solo si es propio)
  const handleDelete = async (msg: Message) => {
    if (msg.sender_id !== user?.id) return;
    await supabase.from('messages').delete().eq('id', msg.id);
    // Eliminar del frontend
    if (Array.isArray(messages)) {
      const idx = messages.findIndex(m => m.id === msg.id);
      if (idx !== -1) messages.splice(idx, 1);
    }
    setActionMenuMsgId(null);
  };

  return (
    <div className="flex flex-col h-full border rounded shadow bg-white max-w-full sm:max-w-md mx-auto w-full min-h-[80vh] sm:min-h-[500px] relative md:rounded-xl md:shadow-lg md:border md:bg-white">
      <div className="p-2 border-b font-semibold flex items-center gap-2 bg-white sticky top-0 z-10 min-h-[48px] sm:min-h-[56px] md:rounded-t-xl">
        {otherUserAvatar && (
          <img src={otherUserAvatar} alt={otherUserName || otherUserId} className="w-9 h-9 rounded-full object-cover" />
        )}
        <span className="truncate text-base sm:text-lg">Chat con {otherUserName || otherUserId}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 bg-gray-50 hide-scrollbar min-h-[60vh] max-h-[70vh] md:rounded-b-xl">
        {loading ? (
          <div>Cargando mensajes...</div>
        ) : (
          messages.map((msg: Message) => {
            // Detectar si el mensaje es un archivo adjunto (url de supabase)
            const isFile = msg.content && msg.content.startsWith('http');
            let filePreview = null;
            if (isFile) {
              const url = msg.content;
              if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                filePreview = <img src={url} alt="imagen adjunta" className="max-w-[180px] max-h-40 rounded mb-1" />;
              } else if (url.match(/\.(mp4|webm|mov)$/i)) {
                filePreview = <video src={url} controls className="max-w-[180px] max-h-40 rounded mb-1" />;
              } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
                filePreview = <audio src={url} controls className="w-full my-1" />;
              } else {
                filePreview = <a href={url} target="_blank" rel="noopener noreferrer" className="block text-blue-200 underline break-all mb-1">Documento adjunto</a>;
              }
            }
            const isOwn = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className="relative group">
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm shadow-md ${isOwn ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-700 text-white mr-auto'}`}
                  onContextMenu={e => { e.preventDefault(); setActionMenuMsgId(msg.id); }}
                  onClick={() => setActionMenuMsgId(msg.id)}
                  tabIndex={0}
                  aria-label="Acciones de mensaje"
                >
                  {/* Si es respuesta */}
                  {msg.reply_to && (
                    <div className="text-xs text-blue-200 mb-1 border-l-2 border-blue-300 pl-2 italic">Respondiendo a: {msg.reply_to.content?.slice(0, 40)}...</div>
                  )}
                  {isFile ? filePreview : msg.content}
                  {/* Reacciones visuales */}
                  {reactions[msg.id] && (
                    <div className="mt-1 flex items-center gap-1">
                      <span className="bg-white/80 text-black rounded-full px-2 py-0.5 text-base border border-gray-200">{reactions[msg.id]}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-gray-300 text-right mt-1">{new Date(msg.created_at).toLocaleTimeString()}</div>
                </div>
                {/* Menú contextual de acciones rápidas */}
                {actionMenuMsgId === msg.id && (
                  <div className="absolute -top-14 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2 flex space-x-2 z-30 border animate-fade-in">
                    <button onClick={() => handleAddReaction(msg.id, '👍')} className="p-1 rounded hover:bg-primary-100" title="Reaccionar">👍</button>
                    <button onClick={() => handleAddReaction(msg.id, '😂')} className="p-1 rounded hover:bg-primary-100" title="Reaccionar">😂</button>
                    <button onClick={() => handleAddReaction(msg.id, '❤️')} className="p-1 rounded hover:bg-primary-100" title="Reaccionar">❤️</button>
                    <button onClick={() => handleReply(msg)} className="p-1 rounded hover:bg-primary-100" title="Responder">↩️</button>
                    {isOwn && <button onClick={() => handleDelete(msg)} className="p-1 rounded hover:bg-red-100" title="Eliminar">🗑️</button>}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Campo de respuesta visual */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 bg-blue-50 rounded px-3 py-1">
          <span className="text-xs truncate">Respondiendo a: {replyTo.content?.slice(0, 40)}...</span>
          <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-red-500">✕</button>
        </div>
      )}
      {/* ...existing code para el formulario de envío... */}
      <form onSubmit={e => { handleSend(e); setReplyTo(null); }} className="p-2 border-t flex gap-2 items-center relative bg-white sticky bottom-0 z-20 md:rounded-b-xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={e => handleFileUpload(e, 'media')}
          disabled={uploading}
        />
        <input
          ref={musicInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={e => handleFileUpload(e, 'music')}
          disabled={uploading}
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          className="hidden"
          onChange={e => handleFileUpload(e, 'doc')}
          disabled={uploading}
        />
        <button
          type="button"
          className="p-2 rounded hover:bg-gray-100 text-xl"
          aria-label="Más opciones"
          onClick={() => setShowOptions(v => !v)}
          tabIndex={-1}
        >
          <MoreVertical className="w-5 h-5" />
        </button>
        {showOptions && (
          <div className="absolute bottom-12 left-0 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex flex-col gap-2 min-w-[180px] animate-fade-in">
            <button type="button" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleFileSelect('media')}>
              <ImageIcon className="w-5 h-5 text-blue-500" /> Foto/Video
            </button>
            <button type="button" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleFileSelect('music')}>
              <Music className="w-5 h-5 text-green-500" /> Música
            </button>
            <button type="button" className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleFileSelect('doc')}>
              <FileText className="w-5 h-5 text-yellow-500" /> Documento
            </button>
          </div>
        )}
        <button
          type="button"
          className="p-2 rounded hover:bg-gray-100 text-xl"
          aria-label="Emojis"
          onClick={() => setShowEmojiPicker(v => !v)}
          tabIndex={-1}
        >
          😊
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-12 left-12 z-50">
            <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" />
          </div>
        )}
        <input
          className="flex-1 border rounded px-3 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-400 text-base md:text-lg"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        {input.trim() ? (
          <button type="submit" className="bg-blue-700 text-white px-4 py-1 rounded hover:bg-blue-800 transition">Enviar</button>
        ) : (
          <div className="relative">
            <button
              type="button"
              className={`p-2 rounded hover:bg-gray-100 text-xl ${isMicPressed ? 'bg-red-100' : ''}`}
              aria-label="Grabar audio"
              onMouseDown={handleMicDown}
              onTouchStart={handleMicDown}
              onMouseMove={handleMicMove}
              onTouchMove={handleMicMove}
              onMouseUp={handleMicUp}
              onTouchEnd={handleMicUp}
              onMouseLeave={handleMicLeaveOrCancel}
              onTouchCancel={handleMicLeaveOrCancel}
              tabIndex={-1}
            >
              <Mic className="w-5 h-5" />
            </button>
            {renderMicGestureHint()}
          </div>
        )}
        {showAudioRecorder && (
          <div className="absolute bottom-14 right-0 z-50 w-[98vw] max-w-xs sm:max-w-sm md:max-w-md">
            <AudioRecorder ref={audioRecorderRef} onAudioReady={handleAudioReady} folder="chat-audio" />
          </div>
        )}
      </form>
    </div>
  );
};
