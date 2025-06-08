import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface AudioRecorderProps {
  onAudioReady: (audioUrl: string | null) => void;
  folder?: string;
}

const AudioRecorder = forwardRef<any, AudioRecorderProps>(({ onAudioReady, folder = 'media' }, ref) => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    setAudioUrl(null);
    setTimer(0);
    setProgress(0);
    setUploading(false);
    setPendingBlob(null);
    if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
      setPendingBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      // Siempre enviar automáticamente
      confirmSend();
    };
    mediaRecorder.start();
    setRecording(true);
    intervalId.current = setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      setRecording(false);
      if (intervalId.current) clearInterval(intervalId.current);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setPendingBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Siempre enviar automáticamente
        confirmSend();
      };
      mediaRecorderRef.current.stop();
    }
  };

  // Confirmar envío (sube el audio)
  const confirmSend = async () => {
    if (!pendingBlob) return;
    setUploading(true);
    setProgress(0);
    try {
      const filePath = `${folder}/audio_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webm`;
      for (let i = 1; i <= 90; i += 10) {
        await new Promise(res => setTimeout(res, 60));
        setProgress(i);
      }
      const { error } = await supabase.storage.from('media').upload(filePath, pendingBlob);
      setProgress(100);
      setUploading(false);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      setAudioUrl(null);
      setPendingBlob(null);
      // Publicar el audio: notificar al padre (CreatePostForm) que el audio está listo
      onAudioReady(urlData.publicUrl);
    } catch (err) {
      setUploading(false);
      setProgress(0);
      setAudioUrl(null);
      setPendingBlob(null);
      onAudioReady(null);
      toast.error('Error al subir audio');
    }
  };

  const cancelRecording = () => {
    setRecording(false);
    setAudioUrl(null);
    setTimer(0);
    setProgress(0);
    setUploading(false);
    onAudioReady(null);
    if (intervalId.current) clearInterval(intervalId.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // 6. Soporte para pausar/reanudar (experimental)
  const pauseRecording = () => {
    if (mediaRecorderRef.current && recording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };
  const resumeRecording = () => {
    if (mediaRecorderRef.current && recording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: () => recording,
    isUploading: () => uploading,
    // Elimina la función showPreview para que nunca se muestre la previsualización
  }));

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        {recording && (
          <>
            <button type="button" onClick={stopRecording} className="btn btn-danger btn-sm animate-pulse">Detener</button>
            <button type="button" onClick={pauseRecording} disabled={isPaused} className="btn btn-warning btn-xs ml-2">Pausar</button>
            <button type="button" onClick={resumeRecording} disabled={!isPaused} className="btn btn-success btn-xs ml-2">Reanudar</button>
          </>
        )}
        {recording && (
          <span className="text-red-500 font-mono animate-pulse">{timer}s</span>
        )}
        {(recording || uploading) && (
          <button type="button" onClick={cancelRecording} className="btn btn-secondary btn-sm">Cancelar</button>
        )}
      </div>
      {uploading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-primary-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {/* Elimina la previsualización: no mostrar audioUrl ni controles de regrabar/eliminar */}
    </div>
  );
});

export default AudioRecorder;
