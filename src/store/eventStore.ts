import { create } from 'zustand';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
import { supabase } from '../lib/supabase';

export type EventType = 'event' | 'task' | 'birthday';

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  time?: string;
  location?: string;
  userId: string;
  createdAt: string;
  imagen_url?: string; // Soporte para la URL de imagen en la raíz
  metadata?: {
    target_audience?: string;
    responsible_person?: {
      name: string;
      phone: string;
      social_media?: string;
    };
    technical_requirements?: string[];
    tags?: string[];
    recurrence?: {
      type: string;
      interval?: number;
      end_date?: string;
      days_of_week?: number[];
    };
  };
}

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  updateEvent: (id: string, eventData: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventsByDate: (date: Date) => Event[];
  addComment: (eventId: string, userId: string, content: string) => Promise<any>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: events, error } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;

      const transformedEvents: Event[] = events.map(event => ({
        id: event.id,
        title: event.titulo,
        description: event.descripcion || '',
        type: event.tipo as EventType,
        date: event.fecha_inicio,
        time: format(new Date(event.fecha_inicio), 'HH:mm'),
        location: event.ubicacion,
        userId: event.creador_id,
        createdAt: event.creado_en,
        imagen_url: event.imagen_url, // Añadir imagen_url desde la raíz
        metadata: event.metadata || {}
      }));

      set({ events: transformedEvents, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar eventos', 
        isLoading: false 
      });
    }
  },
  
  addEvent: async (event) => {
    set({ isLoading: true, error: null });
    try {
      const eventDate = new Date(event.date);
      if (event.time) {
        const [hours, minutes] = event.time.split(':');
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      }

      // Separar los datos entre la tabla eventos y el campo metadata
      const { metadata, ...mainEventData } = event;
      
      const eventData = {
        titulo: mainEventData.title,
        descripcion: mainEventData.description,
        tipo: mainEventData.type,
        fecha_inicio: eventDate.toISOString(),
        ubicacion: mainEventData.location,
        creador_id: mainEventData.userId,
        estado: 'publicado',
        // Si la tabla aún no tiene el campo metadata, esto fallará silenciosamente
        ...(metadata && { metadata })
      };

      let insertedData;
      const { data, error } = await supabase
        .from('eventos')
        .insert(eventData)
        .select()
        .single();

      if (error) {
        // Si el error es por la columna metadata, intentar sin ella
        if (error.message.includes('metadata')) {
          const { metadata: _, ...eventDataWithoutMetadata } = eventData;
          const retryResult = await supabase
            .from('eventos')
            .insert(eventDataWithoutMetadata)
            .select()
            .single();
            
          if (retryResult.error) throw retryResult.error;
          insertedData = retryResult.data;
        } else {
          throw error;
        }
      } else {
        insertedData = data;
      }

      const newEvent: Event = {
        id: insertedData.id,
        title: insertedData.titulo,
        description: insertedData.descripcion || '',
        type: insertedData.tipo,
        date: insertedData.fecha_inicio,
        time: event.time,
        location: insertedData.ubicacion,
        userId: insertedData.creador_id,
        createdAt: insertedData.creado_en,
        imagen_url: insertedData.imagen_url, // Asignar la URL de la imagen si existe
        metadata: insertedData.metadata || {}
      };
      
      set(state => ({ 
        events: [...state.events, newEvent],
        isLoading: false 
      }));
      
      toast.success('¡Evento creado exitosamente!');
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear evento', 
        isLoading: false 
      });
      toast.error(`Error al crear evento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },
  
  updateEvent: async (id, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: any = {};
      
      if (eventData.title) updateData.titulo = eventData.title;
      if (eventData.description) updateData.descripcion = eventData.description;
      if (eventData.type) updateData.tipo = eventData.type;
      if (eventData.date) {
        const eventDate = new Date(eventData.date);
        if (eventData.time) {
          const [hours, minutes] = eventData.time.split(':');
          eventDate.setHours(parseInt(hours), parseInt(minutes));
        }
        updateData.fecha_inicio = eventDate.toISOString();
      }
      if (eventData.location) updateData.ubicacion = eventData.location;

      const { error } = await supabase
        .from('eventos')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        events: state.events.map(event =>
          event.id === id ? { ...event, ...eventData } : event
        ),
        isLoading: false
      }));
      
      toast.success('¡Evento actualizado exitosamente!');
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar evento', 
        isLoading: false 
      });
      toast.error('Error al actualizar evento');
    }
  },
  
  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      set(state => ({
        events: state.events.filter(event => event.id !== id),
        isLoading: false
      }));
      
      toast.success('¡Evento eliminado exitosamente!');
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar evento', 
        isLoading: false 
      });
      toast.error('Error al eliminar evento');
    }
  },
  
  getEventsByDate: (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return get().events.filter(event => {
      const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
      return eventDate === dateString;
    });
  },

  addComment: async (eventId, userId, content) => {
    try {
      const { data, error } = await supabase
        .from('comentarios_evento')
        .insert({ evento_id: eventId, autor_id: userId, contenido: content })
        .select()
        .single();
      if (error) throw error;
      toast.success('Comentario agregado');
      return data;
    } catch (error) {
      toast.error('Error al agregar comentario');
      return null;
    }
  },
}));

// Format event date for display
export const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'EEEE, MMMM do yyyy');
};

// Format event time for display
export const formatEventTime = (timeString?: string) => {
  if (!timeString) return '';
  try {
    const time = parse(timeString, 'HH:mm', new Date());
    return format(time, 'h:mm a');
  } catch (error) {
    return timeString;
  }
};