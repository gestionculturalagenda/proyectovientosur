import React, { useState } from 'react';

const SkeletonCard: React.FC<{ type?: 'post' | 'event' }> = ({ type = 'post' }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 animate-pulse">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
      </div>
    </div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
    {type === 'event' && (
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
    )}
    <div className="flex space-x-4 mt-2">
      <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  </div>
);

export default SkeletonCard;
