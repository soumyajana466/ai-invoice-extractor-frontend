import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-indigo-400 shrink-0" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-950/80 text-rose-200',
    info: 'border-indigo-500/30 bg-indigo-950/80 text-indigo-200'
  };

  return (
    <div className="fixed bottom-4 sm:bottom-5 left-3 right-3 sm:left-auto sm:right-5 z-50 animate-fade-in flex justify-center sm:justify-end pointer-events-none">
      <div className={`pointer-events-auto flex items-center justify-between sm:justify-start space-x-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border backdrop-blur-md shadow-2xl max-w-md w-full sm:w-auto ${borders[toast.type || 'info']}`}>
        <div className="flex items-center space-x-2.5 min-w-0">
          {icons[toast.type || 'info']}
          <span className="text-xs sm:text-sm font-medium truncate">{toast.message}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Dismiss toast"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
