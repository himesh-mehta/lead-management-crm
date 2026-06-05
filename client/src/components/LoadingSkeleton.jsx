import React from 'react';

const LoadingSkeleton = ({ rows = 5 }) => {
  const skeletonRows = Array.from({ length: rows });

  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Table Head Placeholder */}
      <div className="flex gap-4 border-b border-slate-700 pb-4">
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/6"></div>
        <div className="h-4 bg-slate-700 rounded w-1/6"></div>
        <div className="h-4 bg-slate-700 rounded w-1/6"></div>
      </div>
      
      {/* Table Body Rows Placeholder */}
      {skeletonRows.map((_, index) => (
        <div key={index} className="flex gap-4 items-center py-3 border-b border-slate-800">
          <div className="h-5 bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/4"></div>
          <div className="h-4 bg-slate-800 rounded w-1/6"></div>
          <div className="h-6 bg-slate-800/80 rounded-full w-24"></div>
          <div className="h-4 bg-slate-800 rounded w-1/6"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
