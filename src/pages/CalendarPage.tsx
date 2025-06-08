import React, { useEffect, useState } from 'react';
import CalendarView from '../components/calendar/CalendarView';
import EventList from '../components/calendar/EventList';
import CreateEventForm from '../components/calendar/CreateEventForm';
import CreateBirthdayForm from '../components/cultural/CreateBirthdayForm';
import CreateTaskForm from '../components/cultural/CreateTaskForm';
import { useEventStore } from '../store/eventStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<'event' | 'birthday' | 'task' | null>(null);
  const [showTypeModal, setShowTypeModal] = useState(false);

  const { isLoading, fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Cuando el usuario selecciona un día, abrir el modal de tipo
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setShowTypeModal(true);
  };

  // Cuando el usuario hace clic en '+ Add'
  const handleCreateEvent = () => {
    setShowTypeModal(true);
  };

  const handleTypeSelect = (type: 'event' | 'birthday' | 'task') => {
    setCreateType(type);
    setIsCreating(true);
    setShowTypeModal(false);
  };

  const handleCreateSuccess = () => {
    setIsCreating(false);
    setCreateType(null);
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setCreateType(null);
  };

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner message="Loading calendar..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-primary-700 dark:text-primary-300 drop-shadow-sm mb-6 text-center">Calendario cultural</h1>
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
        {/* Modal para elegir tipo de creación */}
        {showTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col items-center gap-4">
              <h2 className="text-lg font-bold mb-2">¿Qué deseas crear?</h2>
              <button onClick={() => handleTypeSelect('event')} className="w-full py-2 rounded-full bg-primary-600 text-white font-semibold shadow hover:bg-primary-700 transition mb-2">Evento</button>
              <button onClick={() => handleTypeSelect('birthday')} className="w-full py-2 rounded-full bg-pink-500 text-white font-semibold shadow hover:bg-pink-600 transition mb-2">Cumpleaños</button>
              <button onClick={() => handleTypeSelect('task')} className="w-full py-2 rounded-full bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition">Tarea</button>
              <button onClick={() => setShowTypeModal(false)} className="mt-2 text-gray-500 hover:underline">Cancelar</button>
            </div>
          </div>
        )}
        {/* Formulario según tipo */}
        {isCreating ? (
          createType === 'event' ? (
            <CreateEventForm
              date={selectedDate}
              onSuccess={handleCreateSuccess}
              onCancel={handleCreateCancel}
            />
          ) : createType === 'birthday' ? (
            <CreateBirthdayForm
              onSuccess={handleCreateSuccess}
              onCancel={handleCreateCancel}
              initialData={{ fecha_nacimiento: selectedDate.toISOString().slice(0, 10) }}
            />
          ) : createType === 'task' ? (
            <CreateTaskForm
              onSuccess={handleCreateSuccess}
              onCancel={handleCreateCancel}
            />
          ) : null
        ) : (
          <EventList
            date={selectedDate}
            onCreateEvent={handleCreateEvent}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;