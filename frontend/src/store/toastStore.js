import { create } from 'zustand';

export const useToastStore = create((set, get) => ({
  toasts: [],
  addToast: (type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    set(state => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, duration);
  },
  success: (message) => get().addToast('success', message),
  error: (message) => get().addToast('error', message),
  warning: (message) => get().addToast('warning', message),
  info: (message) => get().addToast('info', message),
  removeToast: (id) => set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),
}));
