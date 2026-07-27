import { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse, getGroups, createGroup, updateGroup, deleteGroup, getUsers } from '../../api/client';
import Modal from '../../components/Modal';
import ImageUpload from '../../components/ImageUpload';
import { Book, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function AdminCourses() {
  const toast = useToastStore();
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  
  // Modals state
  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const [isGroupModalOpen, setGroupModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);

  // Forms
  const [courseForm, setCourseForm] = useState({ title: '', description: '', course_type: 'online', image_url: '' });
  const [groupForm, setGroupForm] = useState({ course_id: '', teacher_id: '', title: '', max_students: 15 });

  const fetchData = async () => {
    try {
      const [cRes, gRes, tRes] = await Promise.all([getCourses(), getGroups(), getUsers({ role: 'teacher' })]);
      setCourses(cRes.data);
      setGroups(gRes.data);
      setTeachers(tRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, courseForm);
      } else {
        await createCourse(courseForm);
      }
      setCourseModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Ошибка при сохранении курса');
    }
  };

  const handleDeleteCourse = async (id) => {
    if(!window.confirm('Удалить курс?')) return;
    try {
      await deleteCourse(id);
      fetchData();
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, groupForm);
      } else {
        await createGroup({...groupForm, schedules: []});
      }
      setGroupModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Ошибка при сохранении группы');
    }
  };

  const handleDeleteGroup = async (id) => {
    if(!window.confirm('Удалить группу?')) return;
    try {
      await deleteGroup(id);
      fetchData();
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  const openCourseModal = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseForm({ title: course.title, description: course.description, course_type: course.course_type, image_url: course.image_url || '' });
    } else {
      setEditingCourse(null);
      setCourseForm({ title: '', description: '', course_type: 'online', image_url: '' });
    }
    setCourseModalOpen(true);
  };

  const openGroupModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({ title: group.title, max_students: group.max_students, course_id: group.course_id, teacher_id: group.teacher_id });
    } else {
      setEditingGroup(null);
      setGroupForm({ course_id: courses[0]?.id || '', teacher_id: '', title: '', max_students: 15 });
    }
    setGroupModalOpen(true);
  };

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Каталог курсов
          </h1>
          <p className="text-slate-400 text-sm mt-1">Управляйте курсами и потоками</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => openCourseModal()} className="btn-primary py-2 px-4 flex-1 md:flex-none">
            + Курс
          </button>
          <button onClick={() => openGroupModal()} className="bg-emerald-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-xl transition-colors shadow-lg flex-1 md:flex-none">
            + Группа
          </button>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Поиск курсов..." 
        className="input-premium max-w-md w-full"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCourses.map(course => {
          const courseGroups = groups.filter(g => g.course_id === course.id);
          return (
            <div key={course.id} className="glass-card overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_-15px_rgba(99,102,241,0.3)]">
              {course.image_url && (
                <div className="h-32 w-full overflow-hidden border-b border-slate-700/50">
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div 
                className="p-6 flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
              >
                <div className="flex items-center gap-4">
                  {!course.image_url && (
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                      <Book className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{course.title}</h3>
                    <p className="text-slate-400 text-sm">{course.course_type === 'online' ? 'Онлайн формат' : 'Оффлайн формат'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openCourseModal(course); }} className="text-slate-400 hover:text-blue-400 p-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="text-slate-400 hover:text-red-400 p-2 bg-slate-800 rounded-lg border border-slate-700 hover:border-red-500/50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="ml-2 text-slate-500">
                    {expandedCourse === course.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>
              
              {expandedCourse === course.id && (
                <div className="px-6 pb-6 border-t border-slate-700/50 pt-4 bg-slate-900/30">
                  <h4 className="font-semibold text-sm mb-3 text-slate-300">Группы ({courseGroups.length}):</h4>
                  <div className="flex flex-col gap-3">
                    {courseGroups.length === 0 ? <p className="text-slate-500 text-sm">Нет групп</p> : courseGroups.map(g => (
                      <div key={g.id} className="bg-slate-800/80 rounded-lg p-3 flex justify-between items-center text-sm border border-slate-700 hover:border-slate-600 transition-colors">
                        <div>
                          <div className="font-medium text-cyan-400">{g.title}</div>
                          <div className="text-xs text-slate-400">Препод: {g.teacher_name}</div>
                          <div className="text-xs text-slate-500">{g.current_count}/{g.max_students} мест</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openGroupModal(g)} className="text-slate-500 hover:text-blue-400 p-1.5 bg-slate-900 rounded-md">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteGroup(g.id)} className="text-slate-500 hover:text-red-400 p-1.5 bg-slate-900 rounded-md">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Course Modal */}
      <Modal isOpen={isCourseModalOpen} onClose={() => setCourseModalOpen(false)} title={editingCourse ? "Редактировать курс" : "Новый курс"}>
        <form onSubmit={handleCourseSubmit} className="space-y-4">
          <ImageUpload 
            value={courseForm.image_url} 
            onChange={(url) => setCourseForm({...courseForm, image_url: url})} 
          />
          <div>
            <label className="block text-sm text-slate-300 mb-1">Название</label>
            <input required className="input-premium" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Описание</label>
            <textarea required className="input-premium h-24" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Формат</label>
            <select className="input-premium" value={courseForm.course_type} onChange={e => setCourseForm({...courseForm, course_type: e.target.value})}>
              <option value="online">Онлайн</option>
              <option value="offline">Оффлайн</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Сохранить</button>
        </form>
      </Modal>

      {/* Group Modal */}
      <Modal isOpen={isGroupModalOpen} onClose={() => setGroupModalOpen(false)} title={editingGroup ? "Редактировать группу" : "Новая группа"}>
        <form onSubmit={handleGroupSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Курс</label>
            <select required className="input-premium" value={groupForm.course_id} onChange={e => setGroupForm({...groupForm, course_id: e.target.value})}>
              <option value="">Выберите курс</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Преподаватель</label>
            <select required className="input-premium" value={groupForm.teacher_id} onChange={e => setGroupForm({...groupForm, teacher_id: e.target.value})}>
              <option value="">Выберите преподавателя</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name} (@{t.nickname})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Название группы (Поток)</label>
            <input required className="input-premium" value={groupForm.title} onChange={e => setGroupForm({...groupForm, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Кол-во мест</label>
            <input required type="number" className="input-premium" value={groupForm.max_students} onChange={e => setGroupForm({...groupForm, max_students: parseInt(e.target.value)})} />
          </div>
          <button type="submit" className="btn-primary w-full">Сохранить</button>
        </form>
      </Modal>

    </div>
  );
}
