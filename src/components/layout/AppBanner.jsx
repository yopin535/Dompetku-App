import React from 'react';
import { RefreshCw, Cloud, CloudOff } from 'lucide-react';

export default function AppBanner({ syncStatus }) {
  return (
    <div className="bg-gradient-to-b from-blue-700 to-indigo-800 px-5 py-4 text-white shadow-md relative overflow-hidden">
      <div className="flex items-center justify-end relative z-10">
        <div className="flex items-center gap-2">
          {syncStatus === 'saving' && <RefreshCw className="w-4 h-4 text-blue-200 animate-spin" />}
          {syncStatus === 'synced' && <Cloud className="w-4 h-4 text-blue-200" />}
          {syncStatus === 'offline' && <CloudOff className="w-4 h-4 text-rose-300" />}
        </div>
      </div>
    </div>
  );
}
