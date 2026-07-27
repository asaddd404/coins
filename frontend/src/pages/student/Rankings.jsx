import { useState, useEffect } from 'react';
import { getGlobalRanking } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import UserProfileModal from '../../components/UserProfileModal';
import { Trophy, Crown, Medal, Award } from 'lucide-react';
import { SkeletonGrid } from '../../components/Skeleton';

export default function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    getGlobalRanking().then(res => setRankings(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12"><SkeletonGrid count={4} className="flex flex-col gap-4" /></div>;

  const RankBadge = ({ index }) => {
    if (index === 0) return (
      <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
        <Crown className="w-5 h-5 text-amber-900" />
      </div>
    );
    if (index === 1) return (
      <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center">
        <Medal className="w-5 h-5 text-slate-700" />
      </div>
    );
    if (index === 2) return (
      <div className="w-10 h-10 rounded-full bg-orange-700 flex items-center justify-center">
        <Award className="w-5 h-5 text-white" />
      </div>
    );
    return (
      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
        <span className="text-slate-400 font-bold text-sm">{index + 1}</span>
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500 inline-flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" /> Глобальный рейтинг
        </h1>
      </div>
      
      <div className="glass-card p-2 md:p-6">
        
        {/* Podium for Top 3 */}
        {rankings.length >= 3 && (
          <div className="flex justify-center items-end gap-2 md:gap-6 mb-12 h-48 mt-8">
            {/* Silver */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-300 mb-2 border-2 border-slate-400 cursor-pointer" onClick={() => setSelectedUserId(rankings[1].user_id)}>
                {rankings[1].nickname?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-sm font-bold text-white mb-1 truncate w-20 text-center">{rankings[1].nickname}</div>
              <div className="text-xs text-slate-400 font-bold mb-2">{rankings[1].total_xp} XP</div>
              <div className="w-20 h-28 bg-gradient-to-t from-slate-400/5 to-slate-400/20 border-t border-x border-slate-400/30 rounded-t-lg flex justify-center pt-2">
                <Medal className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            
            {/* Gold */}
            <div className="flex flex-col items-center animate-slide-up z-10" style={{ animationDelay: '0.1s' }}>
              <Crown className="w-8 h-8 text-amber-400 mb-1 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-300 mb-2 border-4 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] cursor-pointer" onClick={() => setSelectedUserId(rankings[0].user_id)}>
                {rankings[0].nickname?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-base font-bold text-white mb-1 truncate w-24 text-center">{rankings[0].nickname}</div>
              <div className="text-sm text-amber-400 font-bold mb-2">{rankings[0].total_xp} XP</div>
              <div className="w-24 h-40 bg-gradient-to-t from-amber-500/10 to-amber-500/30 border-t border-x border-amber-500/50 rounded-t-lg flex justify-center pt-2 shadow-[0_-10px_20px_rgba(251,191,36,0.1)]">
                <span className="text-2xl font-black text-amber-400/50">1</span>
              </div>
            </div>
            
            {/* Bronze */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-slate-300 mb-2 border-2 border-orange-700 cursor-pointer" onClick={() => setSelectedUserId(rankings[2].user_id)}>
                {rankings[2].nickname?.charAt(0)?.toUpperCase()}
              </div>
              <div className="text-sm font-bold text-white mb-1 truncate w-20 text-center">{rankings[2].nickname}</div>
              <div className="text-xs text-slate-400 font-bold mb-2">{rankings[2].total_xp} XP</div>
              <div className="w-20 h-20 bg-gradient-to-t from-orange-700/5 to-orange-700/20 border-t border-x border-orange-700/30 rounded-t-lg flex justify-center pt-2">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {rankings.map((r, index) => {
            if (rankings.length >= 3 && index < 3) return null; // Skip top 3 if podium is shown
            const isCurrentUser = r.user_id === user?.id;
            let rowStyle = "bg-slate-800/50 border-slate-700/50";

            if (index === 0) {
              rowStyle = "bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]";
            } else if (index === 1) {
              rowStyle = "bg-gradient-to-r from-slate-400/20 to-slate-400/5 border-slate-400/30";
            } else if (index === 2) {
              rowStyle = "bg-gradient-to-r from-amber-700/30 to-amber-700/5 border-amber-700/30";
            }

            if (isCurrentUser) {
              rowStyle += " ring-2 ring-blue-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]";
            }

            return (
              <div 
                key={r.user_id} 
                className={`flex items-center p-4 rounded-xl border transition-all animate-slide-up ${rowStyle}`}
                style={{ animationDelay: `${(index - 2) * 0.05}s`, animationFillMode: 'both' }}
              >
                <div className="flex items-center justify-center w-12 mr-4">
                  <RankBadge index={index} />
                </div>
                
                <div 
                  className="flex-1 flex items-center gap-4 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedUserId(r.user_id)}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-300 shrink-0">
                    {r.nickname?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 truncate">
                      {r.nickname}
                      {isCurrentUser && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30 shrink-0">Вы</span>}
                    </h3>
                    <p className="text-sm text-slate-400 truncate">{r.full_name}</p>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <div className="text-2xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                    {r.total_xp} <span className="text-sm font-medium">XP</span>
                  </div>
                </div>
              </div>
            );
          })}
          {rankings.length === 0 && (
            <div className="text-center text-slate-400 py-10">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              Рейтинг пуст
            </div>
          )}
        </div>
      </div>

      <UserProfileModal 
        isOpen={!!selectedUserId} 
        onClose={() => setSelectedUserId(null)} 
        userId={selectedUserId} 
      />
    </div>
  );
}
