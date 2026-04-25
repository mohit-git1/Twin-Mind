'use client';

import { useAppStore } from '@/store/useAppStore';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { useEffect } from 'react';

export function NotificationBanner() {
  const { notification, clearNotification } = useAppStore();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);

  if (!notification) return null;

  const bgColors = {
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };

  const icons = {
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />,
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl backdrop-blur-md min-w-[300px] max-w-md ${
          bgColors[notification.type]
        }`}
      >
        {icons[notification.type]}
        <p className="flex-1 text-sm font-medium">{notification.message}</p>
        <button
          onClick={clearNotification}
          className="p-1 rounded-md hover:bg-black/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
