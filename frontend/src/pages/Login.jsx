import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getMe } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(login, password);
      const tokens = res.data;
      
      // Save tokens temporarily to fetch user
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      const userRes = await getMe();
      setAuth(tokens, userRes.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа. Проверьте данные.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          Acaddem LMS
        </h1>
        <p className="text-slate-400 text-center mb-8">Войдите в свой аккаунт</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Телефон или никнейм</label>
            <input
              type="text"
              required
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="input-premium"
              placeholder="+79990000000 или ivan99"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-slate-400">
          Нет аккаунта? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Зарегистрироваться</Link>
        </p>

        {/* Quick Demo Login */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <p className="text-xs text-center text-slate-500 mb-4 uppercase tracking-widest font-bold">Быстрый вход для демо</p>
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => { setLogin('admin'); setPassword('AcaddemDemo2026!'); }} 
              className="text-xs bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 py-2 rounded-lg border border-purple-500/20 transition-colors"
            >
              Менеджер
            </button>
            <button 
              onClick={() => { setLogin('teacher1'); setPassword('AcaddemDemo2026!'); }} 
              className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 py-2 rounded-lg border border-indigo-500/20 transition-colors"
            >
              Учитель
            </button>
            <button 
              onClick={() => { setLogin('student1'); setPassword('AcaddemDemo2026!'); }} 
              className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 py-2 rounded-lg border border-emerald-500/20 transition-colors"
            >
              Ученик
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
