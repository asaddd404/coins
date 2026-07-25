import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/client';
import { useToastStore } from '../store/toastStore';

export default function Register() {
  const toast = useToastStore();
  const [formData, setFormData] = useState({ phone: '', nickname: '', full_name: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.phone) delete payload.phone;
      
      await registerUser(payload);
      toast.success('Регистрация успешна! Вы можете войти в свой аккаунт.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Регистрация</h1>
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
          Уже есть аккаунт? <Link to="/login" className="text-indigo-400">Войти</Link>
        </p>
      </div>
    </div>
  );
}
