import React from 'react';

const SkeletonLoader: React.FC<{ className?: string }> = ({ className = 'h-4 bg-gray-300 dark:bg-gray-700 rounded' }) => {
  return <div className={`animate-pulse ${className}`} />;
};

export const CardSkeleton: React.FC = () => (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <SkeletonLoader className="h-32 mb-4" />
        <SkeletonLoader className="h-6 w-3/4 mb-2" />
        <SkeletonLoader className="h-4 w-1/2" />
    </div>
);

export default SkeletonLoader;