import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Upload
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        // Temporarily use axios directly to avoid interceptor loops
        const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
        const { access_token } = res.data;
        localStorage.setItem('access_token', access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        // Reject with a silent error so components stop loading
        return Promise.reject({ __sessionExpired: true, message: 'Session expired' });
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const loginUser = (login, password) => api.post('/auth/login', { login, password });
export const registerUser = (data) => api.post('/auth/register', data);
export const getMe = () => api.get('/auth/me');

// Users
export const getUsers = (params) => api.get('/users/', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const resetUserPassword = (id, new_password) => api.patch(`/users/${id}/reset-password`, { new_password });
export const deactivateUser = (id) => api.patch(`/users/${id}/deactivate`, {});
export const activateUser = (id) => api.patch(`/users/${id}/activate`, {});
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Dashboard
export const getStudentDashboard = () => api.get('/dashboard/student');
export const getParentLink = () => api.get('/dashboard/student/parent-link');

// Courses
export const getCourses = () => api.get('/courses/');
export const getCourse = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post('/courses/', data);
export const updateCourse = (id, data) => api.patch(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

// Groups
export const getGroups = (params) => api.get('/groups/', { params });
export const getGroup = (id) => api.get(`/groups/${id}`);
export const createGroup = (data) => api.post('/groups/', data);
export const updateGroup = (id, data) => api.patch(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
export const getGroupStudents = (id) => api.get(`/groups/${id}/students`);
export const addStudentToGroup = (groupId, data) => api.post(`/groups/${groupId}/students`, data);
export const removeStudentFromGroup = (groupId, studentId) => api.delete(`/groups/${groupId}/students/${studentId}`);

// Enrollments (backend uses "" so no trailing slash)
export const getEnrollments = (params) => api.get('/enrollments', { params });
export const createEnrollment = (data) => api.post('/enrollments', data);
export const approveEnrollment = (id) => api.patch(`/enrollments/${id}/approve`, {});
export const rejectEnrollment = (id) => api.patch(`/enrollments/${id}/reject`, {});

// Lessons (backend uses "/")
export const getLessons = (groupId) => api.get(`/groups/${groupId}/lessons/`);
export const createLesson = (groupId, data) => api.post(`/groups/${groupId}/lessons/`, data);

// Grades
export const getMyGrades = () => api.get('/grades/my');
export const createGrade = (data) => api.post('/grades/', data);
export const getAuditLog = (params) => api.get('/grades/audit', { params });
export const cancelGrade = (id, data) => api.patch(`/grades/${id}/cancel`, data);

// Rankings
export const getGlobalRanking = () => api.get('/rankings/global');
export const getGroupRanking = (groupId) => api.get(`/rankings/group/${groupId}`);

// Store (backend uses "/items", "/purchase", and "/purchases" WITHOUT trailing slash!)
export const getStoreItems = () => api.get('/store/items');
export const createStoreItem = (data) => api.post('/store/items', data);
export const updateStoreItem = (id, data) => api.patch(`/store/items/${id}`, data);
export const deleteStoreItem = (id) => api.delete(`/store/items/${id}`);
export const purchaseItem = (data) => api.post('/store/purchase', data);
export const getPurchases = (params) => api.get('/store/purchases', { params });
export const deliverPurchase = (id) => api.patch(`/store/purchases/${id}/deliver`, {});
export const cancelPurchase = (id) => api.patch(`/store/purchases/${id}/cancel`, {});

// Notifications (backend uses "/")
export const getNotifications = (params) => api.get('/notifications/', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markRead = (id) => api.patch(`/notifications/${id}/read`, {});
export const markAllRead = () => api.patch('/notifications/read-all', {});
export const clearNotifications = () => api.delete('/notifications/');

// Public
export const getPublicStudentProgress = (token) => api.get(`/public/student/${token}`);

export default api;
