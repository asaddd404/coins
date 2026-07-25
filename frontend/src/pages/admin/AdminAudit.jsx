import { useState, useEffect } from 'react';
import { getAuditLog, cancelGrade } from '../../api/client';
import Modal from '../../components/Modal';
import { History, XCircle, Search, Calendar, User, UserCheck, CheckCircle2 } from 'lucide-react';
export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState(null);

  const loadData = () => {
    getAuditLog().then(res => setLogs(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCancelModal = (gradeId) => {
    setSelectedGradeId(gradeId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancelGrade = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    try {
      await cancelGrade(selectedGradeId, { reason: cancelReason });
      setCancelModalOpen(false);
      alert('Оценка отменена, опыт и монеты вычтены.');
      loadData();
    } catch (e) {
      alert(e.response?.data?.detail || 'Ошибка');
    }
  };

  const filteredLogs = logs.filter(l => 
    l.student_name.toLowerCase().includes(search.toLowerCase()) || 
    l.teacher_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-12"><div className="animate-pulse text-indigo-400">Загрузка...</div></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Аудит оценок
          </h1>
          <p className="text-slate-400 text-sm mt-1">Журнал всех выставленных и отмененных оценок</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Поиск по именам..." 
            className="input-premium pl-10 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredLogs.map(log => (
          <div key={log.id} className="glass-card p-5 relative overflow-hidden group">
            {log.action === 'cancelled' && (
              <div className="absolute inset-0 bg-red-900/10 pointer-events-none z-0"></div>
            )}
            
            <div className="flex justify-between items-start relative z-10 mb-4">
              <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded border ${
                log.action === 'created' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                log.action === 'updated' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 
                'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {log.action === 'created' ? 'Выставлена' : log.action === 'updated' ? 'Изменена' : 'Отменена'}
              </span>
              <div className="text-right">
                <div className="text-xs text-slate-300 flex items-center justify-end gap-1 mb-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(log.created_at).toLocaleDateString('ru-RU')}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{log.ip_address}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Учитель</div>
                <div className="text-sm font-medium text-indigo-300 truncate">{log.teacher_name}</div>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Ученик</div>
                <div className="text-sm font-medium text-emerald-300 truncate">{log.student_name}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Оценка:</span>
                <span className="text-xl font-black text-white">{log.grade_value}</span>
              </div>
              
              {log.action !== 'cancelled' ? (
                <button 
                  onClick={() => openCancelModal(log.grade_id)} 
                  className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Отменить
                </button>
              ) : (
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Отменено
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 glass-card">
            <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
            Нет логов аудита
          </div>
        )}
      </div>

      <Modal isOpen={isCancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Причина отмены оценки">
        <form onSubmit={confirmCancelGrade} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Укажите причину отмены оценки:</label>
            <input 
              required 
              className="input-premium" 
              placeholder="Например: ошибочный ввод" 
              value={cancelReason} 
              onChange={e => setCancelReason(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-primary w-full bg-red-500 hover:bg-red-600 shadow-red-500/20">
            Подтвердить отмену
          </button>
        </form>
      </Modal>
    </div>
  );
}
