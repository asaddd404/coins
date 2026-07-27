import { useState, useEffect } from 'react';
import { getStoreItems, createStoreItem, updateStoreItem, deleteStoreItem } from '../../api/client';
import Modal from '../../components/Modal';
import ImageUpload from '../../components/ImageUpload';
import { getFullUrl } from '../../utils';
import { Package, Edit2, Trash2, Box, Coins } from 'lucide-react';
import { useToastStore } from '../../store/toastStore';

export default function AdminStore() {
  const toast = useToastStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: 0, stock: 0, image_url: '' });

  const fetchItems = async () => {
    try {
      const res = await getStoreItems();
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({ title: item.title, description: item.description, price: item.price, stock: item.stock, image_url: item.image_url || '' });
    } else {
      setEditingItem(null);
      setForm({ title: '', description: '', price: 0, stock: 0, image_url: '' });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateStoreItem(editingItem.id, form);
      } else {
        await createStoreItem(form);
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Удалить товар?')) return;
    try {
      await deleteStoreItem(id);
      fetchItems();
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  const filteredItems = items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
            Склад магазина
          </h1>
          <p className="text-slate-400 text-sm mt-1">Управляйте товарами за монеты</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Package className="w-5 h-5" /> Новый товар
        </button>
      </div>

      <input 
        type="text" 
        placeholder="Поиск товаров..." 
        className="input-premium max-w-md w-full"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map(item => (
          <div key={item.id} className="glass-card flex flex-col group hover:-translate-y-1 transition-transform duration-300">
            <div className="h-48 w-full bg-slate-800/80 relative overflow-hidden rounded-t-xl border-b border-slate-700/50">
              {item.image_url ? (
                <img src={getFullUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Package className="w-10 h-10 opacity-20" />
                  <span className="text-sm font-medium">Нет фото</span>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white">{item.title}</h3>
                <div className="flex gap-2">
                  <button onClick={() => openModal(item)} className="text-slate-400 hover:text-blue-400 bg-slate-900/80 p-2 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-red-400 bg-slate-900/80 p-2 rounded-lg border border-slate-700 hover:border-red-500/50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-2 flex-1">{item.description}</p>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-700/50">
                <div className="font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 flex items-center gap-1.5">
                  {item.price} <Coins className="w-4 h-4" />
                </div>
                <div className="text-slate-300 text-sm flex items-center gap-1.5 font-medium">
                  <Box className="w-4 h-4 text-slate-500" />
                  В наличии: {item.stock}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingItem ? "Редактировать товар" : "Новый товар"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUpload 
            value={form.image_url} 
            onChange={(url) => setForm({...form, image_url: url})} 
          />
          <div>
            <label className="block text-sm text-slate-300 mb-1">Название</label>
            <input required className="input-premium" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Описание</label>
            <textarea required className="input-premium h-20" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-slate-300 mb-1">Цена (монет)</label>
              <input required type="number" className="input-premium" value={form.price} onChange={e => setForm({...form, price: parseInt(e.target.value)})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-300 mb-1">Сток (шт)</label>
              <input required type="number" className="input-premium" value={form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value)})} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Сохранить</button>
        </form>
      </Modal>
    </div>
  );
}
