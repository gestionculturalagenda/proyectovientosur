import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import AudioRecorder from '../components/ui/AudioRecorder';
import VideoRecorder from '../components/ui/VideoRecorder';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { Mic, Camera, Smile, Clipboard, Trash2, Reply } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  file_url?: string;
  audio_url?: string;
  video_url?: string;
  sticker_url?: string;
  read?: boolean;
  reply_to?: {
    id: string;
    content: string;
  } | null;
}

// NUEVO: Añadir soporte para grupos en la interfaz de conversaciones y mensajes
// 1. Modificar la interfaz Conversation para soportar grupos
interface Conversation {
  user_id?: string; // para 1 a 1
  group_id?: string; // para grupos
  username?: string; // para 1 a 1
  group_name?: string; // para grupos
  avatar_url?: string; // para 1 a 1
  group_avatar_url?: string; // para grupos
  last_message: string;
  last_time: string;
  unread_count: number;
  is_group?: boolean;
  group_members?: Array<{ id: string; nombre_usuario: string; avatar_url: string }>;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const receiverId = searchParams.get('to');
  const groupId = searchParams.get('group');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [sticker, setSticker] = useState<string | null>(null);
  const [reactionMenuMsgId, setReactionMenuMsgId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<{ [msgId: string]: string }>({});
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [messagesLimit, setMessagesLimit] = useState(30);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const isMobile = window.innerWidth < 768;

  // --- 
  // NUEVO: Consulta real de grupos y miembros desde Supabase
  // Cache global de usuarios para evitar consultas repetidas
  const userCacheRef = React.useRef<{ [key: string]: { nombre_usuario: string; avatar_url: string } }>({});

  const fetchConversations = async () => {
    if (!user) return;
    setConvLoading(true);
    // 1. Mensajes 1 a 1
    const { data: allMsgs } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    // 2. Grupos donde el usuario es miembro
    const { data: groupMembers } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', user.id);
    const groupIds = groupMembers?.map(gm => gm.group_id) || [];
    let groups: any[] = [];
    if (groupIds.length > 0) {
      const { data: groupData } = await supabase
        .from('groups')
        .select('id, name, avatar_url')
        .in('id', groupIds);
      groups = groupData || [];
    }
    // 3. Obtener miembros de cada grupo (máximo 10 por grupo para UI)
    let groupMembersMap: Record<string, any[]> = {};
    if (groupIds.length > 0) {
      const { data: allGroupMembers } = await supabase
        .from('group_members')
        .select('group_id, user_id, usuarios(nombre_usuario, avatar_url)')
        .in('group_id', groupIds);
      if (allGroupMembers) {
        for (const gm of allGroupMembers) {
          if (!groupMembersMap[gm.group_id]) groupMembersMap[gm.group_id] = [];
          groupMembersMap[gm.group_id].push({
            id: gm.user_id,
            nombre_usuario: gm.usuarios?.nombre_usuario || 'Usuario',
            avatar_url: gm.usuarios?.avatar_url || '/default-avatar.png',
          });
        }
      }
    }
    // 4. IDs únicos de usuarios involucrados en 1 a 1
    const userIds = Array.from(new Set(allMsgs?.map(msg => (msg.sender_id === user.id ? msg.receiver_id : msg.sender_id))));
    const uncachedIds = userIds.filter(id => !userCacheRef.current[id]);
    if (uncachedIds.length > 0) {
      const { data: users } = await supabase
        .from('usuarios')
        .select('id, nombre_usuario, avatar_url')
        .in('id', uncachedIds);
      if (users) {
        users.forEach(u => {
          userCacheRef.current[u.id] = { nombre_usuario: u.nombre_usuario, avatar_url: u.avatar_url };
        });
      }
    }
    // 5. Construir el mapa de conversaciones 1 a 1
    const userMap: { [key: string]: Conversation } = {};
    for (const msg of allMsgs || []) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!userMap[otherId]) {
        const userData = userCacheRef.current[otherId] || {};
        userMap[otherId] = {
          user_id: otherId,
          username: userData.nombre_usuario || 'Usuario',
          avatar_url: userData.avatar_url || '/default-avatar.png',
          last_message: msg.content,
          last_time: msg.created_at,
          unread_count: 0,
          is_group: false
        };
      }
      if (new Date(msg.created_at) > new Date(userMap[otherId].last_time)) {
        userMap[otherId].last_message = msg.content;
        userMap[otherId].last_time = msg.created_at;
      }
      if (msg.receiver_id === user.id && !msg.read) {
        userMap[otherId].unread_count += 1;
      }
    }
    // 6. Construir el array de conversaciones de grupo
    const groupConvs: Conversation[] = groups.map(g => {
      // Buscar el último mensaje del grupo
      const groupMsgs = allMsgs?.filter(m => m.group_id === g.id) || [];
      const lastMsg = groupMsgs.length > 0 ? groupMsgs[groupMsgs.length - 1] : null;
      return {
        group_id: g.id,
        group_name: g.name,
        group_avatar_url: g.avatar_url || '/default-group.png',
        last_message: lastMsg ? lastMsg.content : 'Sin mensajes',
        last_time: lastMsg ? lastMsg.created_at : '',
        unread_count: groupMsgs.filter(m => !m.read && m.receiver_id === user.id).length,
        is_group: true,
        group_members: (groupMembersMap[g.id] || []).slice(0, 10),
      };
    });
    // 7. Unir y ordenar todas las conversaciones
    const convArr = [
      ...Object.values(userMap),
      ...groupConvs
    ].sort((a, b) => new Date(b.last_time).getTime() - new Date(a.last_time).getTime());
    setConversations(convArr);
    setConvLoading(false);
  };

  // --- 
  // 2. useEffect para cargar conversaciones recientes y suscribirse a cambios en tiempo real
  useEffect(() => {
    fetchConversations();
    // Suscripción realtime para conversaciones
    if (!user) return;
    const channel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(sender_id.eq.${user.id},receiver_id.eq.${user.id})`
      }, () => {
        fetchConversations();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, messages]);

  // Cargar mensajes entre el usuario actual y el receptor
  useEffect(() => {
    if (!user || (!receiverId && !groupId)) return;
    setLoading(true);
    const fetchMessages = async () => {
      let query = supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(messagesLimit);
      if (groupId) {
        query = query.eq('group_id', groupId);
      } else {
        query = query.or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`);
      }
      const { data } = await query;
      setMessages(data || []);
      setLoading(false);
      setHasMoreMessages((data?.length || 0) === messagesLimit);
      // Marcar como leídos (solo para 1 a 1)
      if (!groupId) {
        await supabase.from('messages')
          .update({ read: true })
          .eq('receiver_id', user.id)
          .eq('sender_id', receiverId)
          .eq('read', false);
      }
    };
    fetchMessages();
  }, [user, receiverId, groupId, messagesLimit]);

  // Suscripción en tiempo real para nuevos mensajes
  useEffect(() => {
    if (!user || (!receiverId && !groupId)) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or(and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id}),and(group_id.eq.${groupId}))`
      }, (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, receiverId, groupId]);

  // Enviar mensaje mejorado
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!receiverId && !groupId) || (!newMessage.trim() && !selectedFile && !audioUrl && !videoUrl && !sticker)) return;
    let content = newMessage.trim();
    let file_url = null;
    let audio_url = null;
    let video_url = null;
    let sticker_url = null;
    // Subir archivo si existe
    if (selectedFile) {
      const { data, error } = await supabase.storage.from('chat-files').upload(`messages/${Date.now()}_${selectedFile.name}`, selectedFile);
      if (!error && data) file_url = data.path;
    }
    if (audioUrl) {
      audio_url = audioUrl;
    }
    if (videoUrl) {
      video_url = videoUrl;
    }
    if (sticker) {
      sticker_url = sticker;
    }
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      file_url,
      audio_url,
      video_url,
      sticker_url,
      read: false,
      reply_to: replyTo ? { id: replyTo.id, content: replyTo.content } : null,
      group_id: groupId, // NUEVO: Incluir group_id si es un chat grupal
    });
    setNewMessage('');
    setSelectedFile(null);
    setAudioUrl(null);
    setVideoUrl(null);
    setSticker(null);
    setReplyTo(null);
    // Recargar mensajes
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id}),and(group_id.eq.${groupId})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  // Handler para agregar reacción a un mensaje
  const handleAddReaction = (msgId: string, emoji: string) => {
    setReactions(prev => ({ ...prev, [msgId]: emoji }));
    setReactionMenuMsgId(null);
    // Aquí podrías guardar la reacción en la base de datos si lo deseas
  };

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Agrupar mensajes por día y usuario consecutivo
  function groupMessages(msgs: Message[]) {
    const groups: any[] = [];
    let lastDate = '';
    let lastSender = '';
    let currentGroup: any = null;
    msgs.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString();
      if (date !== lastDate || msg.sender_id !== lastSender) {
        currentGroup = { date, sender_id: msg.sender_id, messages: [msg] };
        groups.push(currentGroup);
        lastDate = date;
        lastSender = msg.sender_id;
      } else {
        currentGroup.messages.push(msg);
      }
    });
    return groups;
  }

  // Acción copiar
  const handleCopy = (msg: Message) => {
    if (!msg.content) return;
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopiedMsgId(msg.id);
      setTimeout(() => setCopiedMsgId(null), 1200);
    });
  };
  // Acción eliminar
  const handleDelete = async (msg: Message) => {
    if (!user || msg.sender_id !== user.id) return;
    await supabase.from('messages').delete().eq('id', msg.id);
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
  };
  // Acción responder
  const handleReply = (msg: Message) => {
    setReplyTo(msg);
  };

  // Handler para cargar más mensajes (paginación)
  function handleLoadMoreMessages() {
    setMessagesLimit((prev) => prev + 30);
  }

  useEffect(() => {
    // Si cambia la conversación seleccionada en móvil, mostrar el chat
    if (isMobile && (receiverId || groupId)) setShowChat(true);
    if (isMobile && !receiverId && !groupId) setShowChat(false);
  }, [receiverId, groupId]);

  if (!user) {
    return <div className="p-4">Inicia sesión para ver tus mensajes.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 flex gap-8 md:flex-row flex-col">
      {/* Lista de conversaciones */}
      <div className={`md:w-1/3 border-r pr-4 md:block ${isMobile && showChat ? 'hidden' : 'block'} bg-white dark:bg-gray-900`}> 
        <h3 className="font-bold mb-4">Conversaciones</h3>
        {convLoading ? <div>Cargando...</div> : (
          <ul className="space-y-2">
            {conversations.map(conv => (
              <li key={conv.group_id || conv.user_id}>
                <Link
                  to={conv.is_group ? `?group=${conv.group_id}` : `?to=${conv.user_id}`}
                  className={`flex items-center gap-3 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 ${receiverId === conv.user_id || groupId === conv.group_id ? 'bg-primary-100 dark:bg-gray-900' : ''}`}
                  onClick={() => { if (isMobile) setShowChat(true); }}
                >
                  {conv.is_group ? (
                    <>
                      <img src={conv.group_avatar_url || '/default-group.png'} alt={conv.group_name} className="w-10 h-10 rounded-full" />
                      <div className="flex -space-x-2">
                        {conv.group_members?.slice(0, 3).map(m => (
                          <img key={m.id} src={m.avatar_url} alt={m.nombre_usuario} className="w-6 h-6 rounded-full border-2 border-white -ml-2" />
                        ))}
                        {conv.group_members && conv.group_members.length > 3 && (
                          <span className="w-6 h-6 rounded-full bg-gray-300 text-xs flex items-center justify-center border-2 border-white -ml-2">+{conv.group_members.length - 3}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{conv.group_name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">{conv.last_message}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img src={conv.avatar_url} alt={conv.username} className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="font-medium">@{conv.username}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[180px]">{conv.last_message}</div>
                      </div>
                    </>
                  )}
                </Link>
              </li>
            ))}
            {conversations.length === 0 && <li className="text-gray-400">No hay conversaciones.</li>}
          </ul>
        )}
      </div>
      {/* Chat actual */}
      <div className={`flex-1 ${isMobile && !showChat ? 'hidden' : 'block'}`}> 
        {(receiverId || groupId) ? (
          <>
            {/* Botón volver en móvil */}
            {isMobile && (
              <button onClick={() => { window.history.replaceState(null, '', '/messages'); setShowChat(false); }} className="mb-2 btn btn-secondary btn-sm">← Volver</button>
            )}
            {/* Cabecera del chat */}
            <div className="flex items-center gap-3 mb-2 p-2 bg-white dark:bg-gray-900 rounded-t-lg shadow-sm sticky top-0 z-10">
              {/* Avatar y nombre del receptor */}
              {conversations.find(c => c.user_id === receiverId || c.group_id === groupId) && (
                <>
                  {groupId ? (
                    <>
                      <img src={conversations.find(c => c.group_id === groupId)?.group_avatar_url || '/default-group.png'} alt="avatar" className="h-10 w-10 rounded-full" />
                      <div>
                        <div className="font-semibold">{conversations.find(c => c.group_id === groupId)?.group_name}</div>
                        <div className="text-xs text-gray-400">En línea</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <img src={conversations.find(c => c.user_id === receiverId)?.avatar_url || '/default-avatar.png'} alt="avatar" className="h-10 w-10 rounded-full" />
                      <div>
                        <div className="font-semibold">@{conversations.find(c => c.user_id === receiverId)?.username}</div>
                        <div className="text-xs text-gray-400">En línea</div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-b-lg p-4 h-[70vh] overflow-y-auto mb-4 flex flex-col gap-2">
              {loading ? (
                <div>Cargando...</div>
              ) : (
                groupMessages(messages).map((group, i) => (
                  <div key={i} className="mb-2">
                    {/* Fecha separadora */}
                    {(i === 0 || group.date !== groupMessages(messages)[i-1]?.date) && (
                      <div className="text-center text-xs text-gray-400 my-2">{group.date}</div>
                    )}
                    <div className={`flex ${group.sender_id === user.id ? 'justify-end' : 'justify-start'} gap-2`}>
                      {/* Avatar solo en el primer mensaje del grupo recibido */}
                      {group.sender_id !== user.id && (
                        <img src={conversations.find(c => c.user_id === group.sender_id)?.avatar_url || '/default-avatar.png'} alt="avatar" className="h-8 w-8 rounded-full self-end" />
                      )}
                      <div className="flex flex-col gap-1">
                        {group.messages.map((msg: Message, idx: number) => {
                          const isOwn = user && msg.sender_id === user.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.15 }}
                              className={`relative group max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow ${isOwn ? 'bg-primary-600 text-white self-end rounded-br-none' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'} ${idx === 0 ? '' : 'mt-0.5'}`}
                              onContextMenu={e => { e.preventDefault(); setReactionMenuMsgId(msg.id); }}
                              onClick={() => setReactionMenuMsgId(msg.id)}
                              tabIndex={0}
                              aria-label="Reaccionar al mensaje"
                            >
                              {/* Si es respuesta */}
                              {msg.reply_to && (
                                <div className="text-xs text-primary-400 mb-1 border-l-2 border-primary-300 pl-2 italic">Respondiendo a: {msg.reply_to.content?.slice(0, 40)}...</div>
                              )}
                              {msg.content && <span>{msg.content}</span>}
                              {msg.file_url && <a href={supabase.storage.from('chat-files').getPublicUrl(msg.file_url).publicURL} target="_blank" rel="noopener noreferrer" className="block text-blue-500">Archivo adjunto</a>}
                              {msg.audio_url && <audio controls src={msg.audio_url} className="mt-2" />}
                              {msg.video_url && <video controls src={msg.video_url} className="mt-2 max-w-xs" />}
                              {msg.sticker_url && <img src={msg.sticker_url} alt="sticker" className="h-12 mt-2" />}
                              {/* Acciones rápidas */}
                              <AnimatePresence>
                                {reactionMenuMsgId === msg.id && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute -top-16 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2 flex space-x-2 z-30 border"
                                  >
                                    <button onClick={() => handleReply(msg)} className="p-1 rounded hover:bg-primary-100" title="Responder"><Reply className="h-4 w-4" /></button>
                                    <button onClick={() => handleCopy(msg)} className="p-1 rounded hover:bg-primary-100" title="Copiar"><Clipboard className="h-4 w-4" /></button>
                                    {isOwn && <button onClick={() => handleDelete(msg)} className="p-1 rounded hover:bg-red-100" title="Eliminar"><Trash2 className="h-4 w-4 text-red-500" /></button>}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                              {/* Feedback de copiado */}
                              {copiedMsgId === msg.id && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -top-8 right-0 bg-primary-600 text-white text-xs px-2 py-1 rounded shadow">¡Copiado!</motion.div>
                              )}
                              {/* Visualización de reacciones (múltiples, conteo) */}
                              {reactions[msg.id] && (
                                <div className="flex space-x-1 mt-2">
                                  <span className="bg-white/80 dark:bg-gray-700/80 rounded-full px-2 py-0.5 text-sm flex items-center border border-gray-200 dark:border-gray-700">
                                    {reactions[msg.id]} <span className="ml-1 text-xs">1</span>
                                  </span>
                                </div>
                              )}
                              <div className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {/* PAGINACIÓN DE MENSAJES */}
              {hasMoreMessages && (
                <div className="flex justify-center mb-2">
                  <button onClick={handleLoadMoreMessages} className="btn btn-secondary btn-xs">Cargar más mensajes</button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Campo de respuesta visual */}
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 bg-primary-50 dark:bg-primary-900/30 rounded px-3 py-1">
                <Reply className="h-4 w-4 text-primary-500" />
                <span className="text-xs truncate">Respondiendo a: {replyTo.content?.slice(0, 40)}...</span>
                <button onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-red-500">✕</button>
              </div>
            )}
            {/* Formulario de envío mejorado */}
            <form onSubmit={e => { handleSend(e); setReplyTo(null); }} className="flex flex-col gap-2">
              <div className="flex gap-2 items-center relative">
                {/* Solo emoji y microfono visibles, el resto en modal */}
                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="btn btn-ghost p-2" aria-label="Emojis">
                  <Smile className="w-5 h-5" />
                </button>
                {showEmojiPicker && (
                  <div className="absolute z-50 bottom-12 left-0 emoji-picker">
                    <Picker data={data} onEmojiSelect={(emoji: any) => {
                      setNewMessage(prev => prev + (emoji.native || ''));
                      setShowEmojiPicker(false);
                    }} theme="light" />
                  </div>
                )}
                <input
                  className="input flex-1"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  onFocus={() => setShowActionsModal(false)}
                />
                {/* Si hay texto, mostrar botón enviar, si no, microfono */}
                {newMessage.trim() ? (
                  <button type="submit" className="btn btn-primary p-2 ml-1" aria-label="Enviar">
                    Enviar
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost p-2 ml-1" aria-label="Grabar audio" onClick={() => setShowAudioRecorder(v => !v)}>
                    <Mic className="w-5 h-5" />
                  </button>
                )}
                {/* Botón para abrir modal de acciones extra */}
                <button type="button" className="btn btn-ghost p-2 ml-1" aria-label="Más acciones" onClick={() => setShowActionsModal(true)}>
                  ⋮
                </button>
              </div>
              {/* Modal de acciones extra */}
              {showActionsModal && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowActionsModal(false)}>
                  <div className="bg-white dark:bg-gray-900 rounded-t-2xl p-4 w-full max-w-md mx-auto flex flex-col gap-3 animate-fadeInUp" onClick={e => e.stopPropagation()}>
                    <label htmlFor="file-input" className="btn btn-ghost w-full" aria-label="Adjuntar archivo">📎 Adjuntar archivo</label>
                    <button type="button" className="btn btn-ghost w-full" aria-label="Grabar video" onClick={() => { setShowVideoRecorder(v => !v); setShowActionsModal(false); }}>
                      <Camera className="w-5 h-5 mr-2" /> Grabar video
                    </button>
                    <button type="button" className="btn btn-ghost w-full" onClick={() => { setSticker('/stickers/like.png'); setShowActionsModal(false); }} aria-label="Sticker like">👍 Enviar sticker</button>
                    <button type="button" className="btn btn-ghost w-full" onClick={() => { setSticker('/stickers/love.png'); setShowActionsModal(false); }} aria-label="Sticker love">❤️ Enviar sticker</button>
                    <button type="button" className="btn btn-secondary w-full mt-2" onClick={() => setShowActionsModal(false)}>Cerrar</button>
                  </div>
                </div>
              )}
              {showAudioRecorder && (
                <AudioRecorder onAudioReady={(url: string | null) => { setAudioUrl(url); setShowAudioRecorder(false); }} />
              )}
              {showVideoRecorder && (
                <VideoRecorder onVideoReady={(url: string | null) => { setVideoUrl(url); setShowVideoRecorder(false); }} />
              )}
            </form>
          </>
        ) : (
          <div className="p-8 text-gray-400 text-center">Selecciona una conversación para comenzar a chatear.</div>
        )}
      </div>
    </div>
  );
}