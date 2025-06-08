import React from 'react';
import { format } from 'date-fns';
import { Calendar, CheckSquare, Cake, Clock, MapPin } from 'lucide-react';
import { 
  Event, 
  EventType, 
  formatEventDate, 
  formatEventTime, 
  useEventStore 
} from '../../store/eventStore';

interface EventListProps {
  date: Date;
  onCreateEvent: () => void;
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'event':
      return <Calendar className="h-4 w-4 text-primary-500" />;
    case 'task':
      return <CheckSquare className="h-4 w-4 text-yellow-500" />;
    case 'birthday':
      return <Cake className="h-4 w-4 text-pink-500" />;
  }
};

const getEventTypeLabel = (type: EventType) => {
  switch (type) {
    case 'event':
      return 'Event';
    case 'task':
      return 'Task';
    case 'birthday':
      return 'Birthday';
  }
};

const EventList: React.FC<EventListProps> = ({ date, onCreateEvent }) => {
  const { events, getEventsByDate } = useEventStore();
  const eventsForDay = getEventsByDate(date);
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(date, 'EEEE, MMMM d')}
        </h3>
        <button 
          onClick={onCreateEvent}
          className="btn btn-primary px-3 py-1 text-xs rounded-full"
        >
          + Add
        </button>
      </div>
      
      {eventsForDay.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No events for this day</p>
          <button 
            onClick={onCreateEvent}
            className="mt-3 btn btn-ghost text-primary-600 dark:text-primary-400"
          >
            Create an event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {eventsForDay.map(event => (
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

const EventItem: React.FC<{ event: Event }> = ({ event }) => {
  return (
    <div className="card hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getEventIcon(event.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{event.title}</h4>
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mt-1">
                {getEventTypeLabel(event.type)}
              </span>
            </div>
          </div>
          
          {event.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {event.description}
            </p>
          )}
          
          <div className="mt-2 flex flex-wrap gap-y-1 gap-x-3">
            {event.time && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatEventTime(event.time)}</span>
              </div>
            )}
            
            {event.location && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventList;