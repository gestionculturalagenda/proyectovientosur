import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, User, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completada';
  asignado_a: string;
  fecha_limite: string;
  prioridad: 'baja' | 'media' | 'alta';
  checklist: { item: string; completado: boolean }[];
}

const COLUMNS = [
  { id: 'pendiente', title: 'Pendientes', color: 'bg-yellow-100' },
  { id: 'en_progreso', title: 'En Progreso', color: 'bg-blue-100' },
  { id: 'completada', title: 'Completadas', color: 'bg-green-100' }
] as const;

export const TareaCulturalKanban: React.FC = () => {
  const [showMenuId, setShowMenuId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .order('fecha_limite', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = async (e: React.DragEvent, status: Task['estado']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado: status })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, estado: status } : task
      ));

      toast.success('Tarea actualizada');
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return <div>Cargando tareas...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map(column => (
        <div
          key={column.id}
          className={`${column.color} dark:bg-gray-800 p-4 rounded-lg shadow`}
          onDrop={(e) => handleDrop(e, column.id)}
          onDragOver={handleDragOver}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {column.title}
          </h3>
          
          <div className="space-y-4">
            {tasks
              .filter(task => task.estado === column.id)
              .map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-white dark:bg-gray-700 p-4 rounded shadow-sm cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {task.titulo}
                    </h4>
                    <div className="relative">
                      <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowMenuId(showMenuId === task.id ? null : task.id)} aria-label="Abrir menú">
                        <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      {showMenuId === task.id && (
                        <div className="absolute right-0 top-10 z-20 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[180px]">
                          <ul className="py-2">
                            <li>
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {navigator.clipboard.writeText(task.titulo + ' - ' + task.descripcion); setShowMenuId(null); toast.success('¡Tarea copiada!')}}>
                                Copiar tarea
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => {setShowMenuId(null); /* Aquí podrías abrir un modal de edición */}}>
                                Editar tarea
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-800" onClick={async () => {await supabase.from('tareas').delete().eq('id', task.id); setShowMenuId(null); toast.success('Tarea eliminada'); fetchTasks();}}>
                                Eliminar tarea
                              </button>
                            </li>
                            <li>
                              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setShowMenuId(null)}>
                                Cancelar
                              </button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                    {task.descripcion}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{task.asignado_a}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(task.fecha_limite).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {task.checklist?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CheckSquare className="h-4 w-4 mr-1" />
                        <span>
                          {task.checklist.filter(item => item.completado).length} / {task.checklist.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};