import { useState, useEffect } from 'react';
import { getUser } from '../api/client';
import Modal from './Modal';
import { Award, Phone, Wallet, Crown, Shield } from 'lucide-react';
import { getFullUrl } from '../utils';

export default function UserProfileModal({ isOpen, onClose, userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getUser(userId)
        .then(res => setProfile(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setProfile(null);
    }
  }, [isOpen, userId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Профиль пользователя">
      {loading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-pulse text-indigo-400">Загрузка профиля...</div>
        </div>
      ) : profile ? (
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white font-bold mb-4 shadow-lg shadow-indigo-500/30 border-4 border-slate-800">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-white text-center flex items-center gap-2">
              {profile.full_name}
              {profile.role === 'manager' && <Crown className="w-5 h-5 text-amber-400" />}
              {profile.role === 'teacher' && <Shield className="w-5 h-5 text-emerald-400" />}
            </h2>
            <p className="text-slate-400 mt-1">@{profile.nickname}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
              <Award className="w-6 h-6 text-indigo-400 mb-2" />
              <div className="text-2xl font-black text-white">{profile.total_xp}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Опыт (XP)</div>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col items-center">
              <Wallet className="w-6 h-6 text-amber-400 mb-2" />
              <div className="text-2xl font-black text-white">{profile.coin_balance}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Монеты</div>
            </div>
          </div>

          <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="w-5 h-5 text-slate-500" />
              {profile.phone ? (
                <a href={profile.whatsapp_url} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  {profile.phone}
                </a>
              ) : (
                <span className="italic text-slate-500">Телефон не указан</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 flex items-center justify-center text-slate-500 font-bold">R</div>
              <span className="capitalize">{
                profile.role === 'manager' ? 'Менеджер' : 
                profile.role === 'teacher' ? 'Преподаватель' : 'Ученик'
              }</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400">Профиль не найден</div>
      )}
    </Modal>
  );
}
