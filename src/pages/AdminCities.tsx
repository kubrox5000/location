import React from 'react';
import { Plus, Trash2, MapPin, Loader2 } from 'lucide-react';
import { cityService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const AdminCities = () => {
  const { t } = useTranslation();
  const [cities, setCities] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newCity, setNewCity] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [cityToDelete, setCityToDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const data = await cityService.getAll();
      setCities(data);
    } catch (error) {
      toast.error(t('admin.cities.errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;

    setIsAdding(true);
    try {
      const addedCity = await cityService.create(newCity.trim());
      setCities([...cities, addedCity]);
      setNewCity('');
      toast.success(t('admin.cities.successAdd'));
    } catch (error: any) {
      toast.error(error.message || t('admin.cities.errorAdd'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCity = async (name: string) => {
    try {
      await cityService.delete(name);
      setCities(cities.filter(c => c !== name));
      setCityToDelete(null);
      toast.success(t('admin.cities.successDelete'));
    } catch (error) {
      toast.error(t('admin.cities.errorDelete'));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="serif text-2xl font-light tracking-tight text-foreground">{t('admin.cities.title')}</h1>
        <p className="text-foreground/60 text-sm font-light">{t('admin.cities.subtitle')}</p>
      </div>

      <div className="rounded-3xl border border-primary/10 bg-white p-8 shadow-sm">
        <form onSubmit={handleAddCity} className="flex gap-4">
          <div className="relative flex-1">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
            <input
              type="text"
              placeholder={t('admin.cities.placeholder')}
              className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              disabled={isAdding}
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newCity.trim()}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus size={18} />}
            {t('admin.cities.add')}
          </button>
        </form>

        <div className="mt-10">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4">{t('admin.cities.available')} ({cities.length})</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {cities.map((city) => (
                <motion.div
                  key={city}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group flex items-center justify-between rounded-2xl border border-primary/10 bg-primary/5 p-4 transition-all hover:border-primary/20 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <MapPin size={16} />
                    </div>
                    <span className="font-bold text-foreground">{city}</span>
                  </div>
                  <button
                    onClick={() => setCityToDelete(city)}
                    className="rounded-lg p-2 text-foreground/30 transition-all hover:bg-red-50 hover:text-red-600 lg:opacity-0 lg:group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Delete Confirmation Modal */}
          <AnimatePresence>
            {cityToDelete && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-primary/10"
                >
                  <h3 className="serif text-xl font-light text-foreground">{t('admin.cities.deleteTitle')}</h3>
                  <p className="mt-2 text-foreground/60 text-sm font-light">
                    {t('admin.cities.deleteConfirm', { city: cityToDelete })}
                  </p>
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => setCityToDelete(null)}
                      className="flex-1 rounded-xl border border-primary/10 py-3 text-sm font-bold text-foreground/60 transition-all hover:bg-primary/5"
                    >
                      {t('admin.cities.cancel')}
                    </button>
                    <button
                      onClick={() => handleDeleteCity(cityToDelete)}
                      className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95"
                    >
                      {t('admin.cities.delete')}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
          
          {cities.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-foreground/60 text-sm font-light">{t('admin.cities.noCities')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
