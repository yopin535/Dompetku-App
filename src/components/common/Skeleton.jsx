import React from 'react';

export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}>
      <SkeletonLine className="h-3 w-1/3 mb-3" />
      <SkeletonLine className="h-6 w-2/3 mb-2" />
      <SkeletonLine className="h-3 w-1/2" />
    </div>
  );
}

export function SkeletonTransactionRow() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-2/3" />
        <SkeletonLine className="h-3 w-1/3" />
      </div>
      <SkeletonLine className="h-5 w-16" />
    </div>
  );
}

export function SkeletonHome() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="bg-gradient-to-b from-blue-700 to-indigo-800 px-5 pt-6 pb-6 rounded-b-[2rem] shadow-lg mb-2">
        <SkeletonLine className="h-3 w-40 mb-3 !bg-white/20" />
        <SkeletonLine className="h-9 w-56 mb-4 !bg-white/20" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonLine className="h-16 !rounded-xl !bg-white/10" />
          <SkeletonLine className="h-16 !rounded-xl !bg-white/10" />
        </div>
      </div>
      <div className="px-4 space-y-3 mt-4">
        <SkeletonCard />
        <SkeletonTransactionRow />
        <SkeletonTransactionRow />
        <SkeletonTransactionRow />
      </div>
    </div>
  );
}

export default SkeletonLine;
