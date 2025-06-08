import React, { useState } from 'react';
import { toast } from 'sonner';
import { ImageUpload } from '../ui/ImageUpload';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { Image as ImageIcon } from 'lucide-react';

interface AddGalleryItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddGalleryItemForm: React.FC<AddGalleryItemFormProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (file: File | null) => {
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
    } catch (error) {
      toast.error('Error al subir la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !location.trim() || !date || !imageUrl || !user) {
      toast.error('Por favor, completa todos los campos');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('gallery')
        .insert([
          {
            user_id: user.id,
            title,
            description,
            location,
            date,
            image_url: imageUrl
          }
        ]);

      if (error) throw error;

      toast.success('¡Exposición añadida exitosamente!');
      onSuccess();
    } catch (error) {
      toast.error('Error al añadir la exposición');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Añadir exposición
        </h2>
        <button 
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Imagen*
          </label>
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ImageIcon className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageUpload
                onChange={handleImageChange}
                className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
              />
              {imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título*
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción*
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input w-full min-h-[100px]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación*
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha*
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input w-full"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !description.trim() || !location.trim() || !date || !imageUrl}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};
