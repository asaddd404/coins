import { useState, useEffect } from 'react';
import { getMyGrades } from '../../api/client';
import { Coins, Zap, FileText, Star } from 'lucide-react';

export default function MyGrades() {
  const [grades, setGrades] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyGrades()
      .then(res => {
        setGrades(res.data);
        const totalXp = res.data.reduce((sum, g) => sum + g.xp_earned, 0);
        const totalCoins = res.data.reduce((sum, g) => sum + (g.coins_earned || 0), 0);
        setWallet({ total_xp: totalXp, coin_balance: totalCoins || totalXp });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-blue-400">Загрузка оценок...</div></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Мои Оценки</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 bg-gradient-to-br from-indigo-900/30 to-slate-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-sm text-indigo-300 font-medium uppercase tracking-wider">Ваш опыт (XP)</h2>
          </div>
          <div className="text-4xl font-bold text-white">{wallet?.total_xp || 0} <span className="text-lg text-blue-400">XP</span></div>
        </div>
        <div className="glass-card p-6 bg-gradient-to-br from-amber-900/30 to-slate-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-sm text-amber-300 font-medium uppercase tracking-wider">Баланс монет</h2>
          </div>
          <div className="text-4xl font-bold text-white">{wallet?.coin_balance || 0} <span className="text-lg text-amber-400">монет</span></div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold text-white mb-6">История оценок</h2>
        {grades.length > 0 ? (
          <div className="space-y-3">
            {grades.map(g => (
              <div key={g.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${g.grade === 5 ? 'bg-cyan-500/10 border-cyan-500/30' : g.grade === 4 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-700/50 border-slate-600/50'}`}>
                    <Star className={`w-5 h-5 ${g.grade === 5 ? 'text-cyan-400' : g.grade === 4 ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-white">{g.lesson_title || 'Урок'}</h3>
                    <p className="text-sm text-slate-400">{new Date(g.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-500 mb-0.5">Оценка</span>
                    <span className={`text-2xl font-bold ${g.grade === 5 ? 'text-cyan-400' : g.grade === 4 ? 'text-blue-400' : 'text-slate-400'}`}>
                      {g.grade}
                    </span>
                  </div>
                  <div className="w-px h-10 bg-slate-700"></div>
                  <div className="flex flex-col items-end w-16">
                    <span className="text-xs text-amber-400/70 mb-0.5">Опыт</span>
                    <span className="text-lg font-bold text-amber-400">+{g.xp_earned}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            У вас пока нет оценок.
          </div>
        )}
      </div>
    </div>
  );
}
