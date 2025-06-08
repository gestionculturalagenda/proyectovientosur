import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface CreateBlogFormProps {
  onSuccess?: () => void;
}

const CATEGORIES = [
  'General',
  'Arte',
  'Música',
  'Cine',
  'Danza',
  'Literatura'
];

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [category, setCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Mejor experiencia: feedback visual, validaciones, manejo de errores
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMsg('');
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploadProgress(0);
    // Usar el mismo depósito de eventos culturales
    const fileName = `event-images/${Date.now()}_${file.name}`;
    // Simulación de progreso
    const fakeProgress = setInterval(() => {
      setUploadProgress((p) => {
        if (p >= 90) {
          clearInterval(fakeProgress);
          return p;
        }
        return p + 10;
      });
    }, 100);
    const { error } = await supabase.storage.from('event-images').upload(fileName, file, { upsert: true });
    clearInterval(fakeProgress);
    setUploadProgress(100);
    if (error) {
      setErrorMsg('Error al subir la imagen. Intenta con otro archivo.');
      toast.error('Error al subir la imagen');
      setPreviewUrl(null);
      setCoverImage('');
      return;
    }
    const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(fileName);
    setCoverImage(urlData.publicUrl);
    toast.success('Imagen subida correctamente');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!user) {
      setErrorMsg('Debes iniciar sesión para publicar un blog');
      toast.error('Debes iniciar sesión para publicar un blog');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setErrorMsg('El título y el contenido son obligatorios');
      toast.error('El título y el contenido son obligatorios');
      return;
    }
    setIsSubmitting(true);
    try {
      // Verificar si el usuario existe en la tabla usuarios
      const { data: existingUser, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .single();
      if (userError || !existingUser) {
        // Intentar crear el usuario con los datos mínimos
        await supabase.from('usuarios').insert([
          {
            id: user.id,
            email: user.email,
            nombre_usuario: user.username || user.email?.split('@')[0] || 'usuario',
            nombre_completo: user.displayName || user.username || user.email || 'Usuario'
          }
        ]);
      }
      const blogData = {
        titulo: title.trim(),
        contenido: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 120),
        imagen_portada: coverImage || null,
        categoria: category || null,
        tipo: 'blog',
        autor_id: user.id
      };
      const { error } = await supabase.from('publicaciones').insert([blogData]);
      if (error) {
        if (error.code === '23505' || (error.message && error.message.includes('unique_blog_title_per_author'))) {
          setErrorMsg('Ya existe un blog con este título. Cambia el título e inténtalo de nuevo.');
          toast.error('Ya existe un blog con este título.');
        } else if (error.code === '42501' || (error.message && error.message.toLowerCase().includes('row level security'))) {
          setErrorMsg('No tienes permisos para crear este blog.');
          toast.error('No tienes permisos para crear este blog.');
        } else if (error.message && error.message.toLowerCase().includes('null value')) {
          setErrorMsg('Faltan campos obligatorios. Revisa el formulario.');
          toast.error('Faltan campos obligatorios.');
        } else if (error.message && error.message.includes('foreign key constraint')) {
          setErrorMsg('Tu perfil no está correctamente registrado. Intenta cerrar sesión y volver a entrar.');
          toast.error('Tu perfil no está correctamente registrado.');
        } else {
          setErrorMsg(error.message || 'Error al publicar el blog');
          toast.error(error.message || 'Error al publicar el blog');
        }
        setIsSubmitting(false);
        return;
      }
      toast.success('¡Blog publicado exitosamente!');
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverImage('');
      setPreviewUrl(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg('Error al publicar el blog');
      toast.error('Error al publicar el blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
      <div>
        <label className="block font-medium">Título *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="input w-full"
          required
          maxLength={80}
          placeholder="Título atractivo para tu blog"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block font-medium">Resumen</label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          className="input w-full"
          rows={2}
          maxLength={120}
          placeholder="Breve resumen (máx. 120 caracteres)"
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block font-medium">Contenido *</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          className="input w-full"
          rows={8}
          required
          placeholder="Comparte tu historia, experiencia o reflexión..."
          disabled={isSubmitting}
        />
      </div>
      <div>
        <label className="block font-medium">Imagen de portada</label>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
        {previewUrl && (
          <div className="mt-2 relative rounded-lg overflow-hidden">
            <img src={previewUrl} alt="Previsualización" className="w-full max-h-48 object-cover rounded-lg border" />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-primary-100">
                <div className="h-2 bg-primary-600" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            <button type="button" onClick={() => { setPreviewUrl(null); setCoverImage(''); }} className="absolute top-2 right-2 bg-gray-900/70 text-white p-1 rounded-full">✕</button>
          </div>
        )}
        {errorMsg && <p className="text-red-500 text-sm mt-1">{errorMsg}</p>}
      </div>
      <div>
        <label className="block font-medium">Categoría</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="input w-full" disabled={isSubmitting}>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary flex items-center"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <span className="loader mr-2"></span>
        ) : null}
        {isSubmitting ? 'Publicando...' : 'Publicar blog'}
      </button>
    </form>
  );
};

export default CreateBlogForm;
