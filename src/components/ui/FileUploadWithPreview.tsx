import React, { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface FileUploadWithPreviewProps {
  onFileSelect: (fileUrl: string | null) => void;
  onCancel?: () => void;
  folder?: string; // Permite especificar carpeta en storage
}

const FileUploadWithPreview: React.FC<FileUploadWithPreviewProps> = ({ onFileSelect, onCancel, folder = 'media' }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
      setUploading(true);
      setProgress(0);
      // Subida automática a Supabase Storage
      try {
        const ext = selected.name.split('.').pop();
        const filePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        // Simulación de progreso
        for (let i = 1; i <= 90; i += 10) {
          await new Promise(res => setTimeout(res, 60));
          setProgress(i);
        }
        const { error } = await supabase.storage.from('media').upload(filePath, selected);
        setProgress(100);
        setUploading(false);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
        onFileSelect(urlData.publicUrl);
        toast.success('Archivo subido correctamente');
      } catch (err) {
        setUploading(false);
        setProgress(0);
        onFileSelect(null);
        toast.error('Error al subir archivo');
      }
    } else {
      setPreviewUrl(null);
      setUploading(false);
      setProgress(0);
      onFileSelect(null);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
    setUploading(false);
    onFileSelect(null);
    if (onCancel) onCancel();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        className="block"
        style={{ display: 'none' }}
      />
      <div className="flex gap-2 items-center">
        <button
          type="button"
          className="p-2 rounded-full bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Seleccionar archivo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586a6 6 0 108.485 8.485l6.586-6.586" /></svg>
        </button>
        {file && (
          <button type="button" onClick={handleCancel} className="btn btn-secondary btn-sm">Cancelar</button>
        )}
      </div>
      {previewUrl && (
        <img src={previewUrl} alt="preview" className="max-h-40 rounded" />
      )}
      {file && !previewUrl && (
        <div className="text-xs text-gray-500">Archivo seleccionado: {file.name}</div>
      )}
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
};

export default FileUploadWithPreview;
