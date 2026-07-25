import React from 'react';

export const SkeletonCard = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-3 w-full">
        <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        <div className="h-6 bg-slate-700 rounded w-2/4"></div>
      </div>
      <div className="h-10 w-10 shrink-0 bg-slate-700 rounded-xl"></div>
    </div>
    
    <div className="flex items-center gap-3 mt-4">
      <div className="w-8 h-8 rounded-full bg-slate-700 shrink-0"></div>
      <div className="space-y-2 w-full">
        <div className="h-3 bg-slate-700 rounded w-1/5"></div>
        <div className="h-4 bg-slate-700 rounded w-1/3"></div>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div className="h-24 bg-slate-700/50 rounded-xl"></div>
      <div className="h-24 bg-slate-700/50 rounded-xl"></div>
    </div>
  </div>
);

export const SkeletonText = ({ className = "h-4 w-3/4" }) => (
  <div className={`bg-slate-700 rounded animate-pulse ${className}`}></div>
);

export const SkeletonAvatar = ({ className = "w-10 h-10" }) => (
  <div className={`bg-slate-700 rounded-full animate-pulse ${className}`}></div>
);

export const SkeletonGrid = ({ count = 4, className = "grid grid-cols-1 lg:grid-cols-2 gap-6" }) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
