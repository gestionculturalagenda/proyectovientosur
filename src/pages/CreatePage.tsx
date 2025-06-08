import React, { useState } from 'react';
import { PlusSquare, FileText, CakeIcon, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import CreatePostForm from '../components/posts/CreatePostForm';
import CreateEventForm from '../components/calendar/CreateEventForm';
import CreateBlogForm from '../components/blogs/CreateBlogForm';
import CreateBirthdayForm from '../components/cultural/CreateBirthdayForm';
import CreateTaskForm from '../components/cultural/CreateTaskForm';
import { useNavigate } from 'react-router-dom';

type CreateType = 'post' | 'event' | 'birthday' | 'task' | 'blog';

interface CreateOptionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

const CreateOption: React.FC<CreateOptionProps> = ({ icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-6 rounded-xl ${color} w-full h-full`}
  >
    {icon}
    <span className="mt-2 text-sm font-medium">{label}</span>
  </motion.button>
);

const CreatePage = () => {
  const [selectedType, setSelectedType] = useState<CreateType | null>(null);
  const navigate = useNavigate();
  
  const handleCreateEvent = (type: 'event' | 'birthday' | 'task') => {
    setSelectedType(type);
  };
  
  // Go back to options
  const handleCancel = () => {
    setSelectedType(null);
  };
  
  // Handle success
  const handleSuccess = () => {
    if (selectedType === 'post') {
      navigate('/');
    } else {
      navigate('/calendar');
    }
  };
  
  if (selectedType === 'post') {
    return (
      <div className="animate-slide-up">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
          <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">Crear Publicación</h2>
          <div className="mr-auto"></div> {/* Spacer for centering */}
        </div>
        
        <CreatePostForm onSuccess={handleSuccess} />
      </div>
    );
  }
  
  if (selectedType === 'event') {
    return (
      <div className="animate-slide-up">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
          <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
            Crear Evento
          </h2>
          <div className="mr-auto"></div>
        </div>
        <CreateEventForm 
          date={new Date()} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </div>
    );
  }

  if (selectedType === 'task') {
    return (
      <div className="animate-slide-up">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
          <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
            Crear Tarea
          </h2>
          <div className="mr-auto"></div>
        </div>
        <CreateTaskForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  if (selectedType === 'birthday') {
    return (
      <div className="animate-slide-up">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
          <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
            Crear Cumpleaños
          </h2>
          <div className="mr-auto"></div>
        </div>
        <CreateBirthdayForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  if (selectedType === 'blog') {
    return (
      <div className="animate-slide-up">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver
          </button>
          <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">Publicar Blog</h2>
          <div className="mr-auto"></div>
        </div>
        <CreateBlogForm onSuccess={handleSuccess} />
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-900 dark:text-white">
        Crear nuevo contenido
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <CreateOption 
          icon={<PlusSquare className="h-8 w-8 text-white" />} 
          label="Publicación" 
          color="bg-gradient-to-br from-primary-600 to-primary-700 text-white"
          onClick={() => setSelectedType('post')}
        />
        
        <CreateOption 
          icon={<Calendar className="h-8 w-8 text-white" />} 
          label="Evento" 
          color="bg-gradient-to-br from-secondary-600 to-secondary-700 text-white"
          onClick={() => handleCreateEvent('event')}
        />
        
        <CreateOption 
          icon={<CakeIcon className="h-8 w-8 text-white" />} 
          label="Cumpleaños" 
          color="bg-gradient-to-br from-accent-600 to-accent-700 text-white"
          onClick={() => handleCreateEvent('birthday')}
        />
        
        <CreateOption 
          icon={<FileText className="h-8 w-8 text-white" />} 
          label="Tarea" 
          color="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white"
          onClick={() => handleCreateEvent('task')}
        />

        <CreateOption
          icon={<FileText className="h-8 w-8" />}
          label="Blog"
          color="bg-primary-50 dark:bg-primary-900/20"
          onClick={() => setSelectedType('blog')}
        />
      </div>
    </div>
  );
};

export default CreatePage;