import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5 }) => {
  const skeletonRows = Array.from({ length: rows });

  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Table Head Placeholder */}
      <div className="flex gap-4 border-b border-gray-150 dark:border-slate-800 pb-4">
        <div className="h-3.5 bg-gray-250 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-3.5 bg-gray-255 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-3.5 bg-gray-200 dark:bg-slate-800 rounded w-1/6" />
        <div className="h-3.5 bg-gray-200 dark:bg-slate-805 rounded w-1/6" />
        <div className="h-3.5 bg-gray-200 dark:bg-slate-805 rounded w-1/6" />
      </div>

      {/* Table Body Rows Placeholder */}
      {skeletonRows.map((_, index) => (
        <div key={index} className="flex gap-4 items-center py-3 border-b border-gray-100 dark:border-slate-850">
          <div className="w-8 h-8 bg-gray-250 dark:bg-slate-800 rounded-full flex-shrink-0" />
          <div className="h-4 bg-gray-250 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-gray-100 dark:bg-slate-850 rounded w-1/4" />
          <div className="h-4 bg-gray-100 dark:bg-slate-850 rounded w-1/6" />
          <div className="h-5 bg-gray-100 dark:bg-slate-800 rounded-full w-20" />
          <div className="h-4 bg-gray-100 dark:bg-slate-850 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
