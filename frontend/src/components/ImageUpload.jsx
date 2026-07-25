import { useState, useRef } from 'react';
import { uploadFile } from '../api/client';
import { getFullUrl } from '../utils';
import { Camera } from 'lucide-react';

export default function ImageUpload({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await uploadFile(file);
      onChange(res.data.url);
    } catch (err) {
      alert('Ошибка загрузки: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm text-slate-300 mb-1">Изображение</label>
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-700 h-40">
          <img src={getFullUrl(value)} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg"
            >
              Удалить
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer transition-colors text-slate-400 hover:text-indigo-400 bg-slate-900/50"
        >
          {loading ? (
            <span className="animate-pulse">Загрузка...</span>
          ) : (
            <>
              <Camera className="w-6 h-6 mb-1" />
              <span className="text-xs">Нажмите для загрузки</span>
            </>
          )}
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleUpload} 
        accept="image/jpeg, image/png, image/webp" 
        className="hidden" 
      />
    </div>
  );
}
