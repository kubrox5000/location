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

  if (loading) return <div className="p-20 text-center">Loading fleet...</div>;


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
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="serif text-4xl font-light tracking-tight text-foreground">{t('fleet.title')}</h1>
            <p className="mt-2 text-foreground/60">{t('fleet.subtitle', { count: filteredCars.length })}</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-foreground transition-all hover:bg-primary/5 md:hidden"
          >
            <SlidersHorizontal size={18} />
            {t('fleet.filters')}
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="sticky top-24 space-y-8 rounded-2xl border border-primary/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-bold text-foreground">
                  <Filter size={18} />
                  {t('fleet.filters')}
                </h3>
                {(cityFilter || typeFilter) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {t('fleet.clearAll')}
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('fleet.location')}</label>
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => updateFilter('city', '')}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                        !cityFilter ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground/60 hover:bg-primary/5'
                      }`}
                    >
                      {t('fleet.allCities')}
                    </button>
                    {loadingCities ? (
                      <div className="flex justify-center py-4">
                        <Loader2 size={18} className="animate-spin text-primary/40" />
                      </div>
                    ) : (
                      cities.map((city) => (
                        <button
                          key={city}
                          onClick={() => updateFilter('city', city)}
                          className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                            cityFilter === city ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground/60 hover:bg-primary/5'
                          }`}
                        >
                          {city}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('fleet.carType')}</label>
                  <div className="mt-2 space-y-2">
                    <button
                      onClick={() => updateFilter('carType', '')}
                      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                        !typeFilter ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground/60 hover:bg-primary/5'
                      }`}
                    >
                      {t('fleet.allTypes')}
                    </button>
                    {CAR_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => updateFilter('carType', type)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                          typeFilter === type ? 'bg-primary font-bold text-primary-foreground' : 'text-foreground/60 hover:bg-primary/5'
                        }`}
                      >
                        {type}
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
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {filteredCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/10 py-20 text-center">
                <div className="rounded-full bg-primary/5 p-6 text-primary/40">
                  <X size={48} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-foreground">{t('fleet.noCars')}</h3>
                <p className="mt-2 text-foreground/60">{t('fleet.noCarsDesc')}</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90"
                >
                  {t('fleet.clearFilters')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
