import { useState, useEffect } from 'react';
import { getPurchases, deliverPurchase, cancelPurchase } from '../../api/client';
import { User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function AdminPurchases() {
  const toast = useToastStore();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, delivered, cancelled

  const fetchPurchases = async () => {
    try {
      const res = await getPurchases();
      setPurchases(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, []);

  const handleDeliver = async (id) => {
    try {
      await deliverPurchase(id);
      fetchPurchases();
    } catch (err) {
      toast.error('Ошибка при выдаче');
    }
  };

  const handleCancel = async (id) => {
    if(!window.confirm('Точно отменить заявку? Монеты будут возвращены студенту.')) return;
    try {
      await cancelPurchase(id);
      fetchPurchases();
    } catch (err) {
      toast.error('Ошибка при отмене');
    }
  };

  if (loading) return <div className="text-center p-10 text-slate-400">Загрузка...</div>;

  const pending = purchases.filter(p => p.status === 'pending_delivery');
  const delivered = purchases.filter(p => p.status === 'delivered');
  const cancelled = purchases.filter(p => p.status === 'cancelled');

  let currentList = [];
  if (activeTab === 'pending') currentList = pending;
  if (activeTab === 'delivered') currentList = delivered;
  if (activeTab === 'cancelled') currentList = cancelled;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            Управление заказами
          </h1>
          <p className="text-slate-400 text-sm mt-1">Отслеживайте выдачу мерча студентам</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700/50 pb-4">
        <button 
          className={`px-4 py-2 font-bold rounded-xl transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          onClick={() => setActiveTab('pending')}
        >
          Ожидают выдачи <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>{pending.length}</span>
        </button>
        <button 
          className={`px-4 py-2 font-bold rounded-xl transition-colors flex items-center gap-2 ${activeTab === 'delivered' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          onClick={() => setActiveTab('delivered')}
        >
          Выдано <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'delivered' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>{delivered.length}</span>
        </button>
        <button 
          className={`px-4 py-2 font-bold rounded-xl transition-colors flex items-center gap-2 ${activeTab === 'cancelled' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Отменено <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'cancelled' ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'}`}>{cancelled.length}</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-4">
        {currentList.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 glass-card">
            В этой категории нет заявок
          </div>
        ) : currentList.map(purchase => (
          <div key={purchase.id} className="glass-card p-5 flex flex-col gap-4 group relative overflow-hidden">
            {/* Background glow based on status */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-20 rounded-full ${
              purchase.status === 'pending_delivery' ? 'bg-amber-500' : 
              purchase.status === 'delivered' ? 'bg-cyan-500' : 'bg-red-500'
            }`}></div>

            <div className="flex justify-between items-start relative z-10">
              <div className="font-bold text-lg text-white pr-4">{purchase.item_title || 'Удаленный товар'}</div>
              <div className="bg-slate-900/80 px-2 py-1 rounded font-bold text-amber-400 text-sm whitespace-nowrap border border-amber-500/20">
                {purchase.price_paid} 🪙
              </div>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-sm space-y-1.5 relative z-10">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4 text-slate-500" /> {purchase.student_name || 'Неизвестный'}
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock className="w-4 h-4 text-slate-500" /> {new Date(purchase.created_at).toLocaleString('ru-RU')}
              </div>
            </div>

            {/* Actions for pending only */}
            {purchase.status === 'pending_delivery' && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2 mt-auto relative z-10">
                <button 
                  onClick={() => handleDeliver(purchase.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> Выдать
                </button>
                <button 
                  onClick={() => handleCancel(purchase.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold py-2 px-3 rounded-xl transition-all active:scale-95"
                >
                  <XCircle className="w-4 h-4" /> Отменить
                </button>
              </div>
            )}
            
            {purchase.status === 'delivered' && (
               <div className="pt-2 mt-auto text-cyan-400 font-bold text-sm text-center relative z-10 flex items-center justify-center gap-2">
                 <CheckCircle2 className="w-4 h-4" /> Успешно выдано
               </div>
            )}

            {purchase.status === 'cancelled' && (
               <div className="pt-2 mt-auto text-red-400 font-bold text-sm text-center relative z-10 flex items-center justify-center gap-2">
                 <XCircle className="w-4 h-4" /> Заявка отменена
               </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
