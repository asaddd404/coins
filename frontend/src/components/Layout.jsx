import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { 
  Menu, X, Bell, Home, BookOpen, GraduationCap, Award, Users, 
  FileText, ShoppingBag, ShoppingCart, ShieldCheck, LogOut, Check, CheckCheck, Trash
} from 'lucide-react';

const navLinkClass = ({ isActive }) => 
  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
    isActive 
      ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 shadow-sm' 
      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
  }`;

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { notifications, unreadCount, fetch: fetchNotifs, markRead: markNotifRead, markAllRead, clearAll } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const intervalRef = useRef(null);

  // Fetch notifications & start polling
  useEffect(() => {
    fetchNotifs();
    intervalRef.current = setInterval(fetchNotifs, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  // Close notification panel on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    logout();
    navigate('/login');
  };

  const handleMarkRead = async (id) => {
    await markNotifRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };
  
  const handleClearAll = async () => {
    if (window.confirm("Удалить все уведомления?")) {
      await clearAll();
    }
  };

  const NotificationBell = ({ className = '' }) => (
    <button 
      onClick={() => setIsNotifOpen(!isNotifOpen)} 
      className={`relative p-2.5 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 ${className}`}
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-pulse-glow border-2 border-slate-900 font-bold">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );

  const NotificationPanel = () => (
    <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-[100]">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
        <h3 className="text-sm font-bold text-white">Уведомления</h3>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" /> Прочитать все
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={handleClearAll} className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1">
              <Trash className="w-3.5 h-3.5" /> Очистить
            </button>
          )}
        </div>
      </div>
      <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-800">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-slate-500 text-sm">Нет уведомлений</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                n.is_read ? 'opacity-60 hover:opacity-80' : 'hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-start gap-3">
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />}
                <div className={!n.is_read ? '' : 'pl-5'}>
                  <div className="text-sm font-medium text-white">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{new Date(n.created_at).toLocaleString('ru-RU')}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-slate-100 flex flex-col md:flex-row bg-[#0B0F19]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="text-xl font-black bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          Acaddem
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={isNotifOpen ? notifRef : undefined}>
            <NotificationBell />
            {isNotifOpen && <NotificationPanel />}
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-300 hover:text-white p-2 rounded-xl bg-slate-800/50 border border-slate-700/50"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-72 bg-slate-900/95 md:bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl z-[60] transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Acaddem
          </div>
          <button 
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {user?.role === 'student' && (
            <NavLink to="/dashboard" className={navLinkClass}>
              <Home className="w-5 h-5 text-indigo-400 shrink-0" /> Главная
            </NavLink>
          )}
          
          <NavLink to="/courses" className={navLinkClass}>
            <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" /> Каталог Курсов
          </NavLink>

          {user?.role === 'student' && (
            <>
              <NavLink to="/grades" className={navLinkClass}>
                <GraduationCap className="w-5 h-5 text-purple-400 shrink-0" /> Мои Оценки
              </NavLink>
              <NavLink to="/store" className={navLinkClass}>
                <ShoppingBag className="w-5 h-5 text-amber-400 shrink-0" /> Магазин Наград
              </NavLink>
            </>
          )}

          {user?.role === 'teacher' && (
            <>
              <NavLink to="/teacher/groups" className={navLinkClass}>
                <Users className="w-5 h-5 text-indigo-400 shrink-0" /> Мои Группы
              </NavLink>
              <NavLink to="/enrollments" className={navLinkClass}>
                <FileText className="w-5 h-5 text-emerald-400 shrink-0" /> Заявки учеников
              </NavLink>
            </>
          )}

          {user?.role === 'manager' && (
            <>
              <div className="pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4">Управление</div>
              <NavLink to="/admin/users" className={navLinkClass}>
                <Users className="w-5 h-5 text-purple-400 shrink-0" /> Пользователи
              </NavLink>
              <NavLink to="/admin/courses" className={navLinkClass}>
                <BookOpen className="w-5 h-5 text-purple-400 shrink-0" /> Управление Курсами
              </NavLink>
              <NavLink to="/enrollments" className={navLinkClass}>
                <FileText className="w-5 h-5 text-emerald-400 shrink-0" /> Заявки учеников
              </NavLink>
              <NavLink to="/admin/store" className={navLinkClass}>
                <ShoppingBag className="w-5 h-5 text-amber-400 shrink-0" /> Склад Магазина
              </NavLink>
              <NavLink to="/admin/purchases" className={navLinkClass}>
                <ShoppingCart className="w-5 h-5 text-amber-400 shrink-0" /> Заказы
              </NavLink>
              <NavLink to="/admin/audit" className={navLinkClass}>
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" /> Аудит Оценок
              </NavLink>
            </>
          )}

          <div className="pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-4">Сообщество</div>
          <NavLink to="/rankings" className={navLinkClass}>
            <Award className="w-5 h-5 text-amber-400 shrink-0" /> Глобальный Рейтинг
          </NavLink>
        </nav>
        
        <div className="p-5 border-t border-slate-700/50 bg-slate-900/80">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30 text-lg">
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate">{user?.full_name}</div>
              <div className="text-xs text-slate-400 capitalize">{user?.role === 'manager' ? 'Менеджер' : user?.role === 'teacher' ? 'Учитель' : 'Ученик'}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-medium py-2.5 rounded-xl transition-colors">
            <LogOut className="w-4 h-4" /> Выйти
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-0 w-full min-h-screen">
        <header className="hidden md:flex justify-end mb-8 relative" ref={notifRef}>
          <NotificationBell />
          {isNotifOpen && <NotificationPanel />}
        </header>
        <Outlet />
      </main>
    </div>
  );
}
