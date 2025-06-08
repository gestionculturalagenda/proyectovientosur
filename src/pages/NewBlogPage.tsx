import React from 'react';
import CreateBlogForm from '../components/blogs/CreateBlogForm';
import { useNavigate } from 'react-router-dom';

const NewBlogPage: React.FC = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate('/blogs');
  };
  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">Crear nuevo blog</h2>
      <CreateBlogForm onSuccess={handleSuccess} />
    </div>
  );
};

export default NewBlogPage;
