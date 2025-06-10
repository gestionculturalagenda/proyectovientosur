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
      <div className="animate-slide-up max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4 pb-24">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            ← Volver
          </button>
        </div>
        <CreatePostForm onSuccess={handleSuccess} />
      </div>
    );
  }
  if (selectedType === 'event') {
    return (
      <div className="animate-slide-up max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4 pb-24">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            ← Volver
          </button>
        </div>
        <CreateEventForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }
  if (selectedType === 'birthday') {
    return (
      <div className="animate-slide-up max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4 pb-24">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            ← Volver
          </button>
        </div>
        <CreateBirthdayForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }
  if (selectedType === 'task') {
    return (
      <div className="animate-slide-up max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4 pb-24">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            ← Volver
          </button>
        </div>
        <CreateTaskForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }
  if (selectedType === 'blog') {
    return (
      <div className="animate-slide-up max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4 pb-24">
        <div className="flex items-center mb-4">
          <button
            onClick={handleCancel}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center mr-auto"
          >
            ← Volver
          </button>
        </div>
        <CreateBlogForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }
  return (
    <div className="max-w-full sm:max-w-2xl mx-auto p-2 sm:p-4 pb-24">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 text-primary-700 dark:text-primary-300 text-center">¿Qué deseas crear?</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
        <CreateOption icon={<PlusSquare className="w-8 h-8" />} label="Publicación" color="bg-primary-100 dark:bg-primary-900" onClick={() => setSelectedType('post')} />
        <CreateOption icon={<Calendar className="w-8 h-8" />} label="Evento" color="bg-blue-100 dark:bg-blue-900" onClick={() => setSelectedType('event')} />
        <CreateOption icon={<CakeIcon className="w-8 h-8" />} label="Cumpleaños" color="bg-pink-100 dark:bg-pink-900" onClick={() => setSelectedType('birthday')} />
        <CreateOption icon={<FileText className="w-8 h-8" />} label="Blog" color="bg-yellow-100 dark:bg-yellow-900" onClick={() => setSelectedType('blog')} />
        <CreateOption icon={<PlusSquare className="w-8 h-8" />} label="Tarea" color="bg-green-100 dark:bg-green-900" onClick={() => setSelectedType('task')} />
      </div>
    </div>
  );
};

export default CreatePage;