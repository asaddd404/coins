import { useState, useEffect } from 'react';
import { getStudentDashboard } from '../../api/client';
import { BookOpen, Calendar, Trophy, User, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SkeletonGrid } from '../../components/Skeleton';

const AnimatedNumber = ({ value }) => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10);
    if (isNaN(end)) return;
    if (start === end) { setCurrent(end); return; }
    
    let totalMilSecDur = 1000;
    let incrementTime = Math.abs(Math.floor(totalMilSecDur / 30));
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 30) || 1;
      if (start >= end) {
        setCurrent(end);
        clearInterval(timer);
      } else {
        setCurrent(start);
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{current}</span>;
};

export default function StudentDashboard() {
  const [data, setData] = useState({ groups: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentDashboard()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-6"><SkeletonGrid count={2} /></div>;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро!';
    if (hour < 18) return 'Добрый день!';
    return 'Добрый вечер!';
  };
  const dayNames = {
    'mon': 'Понедельник',
    'tue': 'Вторник',
    'wed': 'Среда',
    'thu': 'Четверг',
    'fri': 'Пятница',
    'sat': 'Суббота',
    'sun': 'Воскресенье'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400">
            {getGreeting()}
          </h1>
          <p className="text-slate-400 mt-1">Твои текущие группы и прогресс</p>
        </div>
        <Link to="/courses" className="btn-primary text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Найти новые курсы
        </Link>
      </div>

      {data.groups.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 border border-indigo-500/30">
            <BookOpen className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Ты пока не состоишь в группах</h3>
          <p className="text-slate-400 max-w-md mb-6">Перейди в каталог курсов, выбери интересное направление и подай заявку на вступление в группу.</p>
          <Link to="/courses" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.groups.map(g => (
            <div key={g.group_id} className="glass-card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
              <div className="p-6 border-b border-slate-700/50 bg-slate-800/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md mb-2 inline-block">
                      {g.course_title}
                    </span>
                    <h3 className="text-xl font-bold text-white">{g.group_title}</h3>
                  </div>
                  <Link to={`/courses/${g.course_id || ''}`} className="w-10 h-10 bg-slate-800 hover:bg-indigo-500/20 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-400 transition-colors border border-slate-700">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
                
                <div className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Преподаватель</p>
                    <p className="font-medium">{g.teacher_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 glow-indigo">
                  <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold text-sm">Твой рейтинг</span>
                  </div>
                  <div className="text-2xl font-extrabold text-white">
                    {g.rank ? `${g.rank} место` : '-'}
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Уровень {Math.floor(g.total_xp / 50) + 1}</span>
                      <span className="text-indigo-400 font-bold"><AnimatedNumber value={g.total_xp} /> XP</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 border border-slate-700">
                      <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full" style={{ width: `${(g.total_xp % 50) / 50 * 100}%` }}></div>
                    </div>
                    <div className="text-[10px] text-right text-slate-500 mt-1">{50 - (g.total_xp % 50)} XP до след. уровня</div>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 glow-emerald">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="font-bold text-sm">Расписание</span>
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {g.schedules && g.schedules.length > 0 ? (
                      g.schedules.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dayNames[s.day] || s.day}: {s.start}-{s.end}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">Не задано</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
