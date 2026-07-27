import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, getMe } from '../api/client';
import { useToastStore } from '../store/toastStore';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const toast = useToastStore();
  const [formData, setFormData] = useState({ phone: '', nickname: '', full_name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.phone) delete payload.phone;
      
      const res = await registerUser(payload);
      const tokens = res.data;
      
      // Auto-login: save tokens and fetch user
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      const userRes = await getMe();
      setAuth(tokens, userRes.data);
      
      toast.success('Добро пожаловать в Zaytuna Coin! 🎉');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 relative">
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="glass-card w-full max-w-md p-8 animate-fade-in relative z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <span className="text-white font-black text-lg">Z</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Регистрация</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">Создайте аккаунт в Zaytuna Coin</p>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">ФИО</label>
            <input
              type="text" required
              value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Никнейм (уникальный)</label>
            <input
              type="text" required
              value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Телефон (опционально)</label>
            <input
              type="text"
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="input-premium"
              placeholder="+79990000000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Пароль</label>
            <input
              type="password" required
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="input-premium"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-400">
          Уже есть аккаунт? <Link to="/login" className="text-blue-400 hover:text-blue-300">Войти</Link>
        </p>
      </div>
    </div>
  );
}
