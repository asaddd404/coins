import { useState, useEffect } from 'react';
import { getStoreItems, purchaseItem } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { getFullUrl } from '../../utils';
import { Gift, Coins, ShoppingCart, Package } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function Store() {
  const toast = useToastStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const { user } = useAuthStore();

  const fetchItems = () => {
    getStoreItems().then(res => setItems(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handlePurchase = async (item) => {
    if (!window.confirm(`Вы уверены, что хотите купить "${item.title}" за ${item.price} монет?`)) return;
    
    setPurchasing(true);
    try {
      await purchaseItem({ item_id: item.id });
      toast.success('Покупка успешна! Монеты списаны. Менеджер свяжется с вами для выдачи товара.');
      fetchItems();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Ошибка при покупке. Возможно, не хватает монет или товара нет в наличии.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-amber-400">Загрузка магазина...</div></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Магазин наград</h1>
          <p className="text-slate-400 text-sm mt-1">Обменивай заработанные монеты на призы</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(item => (
          <div key={item.id} className="glass-card overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300 group">
            {item.image_url ? (
              <img src={getFullUrl(item.image_url)} alt={item.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center">
                <Gift className="w-12 h-12 text-amber-400/60" />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
              <p className="text-slate-400 text-sm mb-4 flex-1">{item.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-2xl text-amber-400 flex items-center gap-1.5">
                  <Coins className="w-5 h-5" /> {item.price}
                </div>
                <div className="text-sm text-slate-300 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-slate-500" /> {item.stock} шт.
                </div>
              </div>

              {user?.role === 'student' && (
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={purchasing || item.stock <= 0}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {item.stock <= 0 ? 'Нет в наличии' : 'Купить'}
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="col-span-full text-slate-400 text-center py-12 glass-card">Магазин пока пуст</div>}
      </div>
    </div>
  );
}
