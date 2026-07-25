import React from 'react';
import { useToastStore } from '../store/toastStore';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          error: <XCircle className="w-5 h-5 text-red-500" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          info: <Info className="w-5 h-5 text-indigo-500" />
        };
        
        const borders = {
          success: 'border-l-emerald-500',
          error: 'border-l-red-500',
          warning: 'border-l-amber-500',
          info: 'border-l-indigo-500'
        };

        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 gap-3 w-80 max-w-[calc(100vw-2rem)] glass-card border-l-4 ${borders[toast.type] || borders.info}`}
            style={{ animation: 'toast-in 0.3s ease-out forwards' }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[toast.type] || icons.info}
            </div>
            <div className="flex-1 text-sm font-medium text-slate-100 pr-4">
              {toast.message}
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
