import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (user?.role === 'student') {
    return <Navigate to="/courses" replace />;
  }
  if (user?.role === 'teacher') {
    return <Navigate to="/teacher/groups" replace />;
  }
  if (user?.role === 'manager') {
    return <Navigate to="/admin/users" replace />;
  }

  return <div>Unknown role</div>;
}
