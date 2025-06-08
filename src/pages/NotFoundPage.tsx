import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="h-16 w-16 text-gray-400 dark:text-gray-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h2>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="btn btn-primary px-6 py-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;