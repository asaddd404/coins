import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCourse, createEnrollment, getGroupRanking, getGroups } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { getFullUrl } from '../../utils';
import Modal from '../../components/Modal';
import UserProfileModal from '../../components/UserProfileModal';
import { BookOpen, Users, Trophy, Crown, Medal, Award, Send } from 'lucide-react';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const [rankings, setRankings] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const fetchCourse = async () => {
    try {
      const [cRes, gRes] = await Promise.all([getCourse(id), getGroups({ course_id: id })]);
      const courseData = cRes.data;
      courseData.groups = gRes.data;
      setCourse(courseData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourse(); }, [id]);

  const handleEnroll = async (groupId) => {
    setEnrolling(true);
    try {
      await createEnrollment({ group_id: groupId });
      alert('Заявка успешно отправлена!');
      fetchCourse();
    } catch (e) {
      alert(e.response?.data?.detail || 'Ошибка отправки заявки');
    } finally {
      setEnrolling(false);
    }
  };

  const openRanking = async (group) => {
    setSelectedGroup(group);
    setRankingModalOpen(true);
    try {
      const res = await getGroupRanking(group.id);
      setRankings(res.data);
    } catch (err) {
      console.error(err);
      setRankings([]);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-indigo-400">Загрузка курса...</div></div>;
  if (!course) return <div className="text-center py-12 text-slate-400">Курс не найден</div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {course.image_url ? (
            <img src={getFullUrl(course.image_url)} alt={course.title} className="w-full md:w-64 h-48 object-cover rounded-xl" />
          ) : (
            <div className="w-full md:w-64 h-48 bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <BookOpen className="w-16 h-16" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${course.course_type === 'online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {course.course_type === 'online' ? 'Онлайн курс' : 'Оффлайн курс'}
            </span>
            <p className="text-slate-300 text-lg">{course.description}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Доступные группы</h2>
        {course.groups && course.groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.groups.map(g => (
              <div key={g.id} className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-indigo-400 mb-1">{g.title}</h3>
                  <p className="text-slate-400 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> Преподаватель: {g.teacher_name || 'Не назначен'}
                  </p>
                  <div className="flex justify-between items-center text-sm mb-4">
                    <span className="text-slate-300">Мест: {g.current_count} / {g.max_students}</span>
                    <button 
                      onClick={() => openRanking(g)} 
                      className="text-amber-400 flex items-center gap-1 hover:text-amber-300 transition-colors bg-amber-500/10 px-2.5 py-1.5 rounded-lg border border-amber-500/20 text-xs font-bold"
                    >
                      <Trophy className="w-3.5 h-3.5" /> Рейтинг
                    </button>
                  </div>
                </div>
                {user?.role === 'student' && (
                  <button 
                    onClick={() => handleEnroll(g.id)}
                    disabled={enrolling || g.current_count >= g.max_students}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium rounded-xl transition-colors mt-auto flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {g.current_count >= g.max_students ? 'Мест нет' : 'Подать заявку'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">Для этого курса пока нет доступных групп.</p>
        )}
      </div>

      <Modal isOpen={rankingModalOpen} onClose={() => setRankingModalOpen(false)} title={`Рейтинг группы: ${selectedGroup?.title}`}>
        <div className="divide-y divide-slate-700/50 max-h-[60vh] overflow-y-auto">
          {rankings.length === 0 ? <p className="py-4 text-center text-slate-400">Нет оценок в этой группе</p> : rankings.map((r, idx) => (
            <div key={r.user_id} className={`p-4 flex items-center justify-between transition-colors ${idx === 0 ? 'bg-amber-500/10' : idx === 1 ? 'bg-slate-300/10' : idx === 2 ? 'bg-orange-700/10' : 'hover:bg-slate-800/30'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                  ${idx === 0 ? 'bg-amber-500 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                    idx === 1 ? 'bg-slate-300 text-slate-800' : 
                    idx === 2 ? 'bg-orange-700 text-white' : 
                    'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                  {idx === 0 ? <Crown className="w-4 h-4" /> : idx === 1 ? <Medal className="w-4 h-4" /> : idx === 2 ? <Award className="w-4 h-4" /> : r.rank}
                </div>
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedUserId(r.user_id)}
                >
                  <div className={`font-bold text-lg ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>{r.full_name}</div>
                  <div className="text-sm text-slate-400">@{r.nickname}</div>
                </div>
              </div>
              <div className="font-extrabold text-xl text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                {r.total_xp} <span className="text-xs text-indigo-500">XP</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <UserProfileModal 
        isOpen={!!selectedUserId} 
        onClose={() => setSelectedUserId(null)} 
        userId={selectedUserId} 
      />
    </div>
  );
}
