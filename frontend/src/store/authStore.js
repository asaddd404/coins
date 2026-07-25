import { create } from 'zustand';
import { getMe } from '../api/client';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  login: (tokens, user) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    set({ user, isAuthenticated: true, isInitialized: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false, isInitialized: true });
  },

  setUser: (user) => set({ user, isAuthenticated: true, isInitialized: true }),

  loadFromStorage: async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const { data } = await getMe();
        set({ user: data, isAuthenticated: true, isInitialized: true });
      } catch (e) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  }
}));
