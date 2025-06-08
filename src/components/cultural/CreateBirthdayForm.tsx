import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import EmojiPicker from '../ui/EmojiPicker';

interface User {
  id: string;
  nombre_completo: string;
  nombre_usuario: string;
  avatar_url?: string;
}

interface CreateBirthdayFormProps {
  onSuccess: (cumpleActualizado: any) => void;
  onCancel: () => void;
  initialData?: any;
}

const CreateBirthdayForm: React.FC<CreateBirthdayFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState<User | null>(null);
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);

  // Si initialData existe, inicializar los estados con sus valores
  React.useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Buscar datos extendidos del usuario en la tabla usuarios
        const { data: usuarioDb } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', user.id)
          .single();
        setUsuario(usuarioDb || { id: user.id, nombre_completo: user.user_metadata?.nombre_completo || '', nombre_usuario: user.user_metadata?.nombre_usuario || '' });
      }
    }
    if (!initialData) {
      fetchUser();
    } else {
      setNombre(initialData.nombre || '');
      setUsuario(initialData.usuario || null);
      setFechaNacimiento(initialData.fecha_nacimiento || '');
      setMensaje(initialData.mensaje || '');
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagen(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.id) {
      toast.error('No se detectó el usuario autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }
    setIsSubmitting(true);
    let imagen_url = '';
    try {
      if (imagen) {
        const fileName = `cumpleanos/${Date.now()}_${imagen.name}`;
        const { error: uploadError } = await supabase.storage
          .from('cumpleanos-media')
          .upload(fileName, imagen, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('cumpleanos-media')
          .getPublicUrl(fileName);
        imagen_url = urlData.publicUrl;
      }
      // Crear o actualizar cumpleaños
      let cumpleData;
      if (initialData && initialData.id) {
        // Actualizar
        const { data, error } = await supabase.from('cumpleanos').update({
          nombre,
          usuario_id: usuario?.id || null,
          fecha_nacimiento: fechaNacimiento,
          mensaje,
          imagen_url: imagen_url || initialData.imagen_url,
        }).eq('id', initialData.id).select().single();
        if (error) throw error;
        cumpleData = data;
      } else {
        // Crear
        const { data, error } = await supabase.from('cumpleanos').insert({
          nombre,
          usuario_id: usuario?.id || null,
          fecha_nacimiento: fechaNacimiento,
          mensaje,
          imagen_url,
        }).select().single();
        if (error) throw error;
        cumpleData = data;
        // Crear evento en la agenda
        await supabase.from('eventos').insert({
          titulo: `Cumpleaños de ${nombre}`,
          descripcion: mensaje,
          tipo: 'birthday',
          fecha_inicio: fechaNacimiento,
          creador_id: usuario?.id || null,
          imagen_url: imagen_url || null
        });
      }
      toast.success(initialData && initialData.id ? 'Cumpleaños actualizado' : 'Cumpleaños creado exitosamente');
      onSuccess(cumpleData);
    } catch (err: any) {
      toast.error('Error al crear/actualizar cumpleaños: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl max-w-lg mx-auto border border-gray-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold text-center text-primary-700 dark:text-primary-300 mb-6 flex items-center justify-center gap-2">
        🎉 Crear Cumpleaños
      </h2>
      <div className="flex flex-col items-center gap-2">
        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">Imagen</label>
        <div className="relative w-28 h-28 mb-2">
          <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" />
          <div className="w-28 h-28 rounded-full border-4 border-primary-300 dark:border-primary-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow">
            {imagen ? (
              <img src={URL.createObjectURL(imagen)} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-4xl">+</span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400">Haz clic para subir una imagen</span>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">Nombre de usuario</label>
        <input
          type="text"
          className="input w-full rounded-lg border-2 border-primary-200 dark:border-primary-700 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 dark:bg-gray-800 dark:text-white transition"
          value={usuario?.nombre_usuario || ''}
          onChange={e => setUsuario(usuario ? { ...usuario, nombre_usuario: e.target.value } : { id: '', nombre_completo: '', nombre_usuario: e.target.value })}
          placeholder="usuario123"
          required
        />
        {usuario?.nombre_usuario && (
          <a
            href={`/profile/${usuario.nombre_usuario}`}
            className="block mt-1 text-primary-600 dark:text-primary-400 hover:underline text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver perfil de @{usuario.nombre_usuario}
          </a>
        )}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">Nombre</label>
        <input
          type="text"
          className="input w-full rounded-lg border-2 border-primary-200 dark:border-primary-700 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 dark:bg-gray-800 dark:text-white transition"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">Fecha de nacimiento</label>
        <input
          type="date"
          className="input w-full rounded-lg border-2 border-primary-200 dark:border-primary-700 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 dark:bg-gray-800 dark:text-white transition"
          value={fechaNacimiento}
          onChange={e => setFechaNacimiento(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-200">Mensaje de felicitación</label>
        <div className="relative bg-primary-50 dark:bg-primary-900/30 rounded-xl p-3 border border-primary-100 dark:border-primary-800 flex flex-col gap-2">
          <textarea
            className="input w-full rounded-lg border-2 border-primary-200 dark:border-primary-700 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 dark:bg-gray-800 dark:text-white transition resize-none min-h-[80px]"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={3}
            placeholder="¡Feliz cumpleaños! Que tengas un día increíble."
            required
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full p-2 shadow hover:bg-primary-200 dark:hover:bg-primary-700 transition"
              onClick={() => setShowEmojis((v) => !v)}
              aria-label="Insertar emoji"
            >
              <span role="img" aria-label="emoji">😊</span>
            </button>
            <label className="bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-300 rounded-full p-2 shadow hover:bg-primary-200 dark:hover:bg-primary-700 transition cursor-pointer flex items-center" aria-label="Adjuntar archivo">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l7.07-7.07a4 4 0 00-5.656-5.657l-7.07 7.07a6 6 0 108.485 8.485l6.364-6.364" /></svg>
              <input type="file" className="hidden" onChange={() => { /* Aquí puedes manejar el adjunto */ }} />
            </label>
          </div>
          {showEmojis && (
            <div className="absolute right-0 top-14 z-20">
              <EmojiPicker onSelect={emoji => {
                setMensaje(mensaje + emoji);
                setShowEmojis(false);
              }} />
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4 justify-end mt-6">
        <button type="button" className="btn btn-ghost px-6 py-2 rounded-full" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary px-6 py-2 rounded-full shadow-lg" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear cumpleaños'}
        </button>
      </div>
    </form>
  );
};

export default CreateBirthdayForm;
