import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getGroups } from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function TeacherGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    getGroups({ teacher_id: user?.id })
      .then(res => setGroups(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Мои группы</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(g => (
          <div key={g.id} className="glass-card p-6 flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-blue-400 mb-1">{g.title}</h2>
                <p className="text-sm text-slate-400">Курс ID: {g.course_id}</p>
              </div>
              <div className="px-3 py-1 bg-slate-800 rounded-full text-sm border border-slate-700">
                <span className="text-slate-300">Учеников: </span>
                <span className="text-white font-bold">{g.current_count}/{g.max_students}</span>
              </div>
            </div>
            
            <div className="flex-1 text-slate-400 mb-6">
              <p className="text-sm font-medium mb-2 text-slate-300">Расписание:</p>
              {g.schedules?.length > 0 ? (
                <ul className="space-y-1">
                  {g.schedules.map((s, idx) => (
                    <li key={idx}>• {s.day_of_week.toUpperCase()} {s.start_time} - {s.end_time}</li>
                  ))}
                </ul>
              ) : (
                <p className="italic">Не задано</p>
              )}
            </div>

            <Link 
              to={`/teacher/groups/${g.id}`} 
              className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
            >
              Управление группой
            </Link>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full text-center text-slate-400 py-12">
            У вас пока нет назначенных групп.
          </div>
        )}
      </div>
    </div>
  );
}
