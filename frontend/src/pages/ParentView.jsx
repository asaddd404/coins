import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicStudentProgress } from '../api/client';
import { Trophy, Coins, Calendar, BookOpen, Star, AlertTriangle, Award, Users } from 'lucide-react';
import { SkeletonCard, SkeletonText, SkeletonAvatar } from '../components/Skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ParentView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPublicStudentProgress(token);
        setData(res.data);
      } catch (err) {
        setError('Ссылка недействительна или устарела');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white p-4 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonCard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center p-8 space-y-6">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Ошибка доступа</h2>
          <p className="text-slate-400">{error}</p>
          <Link to="/" className="btn-primary inline-block">На главную</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white p-4 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="text-2xl font-black gradient-text inline-block mb-4 hover:scale-105 transition-transform">
            Zaytuna Coin
          </Link>
          <h1 className="text-3xl font-bold">Прогресс ученика</h1>
          <p className="text-slate-400">Информация для родителей</p>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/30">
            {data.student.full_name.charAt(0)}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-2xl font-bold mb-1">{data.student.full_name}</h2>
            <p className="text-blue-400">@{data.student.nickname}</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-32 bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
              <div className="flex justify-center mb-1"><Trophy className="text-blue-400 w-6 h-6" /></div>
              <div className="text-xl font-bold">{data.student.total_xp}</div>
              <div className="text-xs text-slate-400">Опыт (XP)</div>
            </div>
            <div className="flex-1 md:w-32 bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
              <div className="flex justify-center mb-1"><Coins className="text-cyan-400 w-6 h-6" /></div>
              <div className="text-xl font-bold">{data.student.coin_balance}</div>
              <div className="text-xs text-slate-400">Монеты</div>
            </div>
            <div className="flex-1 md:w-32 bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700/50">
              <div className="flex justify-center mb-1"><Award className="text-amber-400 w-6 h-6" /></div>
              <div className="text-xl font-bold">#{data.student.global_rank}</div>
              <div className="text-xs text-slate-400">В рейтинге</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Groups */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="text-blue-400 w-5 h-5" /> Текущие курсы
            </h3>
            {data.groups.length > 0 ? (
              data.groups.map((g, i) => (
                <div key={i} className="glass-card p-4">
                  <div className="font-semibold text-lg">{g.title}</div>
                  <div className="text-sm text-slate-400 mb-3 capitalize">{g.course_type} формат</div>
                  {g.teacher && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {g.teacher.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200">{g.teacher.full_name}</div>
                        <div className="text-xs text-slate-500">Преподаватель</div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">Пока нет активных курсов</p>
            )}
          </div>

          {/* Recent Grades */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Star className="text-amber-400 w-5 h-5" /> Последние оценки
            </h3>
            <div className="glass-card overflow-hidden">
              {data.recent_grades.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {data.recent_grades.map(grade => (
                    <div key={grade.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                      <div>
                        <div className="font-semibold text-white">{grade.lesson_title}</div>
                        <div className="text-sm text-slate-400 mt-0.5">{grade.group_title}</div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {grade.lesson_date ? format(new Date(grade.lesson_date), 'dd MMMM yyyy', { locale: ru }) : 'Дата не указана'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {grade.xp_earned > 0 && (
                          <div className="text-cyan-400 text-sm font-medium">+{grade.xp_earned} XP</div>
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                          ${grade.grade === 5 ? 'bg-cyan-500/20 text-cyan-400' : 
                            grade.grade === 4 ? 'bg-blue-500/20 text-blue-400' : 
                            'bg-amber-500/20 text-amber-400'}
                        `}>
                          {grade.grade}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  Оценок пока нет
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
