import { useState, useEffect } from 'react';
import { getUsers, resetUserPassword, deactivateUser, activateUser, deleteUser } from '../../api/client';
import { Search, Key, UserMinus, UserCheck, Trash2, Phone, Calendar } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function AdminUsers() {
  const toast = useToastStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleResetPassword = async (id) => {
    const pwd = prompt('Введите новый пароль:');
    if (!pwd) return;
    try {
      await resetUserPassword(id, pwd);
      toast.success('Пароль успешно изменен');
    } catch (err) {
      toast.error('Ошибка при смене пароля');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.is_active) {
        if (!window.confirm('Заблокировать пользователя? Он не сможет войти в систему.')) return;
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || err.message || 'Ошибка изменения статуса');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ВНИМАНИЕ! Вы точно хотите навсегда удалить пользователя? Это действие необратимо.')) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка при удалении');
    }
  };

  const handleChangeRole = async (user) => {
    const newRole = window.prompt(`Текущая роль: ${user.role}\nВведите новую роль (student, teacher, manager):`, user.role);
    if (!newRole || newRole === user.role) return;
    if (!['student', 'teacher', 'manager'].includes(newRole)) {
      toast.error('Неверная роль! Допустимы: student, teacher, manager');
      return;
    }
    try {
      // Need to import changeUserRole at the top
      await import('../../api/client').then(m => m.changeUserRole(user.id, newRole));
      toast.success(`Роль изменена на ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка при изменении роли');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) || 
                          u.nickname.toLowerCase().includes(search.toLowerCase()) ||
                          (u.phone && u.phone.includes(search));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Пользователи
          </h1>
          <p className="text-slate-400 text-sm mt-1">Всего зарегистрировано: {users.length}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            <button onClick={() => setRoleFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'all' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Все</button>
            <button onClick={() => setRoleFilter('student')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'student' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Ученики</button>
            <button onClick={() => setRoleFilter('teacher')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'teacher' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Учителя</button>
            <button onClick={() => setRoleFilter('manager')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${roleFilter === 'manager' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>Админы</button>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Поиск..." 
              className="input-premium pl-10 w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredUsers.map(user => (
          <div key={user.id} className="glass-card relative p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300">
            {/* Status indicator glow */}
            <div className={`absolute -top-px left-6 right-6 h-px ${user.is_active ? 'bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500/50 to-transparent'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700/50 text-blue-400 font-bold text-xl shadow-inner">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-lg text-white">{user.full_name}</div>
                  <div className="text-blue-400 text-sm">@{user.nickname}</div>
                </div>
              </div>
              <button 
                onClick={() => handleChangeRole(user)}
                title="Нажмите, чтобы изменить роль"
                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-80 transition-opacity
                  ${user.role === 'manager' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 
                    user.role === 'teacher' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 
                    'bg-slate-700/50 text-slate-300 border border-slate-600/50'}`}>
                  {user.role}
              </button>
            </div>
            
            <div className="space-y-2 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Phone className="w-4 h-4 opacity-60" /> {user.phone || 'Нет телефона'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Calendar className="w-4 h-4 opacity-60" /> Регистрация: {new Date(user.created_at).toLocaleDateString('ru-RU')}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className={`flex items-center gap-2 text-xs font-semibold
                    ${user.is_active ? 'text-cyan-400' : 'text-red-400'}`}>
                    <span className={`h-2 w-2 rounded-full ${user.is_active ? 'bg-cyan-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'}`}></span>
                    {user.is_active ? 'Активен' : 'Заблокирован'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleResetPassword(user.id)} 
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600/50 p-2 rounded-lg transition-colors"
                  title="Изменить пароль"
                >
                  <Key className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleToggleStatus(user)} 
                  className={`p-2 rounded-lg border transition-colors ${
                    user.is_active 
                      ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20' 
                      : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border-cyan-500/20'
                  }`}
                  title={user.is_active ? 'Заблокировать' : 'Разблокировать'}
                >
                  {user.is_active ? <UserMinus className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => handleDelete(user.id)} 
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition-colors"
                  title="Удалить навсегда"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
