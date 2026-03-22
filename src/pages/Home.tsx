import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Clock, Zap, ChevronRight, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchForm } from '../components/SearchForm';
import { CarCard } from '../components/CarCard';
import { carService } from '../services/api';
import { Car } from '../types';

export const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = React.useState<Car[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await carService.getAll();
        setFeaturedCars(data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleSearch = (filters: any) => {
    const params = new URLSearchParams(filters);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-screen overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Background"
            className="h-full w-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center text-foreground">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl"
          >
            <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
              {t('home.hero.tag')}
            </span>
            <h1 className="serif text-6xl font-light leading-[1.1] text-foreground sm:text-8xl lg:text-9xl">
              {t('home.hero.title')}
            </h1>
            <p className="mx-auto mt-8 max-w-xl text-lg font-light leading-relaxed text-foreground/70">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="group flex items-center gap-4 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
              >
                {t('home.hero.cta')}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1 rtl:rotate-180" />
              </button>
              <Link
                to="/about"
                className="flex items-center gap-4 rounded-full border border-primary/20 bg-primary/5 px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary backdrop-blur-md transition-all hover:bg-primary/10 active:scale-95"
              >
                {t('home.hero.story')}
                <Play size={16} fill="currentColor" className="rtl:rotate-180" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Search Bar */}
        <div id="search-section" className="relative z-20 -mt-24 mx-auto max-w-5xl px-4 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2.5rem] bg-secondary p-2 shadow-2xl shadow-primary/5 border border-primary/10"
          >
            <SearchForm onSearch={handleSearch} />
          </motion.div>
        </div>
      </section>

      {/* Brand Partners / Social Proof */}
      <section className="border-b border-primary/10 py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-8 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-foreground/30">
            {t('home.trusted')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale transition-all hover:grayscale-0 hover:opacity-100">
            {['Mercedes-Benz', 'BMW', 'Audi', 'Porsche', 'Tesla', 'Range Rover'].map((brand) => (
              <span key={brand} className="serif text-2xl font-bold italic text-primary">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Selection - Bento Grid Style */}
      <section className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 flex flex-col items-end justify-between gap-8 md:flex-row rtl:flex-row-reverse">
            <div className="max-w-xl rtl:text-right">
              <span className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                {t('home.collection.tag')}
              </span>
              <h2 className="serif text-5xl font-light text-foreground">
                {t('home.collection.title')}
              </h2>
              <p className="mt-6 text-lg font-light text-foreground/50">
                {t('home.collection.subtitle')}
              </p>
            </div>
            <Link
              to="/cars"
              className="group flex items-center gap-4 rounded-full border border-primary/10 px-8 py-4 text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
            >
              {t('home.collection.cta')}
              <ChevronRight size={18} className="rtl:rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCars.map((car, idx) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section - Split Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-[600px] overflow-hidden lg:h-auto">
          <img 
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1000" 
            alt="Driving Experience" 
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="flex flex-col justify-center bg-secondary px-8 py-24 lg:px-24 rtl:text-right">
          <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            {t('home.experience.tag')}
          </span>
          <h2 className="serif text-5xl font-light text-foreground">
            {t('home.experience.title')}
          </h2>
          <div className="mt-12 space-y-10">
            {(t('home.experience.steps', { returnObjects: true }) as any[]).map((item, idx) => (
              <div key={idx} className="flex gap-6 rtl:flex-row-reverse">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black text-xs font-bold text-primary">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
                  <p className="mt-2 font-light leading-relaxed text-foreground/50">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Minimalist */}
      <section className="py-32 bg-background">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Star className="mx-auto mb-8 text-primary" size={32} fill="currentColor" />
          <h3 className="serif text-3xl italic leading-relaxed text-foreground">
            {t('home.testimonial.quote')}
          </h3>
          <div className="mt-10">
            <p className="text-sm font-bold uppercase tracking-widest text-foreground">{t('home.testimonial.author')}</p>
            <p className="mt-1 text-xs text-foreground/30">{t('home.testimonial.role')}</p>
          </div>
        </div>
      </section>

      {/* CTA Section - Atmospheric */}
      <section className="px-4 pb-20 bg-white">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-secondary px-8 py-24 text-center text-foreground shadow-2xl border border-primary/10">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=2000" 
              alt="CTA Background" 
              className="h-full w-full object-cover opacity-20"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white" />
          </div>
          
          <div className="relative z-10">
            <span className="mb-6 inline-block text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
              {t('home.cta.tag')}
            </span>
            <h2 className="serif text-5xl font-light text-foreground sm:text-7xl">
              {t('home.cta.title')}
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-lg font-light text-foreground/60">
              {t('home.cta.subtitle')}
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-6">
              <Link
                to="/cars"
                className="rounded-full bg-primary px-10 py-5 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-xl transition-all hover:scale-105 active:scale-95 shadow-primary/20"
              >
                {t('home.cta.book')}
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-primary/20 bg-primary/5 px-10 py-5 text-xs font-bold uppercase tracking-widest text-primary backdrop-blur-md transition-all hover:bg-primary/10 active:scale-95"
              >
                {t('home.cta.contact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
