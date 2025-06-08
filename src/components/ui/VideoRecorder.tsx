import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface VideoRecorderProps {
  onVideoReady: (videoUrl: string | null) => void;
  folder?: string;
}

const VideoRecorder = forwardRef<any, VideoRecorderProps>(({ onVideoReady, folder = 'media' }, ref) => {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timer, setTimer] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunks = useRef<Blob[]>([]);
  const intervalId = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    setVideoUrl(null);
    setTimer(0);
    setProgress(0);
    setUploading(false);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    videoChunks.current = [];
    mediaRecorder.ondataavailable = (e) => {
      videoChunks.current.push(e.data);
    };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(videoChunks.current, { type: 'video/webm' });
      setUploading(true);
      setProgress(0);
      try {
        const filePath = `${folder}/video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webm`;
        for (let i = 1; i <= 90; i += 10) {
          await new Promise(res => setTimeout(res, 60));
          setProgress(i);
        }
        const { error } = await supabase.storage.from('media').upload(filePath, blob);
        setProgress(100);
        setUploading(false);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
        setVideoUrl(null); // Limpiar previsualización tras subir
        onVideoReady(urlData.publicUrl);
        toast.success('Video subido correctamente');
      } catch (err) {
        setUploading(false);
        setProgress(0);
        setVideoUrl(null);
        onVideoReady(null);
        toast.error('Error al subir video');
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
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
        const blob = new Blob(videoChunks.current, { type: 'video/webm' });
        setPreviewBlobUrl(URL.createObjectURL(blob));
        setShowCancelPrompt(true);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };
      mediaRecorderRef.current.stop();
    }
  };

  // Confirmar envío (sube el video)
  const confirmSend = async () => {
    setShowCancelPrompt(false);
    if (!previewBlobUrl) return;
    setUploading(true);
    setProgress(0);
    try {
      const blob = await fetch(previewBlobUrl).then(r => r.blob());
      const filePath = `${folder}/video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webm`;
      for (let i = 1; i <= 90; i += 10) {
        await new Promise(res => setTimeout(res, 60));
        setProgress(i);
      }
      const { error } = await supabase.storage.from('media').upload(filePath, blob);
      setProgress(100);
      setUploading(false);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
      setVideoUrl(null);
      setPreviewBlobUrl(null);
      onVideoReady(urlData.publicUrl);
      toast.success('Video subido correctamente');
    } catch (err) {
      setUploading(false);
      setProgress(0);
      setVideoUrl(null);
      setPreviewBlobUrl(null);
      onVideoReady(null);
      toast.error('Error al subir video');
    }
  };

  // Cancelar nota (no sube el video)
  const cancelAndDelete = () => {
    setShowCancelPrompt(false);
    setVideoUrl(null);
    setPreviewBlobUrl(null);
    setTimer(0);
    setProgress(0);
    setUploading(false);
    onVideoReady(null);
    if (intervalId.current) clearInterval(intervalId.current);
  };

  const cancelRecording = () => {
    setRecording(false);
    setVideoUrl(null);
    setPreviewBlobUrl(null);
    setTimer(0);
    setProgress(0);
    setUploading(false);
    onVideoReady(null);
    if (intervalId.current) clearInterval(intervalId.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  useImperativeHandle(ref, () => ({
    startRecording,
    stopRecording,
    cancelRecording,
    isRecording: () => recording,
    isUploading: () => uploading,
  }));

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        {!recording && !uploading && !showCancelPrompt && (
          <button type="button" onClick={startRecording} className="btn btn-primary btn-sm">Grabar video</button>
        )}
        {recording && !showCancelPrompt && (
          <button type="button" onClick={stopRecording} className="btn btn-danger btn-sm animate-pulse">Detener</button>
        )}
        {recording && !showCancelPrompt && (
          <span className="text-red-500 font-mono animate-pulse">{timer}s</span>
        )}
        {(videoUrl || recording || uploading) && !showCancelPrompt && (
          <button type="button" onClick={cancelRecording} className="btn btn-secondary btn-sm">Cancelar</button>
        )}
      </div>
      {showCancelPrompt && previewBlobUrl && (
        <div className="flex flex-col items-center gap-3 animate-fade-in bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400 animate-bounce">¡Revisa tu video!</span>
            <span className="text-base text-gray-700 dark:text-gray-200">¿Quieres enviarlo o descartarlo?</span>
          </div>
          <video src={previewBlobUrl} controls className="w-full my-2 rounded-lg shadow" style={{ maxHeight: 240 }} />
          <div className="flex gap-4 mt-2">
            <button type="button" onClick={confirmSend} className="btn btn-success btn-lg flex items-center gap-2 animate-bounce">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' /></svg>
              Enviar
            </button>
            <button type="button" onClick={cancelAndDelete} className="btn btn-danger btn-lg flex items-center gap-2 animate-shake">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
              Descartar
            </button>
          </div>
          <button type="button" onClick={startRecording} className="btn btn-primary btn-xs mt-2 animate-fade-in">Regrabar</button>
        </div>
      )}
      {videoUrl && !recording && !uploading && !showCancelPrompt && (
        <div className="space-y-1 relative group">
          <video src={videoUrl} controls className="w-full rounded-lg" style={{ maxHeight: 240 }} />
          <div className="flex gap-2 mt-2">
            <button type="button" onClick={() => {
              setVideoUrl(null);
              setPreviewBlobUrl && setPreviewBlobUrl(null);
              onVideoReady(null);
              toast('Nota de video eliminada');
            }} className="btn btn-danger btn-xs flex items-center gap-1 animate-shake">
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
              Descartar
            </button>
            <button type="button" onClick={startRecording} className="btn btn-primary btn-xs">Regrabar</button>
          </div>
        </div>
      )}
      <video ref={videoRef} className="w-full rounded-lg" autoPlay muted playsInline style={{ display: recording ? 'block' : 'none', maxHeight: 240 }} />
      {uploading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-primary-500 h-2 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
});

export default VideoRecorder;
