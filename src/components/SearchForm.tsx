import React from 'react';
import { Search, MapPin, Calendar, Car as CarIcon, Loader2 } from 'lucide-react';
import { CAR_TYPES } from '../constants';
import { cityService } from '../services/api';

interface SearchFormProps {
  onSearch: (filters: any) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
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
      className="grid grid-cols-1 gap-4 rounded-[2rem] bg-white p-8 shadow-2xl md:grid-cols-5 md:gap-8 border border-primary/10"
    >
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <MapPin size={12} />
          Location
        </label>
        <div className="relative">
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={loadingCities}
            className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all disabled:opacity-50 appearance-none"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {loadingCities && (
            <div className="absolute right-8 top-1/2 -translate-y-1/2">
              <Loader2 size={14} className="animate-spin text-primary/20" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Calendar size={12} />
          Pickup
        </label>
        <input
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:light]"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <Calendar size={12} />
          Return
        </label>
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all [color-scheme:light]"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
          <CarIcon size={12} />
          Category
        </label>
        <select
          value={carType}
          onChange={(e) => setCarType(e.target.value)}
          className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
        >
          <option value="">All Types</option>
          {CAR_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/20"
        >
          <Search size={16} />
          Find Car
        </button>
      </div>
    </form>
  );
};
