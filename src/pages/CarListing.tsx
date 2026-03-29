import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Filter, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { CarCard } from '../components/CarCard';
import { carService, cityService } from '../services/api';
import { Car } from '../types';
import { CAR_TYPES } from '../constants';

export const CarListing = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [cities, setCities] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingCities, setLoadingCities] = React.useState(true);

  const cityFilter = searchParams.get('city') || '';
  const typeFilter = searchParams.get('carType') || '';

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsData, citiesData] = await Promise.all([
          carService.getAll(),
          cityService.getAll()
        ]);
        setCars(carsData);
        setCities(citiesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
        setLoadingCities(false);
      }
    };
    fetchData();
  }, []);

  const filteredCars = cars.filter((car) => {
    const matchesCity = !cityFilter || car.cities.includes(cityFilter);
    const matchesType = !typeFilter || car.type === typeFilter;
    return matchesCity && matchesType;
  });

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-xl font-black uppercase tracking-[0.4em] text-foreground/40">Loading Fleet</p>
      </div>
    </div>
  );

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h1 className="serif text-6xl font-black leading-tight text-foreground sm:text-8xl tracking-tighter">
                OUR <span className="text-primary">FLEET</span>
              </h1>
              <p className="mt-6 text-xl font-light text-foreground/40 leading-relaxed">
                {t('fleet.subtitle', { count: filteredCars.length })}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/5 px-8 py-4 text-xs font-black uppercase tracking-[0.3em] text-foreground transition-all hover:bg-black/10 md:hidden"
            >
              <SlidersHorizontal size={18} />
              {t('fleet.filters')}
            </button>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters */}
            <aside className={`w-full lg:w-80 ${showFilters ? 'block' : 'hidden md:block'}`}>
              <div className="sticky top-32 space-y-10 rounded-[3rem] glass p-8 border border-black/5 shadow-2xl shadow-black/5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.3em] text-foreground">
                    <Filter size={18} className="text-primary" />
                    {t('fleet.filters')}
                  </h3>
                  {(cityFilter || typeFilter) && (
                    <button
                      onClick={clearFilters}
                      className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                    >
                      {t('fleet.clearAll')}
                    </button>
                  )}
                </div>

                <div className="space-y-10">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">{t('fleet.location')}</label>
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => updateFilter('city', '')}
                        className={`block w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition-all ${
                          !cityFilter ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-foreground/40 hover:bg-black/5 hover:text-foreground'
                        }`}
                      >
                        {t('fleet.allCities')}
                      </button>
                      {loadingCities ? (
                        <div className="flex justify-center py-6">
                          <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                      ) : (
                        cities.map((city) => (
                          <button
                            key={city}
                            onClick={() => updateFilter('city', city)}
                            className={`block w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition-all ${
                              cityFilter === city ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-foreground/40 hover:bg-black/5 hover:text-foreground'
                            }`}
                          >
                            {city}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">{t('fleet.carType')}</label>
                    <div className="mt-6 space-y-3">
                      <button
                        onClick={() => updateFilter('carType', '')}
                        className={`block w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition-all ${
                          !typeFilter ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-foreground/40 hover:bg-black/5 hover:text-foreground'
                        }`}
                      >
                        {t('fleet.allTypes')}
                      </button>
                      {CAR_TYPES.map((type) => (
                        <button
                          key={type}
                          onClick={() => updateFilter('carType', type)}
                          className={`block w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition-all ${
                            typeFilter === type ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-foreground/40 hover:bg-black/5 hover:text-foreground'
                          }`}
                        >
                          {t(`admin.fleet.options.types.${type.toLowerCase()}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid */}
            <div className="flex-1">
              {filteredCars.length > 0 ? (
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {filteredCars.map((car) => (
                    <CarCard key={car.id} car={car} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-[4rem] border border-black/5 bg-black/5 py-20 text-center backdrop-blur-xl">
                  <div className="rounded-full bg-black/5 p-10 text-foreground/10">
                    <X size={64} />
                  </div>
                  <h3 className="mt-10 text-3xl font-black text-foreground uppercase tracking-tighter">{t('fleet.noCars')}</h3>
                  <p className="mt-4 text-lg font-light text-foreground/40">{t('fleet.noCarsDesc')}</p>
                  <button
                    onClick={clearFilters}
                    className="mt-12 rounded-2xl bg-primary px-10 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    {t('fleet.clearFilters')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
