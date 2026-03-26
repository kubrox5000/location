import React from 'react';
import { Search, MapPin, Calendar, Car as CarIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CAR_TYPES } from '../constants';
import { cityService } from '../services/api';

interface SearchFormProps {
  onSearch: (filters: any) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const { t } = useTranslation();
  const [city, setCity] = React.useState('');
  const [pickupDate, setPickupDate] = React.useState('');
  const [returnDate, setReturnDate] = React.useState('');
  const [carType, setCarType] = React.useState('');
  const [cities, setCities] = React.useState<string[]>([]);
  const [loadingCities, setLoadingCities] = React.useState(true);

  React.useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await cityService.getAll();
        setCities(data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ city, pickupDate, returnDate, carType });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-4 rounded-[3rem] glass p-4 sm:p-6 shadow-2xl shadow-black/5 lg:grid-cols-5 lg:gap-4 xl:gap-6 border border-black/5"
    >
      <div className="relative group">
        <div className="absolute inset-y-0 start-4 xl:start-5 flex items-center text-primary transition-colors">
          <MapPin size={18} className="xl:w-5 xl:h-5" />
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={loadingCities}
          className="w-full rounded-2xl border border-black/5 bg-black/5 ps-11 xl:ps-14 pe-4 xl:pe-6 py-4 xl:py-5 text-xs xl:text-sm font-bold text-foreground focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all disabled:opacity-50 appearance-none cursor-pointer tracking-wide"
        >
          <option value="" className="bg-background text-foreground">{t('fleet.allCities')}</option>
          {cities.map((c) => (
            <option key={c} value={c} className="bg-background text-foreground">{c}</option>
          ))}
        </select>
        {loadingCities && (
          <div className="absolute inset-y-0 end-4 xl:end-6 flex items-center">
            <Loader2 size={14} className="animate-spin text-primary/40 xl:w-4 xl:h-4" />
          </div>
        )}
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 start-4 xl:start-5 flex items-center text-primary transition-colors">
          <Calendar size={18} className="xl:w-5 xl:h-5" />
        </div>
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          className="w-full rounded-2xl border border-black/5 bg-black/5 ps-11 xl:ps-14 pe-4 xl:pe-6 py-4 xl:py-5 text-xs xl:text-sm font-bold text-foreground focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all [color-scheme:light] cursor-pointer tracking-wide"
          placeholder={t('carDetails.pickupDate')}
        />
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 start-4 xl:start-5 flex items-center text-primary transition-colors">
          <Calendar size={18} className="xl:w-5 xl:h-5" />
        </div>
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="w-full rounded-2xl border border-black/5 bg-black/5 ps-11 xl:ps-14 pe-4 xl:pe-6 py-4 xl:py-5 text-xs xl:text-sm font-bold text-foreground focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all [color-scheme:light] cursor-pointer tracking-wide"
          placeholder={t('carDetails.returnDate')}
        />
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 start-4 xl:start-5 flex items-center text-primary transition-colors">
          <CarIcon size={18} className="xl:w-5 xl:h-5" />
        </div>
        <select
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
          className="w-full rounded-2xl border border-black/5 bg-black/5 ps-11 xl:ps-14 pe-4 xl:pe-6 py-4 xl:py-5 text-xs xl:text-sm font-bold text-foreground focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer tracking-wide"
        >
          <option value="" className="bg-background text-foreground">{t('fleet.allTypes')}</option>
          {CAR_TYPES.map((type) => (
            <option key={type} value={type} className="bg-background text-foreground">
              {t(`admin.fleet.options.types.${type.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="group/btn flex w-full items-center justify-center gap-2 xl:gap-4 rounded-2xl bg-primary px-4 xl:px-8 py-4 xl:py-5 text-[10px] xl:text-xs font-black uppercase tracking-[0.1em] xl:tracking-[0.3em] text-white transition-all hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98]"
      >
        <Search size={18} className="transition-transform group-hover/btn:scale-110 xl:w-5 xl:h-5" />
        <span className="whitespace-nowrap">{t('home.hero.findCar')}</span>
      </button>
    </form>
  );
};
