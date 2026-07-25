import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import Courses from './pages/student/Courses';
import CourseDetail from './pages/student/CourseDetail';
import MyGrades from './pages/student/MyGrades';
import Rankings from './pages/student/Rankings';
import Store from './pages/student/Store';
import TeacherGroups from './pages/teacher/TeacherGroups';
import TeacherGroupDetail from './pages/teacher/TeacherGroupDetail';
import Enrollments from './pages/Enrollments';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminStore from './pages/admin/AdminStore';
import AdminPurchases from './pages/admin/AdminPurchases';
import AdminAudit from './pages/admin/AdminAudit';

function App() {
  const { loadFromStorage, isInitialized, user } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  if (!isInitialized) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19]">
      <div className="animate-pulse text-indigo-400 text-lg font-medium">Загрузка...</div>
    </div>
  );

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'student') return '/dashboard';
    if (user.role === 'teacher') return '/teacher/groups';
    return '/admin/courses';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'manager']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
            
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/rankings" element={<Rankings />} />
            
            {/* Student only */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/grades" element={<MyGrades />} />
              <Route path="/store" element={<Store />} />
            </Route>

            {/* Teacher & Manager */}
            <Route element={<ProtectedRoute allowedRoles={['teacher', 'manager']} />}>
              <Route path="/enrollments" element={<Enrollments />} />
              <Route path="/teacher/groups" element={<TeacherGroups />} />
              <Route path="/teacher/groups/:id" element={<TeacherGroupDetail />} />
            </Route>

            {/* Manager only */}
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/courses" element={<AdminCourses />} />
              <Route path="/admin/store" element={<AdminStore />} />
              <Route path="/admin/purchases" element={<AdminPurchases />} />
              <Route path="/admin/audit" element={<AdminAudit />} />
            </Route>
            
            {/* 404 catch-all */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-6xl font-black text-slate-700 mb-4">404</div>
                <h2 className="text-xl font-bold text-white mb-2">Страница не найдена</h2>
                <p className="text-slate-400 mb-6">Такой страницы не существует или у вас нет доступа.</p>
                <a href="/" className="btn-primary px-6 py-2.5">На главную</a>
              </div>
            } />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

