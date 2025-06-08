import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Event, EventType, useEventStore } from '../../store/eventStore';

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
  selectedDate: Date;
}

// Helper function to get events for a specific day
const getEventsForDay = (events: Event[], date: Date): Event[] => {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    return isSameDay(eventDate, date);
  });
};

// Get event indicator color based on type
const getEventTypeColor = (type: EventType): string => {
  switch (type) {
    case 'event':
      return 'bg-primary-500';
    case 'task':
      return 'bg-yellow-500';
    case 'birthday':
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
};

const CalendarView: React.FC<CalendarViewProps> = ({ onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { events } = useEventStore();
  
  // Calculate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Navigation
  const prevMonth = () => {
    setCurrentMonth(prevDate => subMonths(prevDate, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(prevDate => addMonths(prevDate, 1));
  };
  
  return (
    <div className="card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      
      {/* Weekdays */}
      <div className="grid grid-cols-7 mb-1 text-center">
        {weekdays.map((day) => (
          <div 
            key={day}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
        {calendarDays.map((day) => {
          const dayEvents = getEventsForDay(events, day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`
                h-16 sm:h-20 p-1 flex flex-col relative 
                ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'}
                ${isSelected ? 'ring-2 ring-primary-500 z-10' : ''}
                ${isCurrentDay && !isSelected ? 'ring-1 ring-primary-300 dark:ring-primary-700' : ''}
              `}
            >
              <span 
                className={`
                  text-xs leading-none w-5 h-5 flex items-center justify-center rounded-full 
                  ${isCurrentDay ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-medium' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
              
              {/* Event indicators (limited to 3) */}
              {dayEvents.length > 0 && (
                <div className="mt-auto">
                  {dayEvents.slice(0, 3).map((event, index) => (
                    <div 
                      key={event.id}
                      className={`h-1.5 rounded-full my-0.5 ${getEventTypeColor(event.type)}`}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-xs text-right block text-gray-500 dark:text-gray-400">
                      +{dayEvents.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;