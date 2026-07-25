import { create } from 'zustand';
import { getNotifications, getUnreadCount, markRead as apiMarkRead, markAllRead as apiMarkAllRead, clearNotifications as apiClearNotifications } from '../api/client';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),

  fetch: async () => {
    try {
      const [{ data: notifs }, { data: unread }] = await Promise.all([
        getNotifications({ limit: 20 }),
        getUnreadCount()
      ]);
      set({ notifications: notifs, unreadCount: unread.count });
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  },

  markRead: async (id) => {
    try {
      await apiMarkRead(id);
      set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (e) {
      console.error('Error marking read', e);
    }
  },

  markAllRead: async () => {
    try {
      await apiMarkAllRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0
      }));
    } catch (e) {
      console.error('Error marking all read', e);
    }
  },

  clearAll: async () => {
    try {
      await apiClearNotifications();
      set({ notifications: [], unreadCount: 0 });
    } catch (e) {
      console.error('Error clearing notifications', e);
    }
  }
}));
