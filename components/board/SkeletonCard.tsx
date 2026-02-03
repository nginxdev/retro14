
import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="w-full h-[120px] bg-white rounded-lg border border-[#DFE1E6] p-3 flex flex-col gap-3 animate-pulse">
      <div className="h-1.5 w-1/3 bg-gray-200 rounded"></div>
      <div className="space-y-2 flex-1">
        <div className="h-2 w-full bg-gray-100 rounded"></div>
        <div className="h-2 w-5/6 bg-gray-100 rounded"></div>
        <div className="h-2 w-4/6 bg-gray-100 rounded"></div>
      </div>
      <div className="flex justify-between items-center mt-auto">
         <div className="h-4 w-4 rounded-full bg-gray-200"></div>
         <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
      </div>
    </div>
  );
};
