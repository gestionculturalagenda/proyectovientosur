import React, { useState } from 'react';
import { ArrowLeft, Camera, ImageIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import ImageUpload from '../ui/ImageUpload';

interface EditProfileFormProps {
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel }) => {
  const { user, updateUser } = useAuthStore();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [coverImage, setCoverImage] = useState(user?.cover_image || '');
  const [disciplines, setDisciplines] = useState<string[]>(user?.disciplines || []);
  const [socialLinks, setSocialLinks] = useState<Array<{ name: string; url: string }>>(
    user?.social_links || []
  );
  const [newDiscipline, setNewDiscipline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return;
    try {
      const publicUrl = await uploadFile(file, 'avatars');
      setAvatar(publicUrl);
    } catch (error) {
      toast.error('Error al subir la imagen de perfil');
    }
  };

  const handleCoverImageChange = async (file: File | null) => {
    if (!file) return;
    try {
      const publicUrl = await uploadFile(file, 'covers');
      setCoverImage(publicUrl);
    } catch (error) {
      toast.error('Error al subir la imagen de portada');
    }
  };

  const handleAddDiscipline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscipline.trim()) return;
    setDisciplines([...disciplines, newDiscipline.trim()]);
    setNewDiscipline('');
  };

  const handleRemoveDiscipline = (index: number) => {
    setDisciplines(disciplines.filter((_, i) => i !== index));
  };

  const handleAddSocialLink = () => {
    setSocialLinks([...socialLinks, { name: '', url: '' }]);
  };

  const handleRemoveSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim() || !username.trim()) {
      toast.error('El nombre y nombre de usuario son requeridos');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre_completo: displayName,
          nombre_usuario: username,
          avatar_url: avatar,
          cover_image: coverImage,
          bio,
          website,
          disciplines,
          social_links: socialLinks
        })
        .eq('id', user?.id);

      if (error) throw error;

      await updateUser({
        ...user,
        displayName,
        username,
        avatar,
        cover_image: coverImage,
        bio,
        website,
        disciplines,
        social_links: socialLinks
      });

      toast.success('¡Perfil actualizado exitosamente!');
      onCancel();
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      {/* Form Header */}
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-bold ml-2 text-gray-900 dark:text-white">
          Editar Perfil
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover Image */}
        <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <ImageUpload
              onChange={handleCoverImageChange}
              className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
            />
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-12">
          <div className="relative">
            <div className="avatar h-24 w-24 ring-4 ring-white dark:ring-gray-900">
              <img 
                src={avatar} 
                alt={displayName} 
                className="avatar-img"
              />
            </div>
            <div className="absolute bottom-0 right-0 p-1 bg-white dark:bg-gray-900 rounded-full">
              <ImageUpload
                onChange={handleAvatarChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mt-6">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre completo*
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input w-full"
              required
            />
          </div>
          
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de usuario*
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                @
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input rounded-l-none flex-1"
                required
              />
            </div>
          </div>
          
          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Biografía
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input min-h-[100px] w-full"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>
          
          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sitio web
            </label>
            <input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="input w-full"
              placeholder="https://ejemplo.com"
            />
          </div>
          
          {/* Disciplines */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Disciplinas
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {disciplines.map((discipline, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center"
                >
                  {discipline}
                  <button
                    type="button"
                    onClick={() => handleRemoveDiscipline(index)}
                    className="ml-2 text-primary-500 hover:text-primary-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <form onSubmit={handleAddDiscipline} className="flex gap-2">
              <input
                type="text"
                value={newDiscipline}
                onChange={(e) => setNewDiscipline(e.target.value)}
                className="input flex-1"
                placeholder="Añadir disciplina..."
              />
              <button
                type="submit"
                disabled={!newDiscipline.trim()}
                className="btn btn-primary"
              >
                Añadir
              </button>
            </form>
          </div>
          
          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Redes sociales
            </label>
            <div className="space-y-2">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => updateSocialLink(index, 'name', e.target.value)}
                    className="input w-1/3"
                    placeholder="Red social"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                    className="input flex-1"
                    placeholder="URL"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="btn btn-ghost text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSocialLink}
                className="btn btn-ghost text-sm"
              >
                + Añadir red social
              </button>
            </div>
          </div>
        </div>
        
        {/* Submit */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-ghost px-4 py-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !displayName.trim() || !username.trim()}
            className="btn btn-primary px-4 py-2"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;