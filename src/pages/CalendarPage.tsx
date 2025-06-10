import { useState, useEffect } from 'react';
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
    <div className="space-y-4 min-h-screen bg-gradient-to-b from-primary-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 p-2 sm:p-4 pb-24">
      <div className="max-w-full sm:max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary-700 dark:text-primary-300 drop-shadow-sm mb-4 sm:mb-6 text-center">Calendario cultural</h1>
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
        <EventList date={selectedDate} onCreateEvent={handleCreateEvent} />
        {/* Modal para seleccionar tipo de creación */}
        {showTypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-xs w-full mx-2 p-4 relative animate-modal-in">
              <button
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-300 focus:outline-none"
                aria-label="Cerrar"
                onClick={() => setShowTypeModal(false)}
              >
                ×
              </button>
              <h2 className="font-bold text-lg mb-4 text-center">¿Qué deseas crear?</h2>
              <div className="flex flex-col gap-3">
                <button className="btn btn-primary" onClick={() => handleTypeSelect('event')}>Evento</button>
                <button className="btn btn-secondary" onClick={() => handleTypeSelect('birthday')}>Cumpleaños</button>
                <button className="btn btn-ghost" onClick={() => handleTypeSelect('task')}>Tarea</button>
              </div>
            </div>
          </div>
        )}
        {/* Formularios de creación */}
        {isCreating && createType === 'event' && (
          <CreateEventForm date={selectedDate} onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        )}
        {isCreating && createType === 'birthday' && (
          <CreateBirthdayForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        )}
        {isCreating && createType === 'task' && (
          <CreateTaskForm onSuccess={handleCreateSuccess} onCancel={handleCreateCancel} />
        )}
      </div>
    </div>
  );
};

export default CalendarPage;