import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export type TaskFormValues = {
  nombre: string;
  fecha_limite: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  prioridad: 'baja' | 'media' | 'alta';
  asignada_a: string; // ahora es solo texto
  descripcion: string;
};

interface CreateTaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<TaskFormValues>();
  const user = useAuthStore(state => state.user);

  const onSubmit = async (data: TaskFormValues) => {
    if (!user) return;
    const { error } = await supabase.from('tareas').insert({
      nombre: data.nombre,
      fecha_limite: data.fecha_limite,
      estado: data.estado,
      prioridad: data.prioridad,
      asignada_a: data.asignada_a, // texto
      descripcion: data.descripcion,
      creador_id: user.id
    });
    if (error) {
      alert('Error al crear la tarea: ' + error.message);
      return;
    }
    reset();
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center text-primary-700 dark:text-primary-300 mb-4">Crear Nueva Tarea</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-1">Nombre de la tarea</label>
          <input {...register('nombre', { required: true })} className="input w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-400" />
          {errors.nombre && <span className="text-red-500 text-xs">Este campo es obligatorio</span>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Fecha y hora límite</label>
          <input type="datetime-local" {...register('fecha_limite', { required: true })} className="input w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-400" />
          {errors.fecha_limite && <span className="text-red-500 text-xs">Este campo es obligatorio</span>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Estado</label>
          <select {...register('estado', { required: true })} className="input w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-400">
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1">Prioridad</label>
          <select {...register('prioridad', { required: true })} className="input w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-400">
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Asignada a</label>
          <input {...register('asignada_a', { required: true })} className="input w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-400" placeholder="Nombre(s) o identificador(es)" />
          {errors.asignada_a && <span className="text-red-500 text-xs">Este campo es obligatorio</span>}
        </div>
        <div className="md:col-span-2">
          <label className="block font-semibold mb-1">Descripción</label>
          <textarea {...register('descripcion', { required: true })} className="input w-full border rounded-lg px-3 py-2 min-h-[80px] focus:ring-2 focus:ring-primary-400" />
          {errors.descripcion && <span className="text-red-500 text-xs">Este campo es obligatorio</span>}
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-4">
        <button type="button" onClick={onCancel} className="btn-secondary px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition">Cancelar</button>
        <button type="submit" className="btn-primary px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">Crear tarea</button>
      </div>
    </form>
  );
};

export default CreateTaskForm;
