import { useState, useEffect } from 'react';
import { getEnrollments, approveEnrollment, rejectEnrollment } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { CheckCircle2, XCircle, Clock, Users, BookOpen } from 'lucide-react';
import { useToastStore } from '../store/toastStore';

export default function Enrollments() {
  const toast = useToastStore();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const { user } = useAuthStore();

  const fetchEnrollments = async () => {
    try {
      const res = await getEnrollments(statusFilter ? { status: statusFilter } : {});
      setEnrollments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchEnrollments();
  }, [statusFilter]);

  const handleApprove = async (id) => {
    try {
      await approveEnrollment(id);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка одобрения');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectEnrollment(id);
      fetchEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка отклонения');
    }
  };

  const tabs = [
    { id: 'pending', label: 'В ожидании' },
    { id: 'approved', label: 'Одобренные' },
    { id: 'rejected', label: 'Отклоненные' },
    { id: '', label: 'Все заявки' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Заявки в группы
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {user?.role === 'manager' ? 'Управление всеми заявками на платформе' : 'Заявки в ваши группы'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setStatusFilter(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === t.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-pulse text-blue-400">Загрузка...</div></div>
      ) : enrollments.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          Заявок в этой категории не найдено.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map(req => (
            <div key={req.id} className="glass-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                    ${req.status === 'pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 
                      req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      'bg-red-500/20 text-red-400 border border-red-500/30'}`}
                  >
                    {req.status === 'pending' ? 'В ожидании' : req.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(req.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  {req.student_name || 'Неизвестный ученик'}
                </h3>
                <p className="text-slate-400 text-sm flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  {req.group_title || 'Неизвестная группа'}
                </p>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  <button 
                    onClick={() => handleApprove(req.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Принять
                  </button>
                  <button 
                    onClick={() => handleReject(req.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 py-2 rounded-lg font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Отклонить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
