import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getGroup, getGroupStudents, createLesson, getLessons, createGrade, addStudentToGroup, removeStudentFromGroup, getGroupRanking } from '../../api/client';
import Modal from '../../components/Modal';
import { Trophy, MessageCircle, UserMinus, CheckCircle2 } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function TeacherGroupDetail() {
  const toast = useToastStore();
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  
  // Modals
  const [isAddStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [isLessonModalOpen, setLessonModalOpen] = useState(false);
  const [isGradeModalOpen, setGradeModalOpen] = useState(false);

  // Forms
  const [addStudentId, setAddStudentId] = useState('');
  const [lessonForm, setLessonForm] = useState({ title: '', lesson_date: '' });
  const [gradeForm, setGradeForm] = useState({ student_id: '', lesson_id: '', grade: 5 });

  const fetchData = async () => {
    try {
      const [gRes, sRes, lRes, rRes] = await Promise.all([
        getGroup(id), getGroupStudents(id), getLessons(id), getGroupRanking(id)
      ]);
      setGroup(gRes.data);
      setStudents(sRes.data);
      setLessons(lRes.data);
      setRankings(rRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await addStudentToGroup(id, { nickname_or_phone: addStudentId });
      setAddStudentModalOpen(false);
      setAddStudentId('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка добавления студента');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if(!window.confirm('Точно исключить ученика из группы?')) return;
    try {
      await removeStudentFromGroup(id, studentId);
      fetchData();
    } catch (err) {
      toast.error('Ошибка при удалении');
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    try {
      await createLesson(id, lessonForm);
      setLessonForm({ title: '', lesson_date: '' });
      setLessonModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Ошибка при создании урока');
    }
  };

  const handleCreateGrade = async (e) => {
    e.preventDefault();
    try {
      await createGrade(gradeForm);
      setGradeModalOpen(false);
      setGradeForm({ student_id: '', lesson_id: '', grade: 5 });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка при выставлении оценки');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!group) return <div>Группа не найдена</div>;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-l-4 border-blue-500">
        <h1 className="text-3xl font-bold mb-2 text-white">{group.title}</h1>
        <div className="flex gap-4 text-sm text-slate-400">
          <span>Студентов: {group.current_count}/{group.max_students}</span>
          <span>Статус: {group.is_active ? 'Активна' : 'Закрыта'}</span>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-700/50">
        <button 
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'students' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('students')}
        >
          Студенты
        </button>
        <button 
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'lessons' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('lessons')}
        >
          Уроки
        </button>
        <button 
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === 'rankings' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('rankings')}
        >
          Рейтинг группы
        </button>
      </div>

      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Список студентов</h2>
            <button onClick={() => setAddStudentModalOpen(true)} className="btn-primary text-sm py-2 px-4">
              + Добавить ученика
            </button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.length === 0 ? <p className="text-slate-400">Нет студентов</p> : students.map(s => (
              <div key={s.id} className="glass-card p-4 flex flex-col gap-3">
                <div>
                  <div className="font-bold text-lg text-white">{s.full_name}</div>
                  <div className="text-blue-400 text-sm">@{s.nickname}</div>
                </div>
                {s.phone && (
                  <a 
                    href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center justify-center gap-2 w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium py-2 rounded-xl border border-cyan-500/30 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Написать в WhatsApp
                  </a>
                )}
                <button onClick={() => handleRemoveStudent(s.id)} className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 text-left pt-2 border-t border-slate-700/50 mt-auto">
                  <UserMinus className="w-4 h-4" /> Удалить из группы
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Проведенные уроки</h2>
            <button onClick={() => setLessonModalOpen(true)} className="btn-primary text-sm py-2 px-4">
              + Создать урок
            </button>
          </div>
          
          <div className="space-y-3">
            {lessons.length === 0 ? <p className="text-slate-400">Нет уроков</p> : lessons.map(l => (
              <div key={l.id} className="glass-card p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-l-cyan-500">
                <div>
                  <div className="font-bold text-lg text-white">{l.title}</div>
                  <div className="text-sm text-slate-400">{l.lesson_date || 'Дата не указана'}</div>
                </div>
                <button 
                  onClick={() => {
                    setGradeForm({ student_id: '', lesson_id: l.id, grade: 5 });
                    setGradeModalOpen(true);
                  }}
                  className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-indigo-300 px-4 py-2 rounded-xl transition-colors font-medium whitespace-nowrap flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Оценить класс
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Внутригрупповой топ
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-slate-700/50">
              {rankings.length === 0 ? <p className="p-6 text-slate-400 text-center">Нет данных для рейтинга</p> : rankings.map((r, idx) => (
                <div key={r.user_id} className={`p-4 flex items-center justify-between transition-colors ${idx === 0 ? 'bg-amber-500/10' : idx === 1 ? 'bg-slate-300/10' : idx === 2 ? 'bg-orange-700/10' : 'hover:bg-slate-800/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                      ${idx === 0 ? 'bg-amber-500 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                        idx === 1 ? 'bg-slate-300 text-slate-800' : 
                        idx === 2 ? 'bg-orange-700 text-white' : 
                        'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {r.rank}
                    </div>
                    <div>
                      <div className={`font-bold text-lg ${idx === 0 ? 'text-amber-400' : 'text-white'}`}>{r.full_name}</div>
                      <div className="text-sm text-slate-400">@{r.nickname}</div>
                    </div>
                  </div>
                  <div className="font-extrabold text-xl text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
                    {r.total_xp} <span className="text-xs text-blue-500">XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isAddStudentModalOpen} onClose={() => setAddStudentModalOpen(false)} title="Добавить ученика">
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Никнейм или Номер телефона</label>
            <input required className="input-premium" placeholder="student1 или +7900..." value={addStudentId} onChange={e => setAddStudentId(e.target.value)} />
            <p className="text-xs text-slate-500 mt-2">Ученик должен быть зарегистрирован на платформе.</p>
          </div>
          <button type="submit" className="btn-primary w-full">Добавить</button>
        </form>
      </Modal>

      <Modal isOpen={isLessonModalOpen} onClose={() => setLessonModalOpen(false)} title="Новый урок">
        <form onSubmit={handleCreateLesson} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Тема урока</label>
            <input required className="input-premium" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Дата (YYYY-MM-DD)</label>
            <input className="input-premium" type="date" value={lessonForm.lesson_date} onChange={e => setLessonForm({...lessonForm, lesson_date: e.target.value})} />
          </div>
          <button type="submit" className="btn-primary w-full">Создать</button>
        </form>
      </Modal>

      <Modal isOpen={isGradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Выставить оценку">
        <form onSubmit={handleCreateGrade} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Ученик</label>
            <select required className="input-premium" value={gradeForm.student_id} onChange={e => setGradeForm({...gradeForm, student_id: e.target.value})}>
              <option value="">Выберите ученика</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Оценка (3-5)</label>
            <select required className="input-premium" value={gradeForm.grade} onChange={e => setGradeForm({...gradeForm, grade: parseInt(e.target.value)})}>
              <option value={5}>5 (Отлично) - 2 XP</option>
              <option value={4}>4 (Хорошо) - 1 XP</option>
              <option value={3}>3 (Удовл.) - 0 XP</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Сохранить оценку</button>
        </form>
      </Modal>

    </div>
  );
}
