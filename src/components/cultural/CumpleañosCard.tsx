import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Cake, Mail, Phone, MoreHorizontal } from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import CreateBirthdayForm from './CreateBirthdayForm';



interface CumpleañosCardProps {
  birthday: {
    id: string;
    nombre: string;
    fecha_nacimiento: string;
    imagen_url?: string;
    // Campos opcionales para compatibilidad con el formulario
    usuario_id?: string;
    mensaje?: string;
    multimedia_url?: string;
    // Los siguientes pueden ser opcionales
    disciplina?: string;
    rol?: string;
    email?: string;
    telefono?: string;
    trayectoria?: string;
  };
  onEdit?: (cumpleActualizado: any) => void;
  onDeleted?: () => void;
}

const CumpleañosCard: React.FC<CumpleañosCardProps> = ({ birthday, onEdit, onDeleted }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const isToday = (date: string) => {
    const today = new Date();
    const birthDate = new Date(date);
    return birthDate.getDate() === today.getDate() && 
           birthDate.getMonth() === today.getMonth();
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este cumpleaños?')) return;

    try {
      const { error } = await supabase
        .from('cumpleanos')
        .delete()
        .eq('id', birthday.id);

      if (error) throw error;
      toast.success('Cumpleaños eliminado exitosamente');
      if (typeof onDeleted === 'function') onDeleted();
    } catch (error) {
      console.error('Error al eliminar cumpleaños:', error);
      toast.error('Error al eliminar el cumpleaños');
    }
  };

  // Handler para compartir cumpleaños
  const handleShare = () => {
    const url = window.location.origin + '/cumpleanos/' + birthday.id;
    const title = `Cumpleaños de ${birthday.nombre}`;
    const text = `¡Feliz cumpleaños a ${birthday.nombre}! (${birthday.rol})`;
    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success('¡Enlace copiado!');
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${isToday(birthday.fecha_nacimiento) ? 'ring-2 ring-pink-500' : ''}`}>
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-xl max-w-lg w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setEditMode(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <CreateBirthdayForm
              onSuccess={(cumpleActualizado) => { setEditMode(false); if (typeof onEdit === 'function') onEdit(cumpleActualizado); }}
              onCancel={() => setEditMode(false)}
              initialData={birthday}
            />
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {birthday.nombre}
            </h3>
            {birthday.usuario_id && (
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                <a href={`/profile/${birthday.usuario_id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">@{birthday.usuario_id}</a>
              </p>
            )}
            {birthday.mensaje && (
              <p className="mt-2 text-base text-gray-700 dark:text-gray-200 bg-primary-50 dark:bg-primary-900/30 rounded-lg p-3 border border-primary-100 dark:border-primary-800">
                {birthday.mensaje}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 relative">
            <Cake className={`h-6 w-6 ${isToday(birthday.fecha_nacimiento) ? 'text-pink-500' : 'text-gray-400'}`} />
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={e => { e.stopPropagation(); setShowMenu((v) => !v); }}
              aria-label="Abrir menú"
              data-menu="cumple-menu"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-10 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[180px] animate-fade-in"
              >
                <ul className="py-2">
                  <li>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {navigator.clipboard.writeText(window.location.origin + '/cumpleanos/' + birthday.id); setShowMenu(false); toast.success('¡Enlace copiado!')}}>
                      Guardar enlace
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={handleShare}>
                      Compartir cumpleaños
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {setShowMenu(false); setEditMode(true);}}>
                      Editar cumpleaños
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800" onClick={async () => {await handleDelete(); setShowMenu(false);}}>
                      Eliminar cumpleaños
                    </button>
                  </li>
                  <li>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={e => { e.stopPropagation(); setShowMenu(false); }}>
                      Cancelar
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {birthday.imagen_url && (
          <div className="mt-4">
            <img
              src={birthday.imagen_url}
              alt={birthday.nombre}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}
        {birthday.multimedia_url && (
          <div className="mt-4">
            {/* Soporte para multimedia adjunta (audio, video, etc.) */}
            {birthday.multimedia_url.match(/\.(mp4|webm|ogg)$/) ? (
              <video controls className="w-full rounded-lg">
                <source src={birthday.multimedia_url} />
                Tu navegador no soporta video.
              </video>
            ) : birthday.multimedia_url.match(/\.(mp3|wav|ogg)$/) ? (
              <audio controls className="w-full mt-2">
                <source src={birthday.multimedia_url} />
                Tu navegador no soporta audio.
              </audio>
            ) : null}
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="flex items-center">
              <Cake className="h-4 w-4 mr-1 text-pink-500" />
              <a
                href={`/cumpleanos/${birthday.id}`}
                className="hover:underline text-pink-600 dark:text-pink-400 font-semibold"
                title="Ver detalle del cumpleaños"
              >
                {format(new Date(birthday.fecha_nacimiento), 'dd MMMM', { locale: es })}
              </a>
            </span>
          </div>
          {/* Campos opcionales para compatibilidad */}
          {birthday.disciplina && (
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full ml-2">
              {birthday.disciplina}
            </span>
          )}
          {birthday.email && (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              <a href={`mailto:${birthday.email}`} className="hover:text-pink-500">
                {birthday.email}
              </a>
            </div>
          )}
          {birthday.telefono && (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:${birthday.telefono}`} className="hover:text-pink-500">
                {birthday.telefono}
              </a>
            </div>
          )}
        </div>
        {birthday.trayectoria && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Trayectoria
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
              {birthday.trayectoria}
            </p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cumpleaños: {format(new Date(birthday.fecha_nacimiento), "d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CumpleañosCard;