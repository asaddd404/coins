import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../../api/client';
import { getFullUrl } from '../../utils';
import { BookOpen, Wifi, MapPin } from 'lucide-react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then(res => {
      setCourses(res.data);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-blue-400">Загрузка курсов...</div></div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Каталог курсов</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(c => (
          <div key={c.id} className="glass-card overflow-hidden hover:scale-[1.02] transition-transform duration-300 group">
            {c.image_url ? (
              <img src={getFullUrl(c.image_url)} alt={c.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-blue-400/60" />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-white">{c.title}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 shrink-0 ${c.course_type === 'online' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {c.course_type === 'online' ? <><Wifi className="w-3 h-3" /> Онлайн</> : <><MapPin className="w-3 h-3" /> Оффлайн</>}
                </span>
              </div>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">{c.description}</p>
              <Link to={`/courses/${c.id}`} className="block text-center w-full py-2.5 bg-blue-600/80 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors">
                Подробнее
              </Link>
            </div>
          </div>
        ))}
        {courses.length === 0 && <div className="col-span-full text-slate-400 text-center py-12 glass-card">Нет доступных курсов</div>}
      </div>
    </div>
  );
}
