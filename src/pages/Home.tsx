import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Shield, Clock, Zap, ChevronRight, Play, Search, Calendar, ChevronLeft, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SearchForm } from '../components/SearchForm';
import { CarCard } from '../components/CarCard';
import { carService, settingsService } from '../services/api';
import { Car, Settings } from '../types';
import { AnimatePresence } from 'motion/react';

export const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = React.useState<Car[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  const [settings, setSettings] = React.useState<Settings | null>(null);

  const testimonials = [
    {
      quote: "L'attention aux détails et la qualité de la flotte sont inégalées. DriveSelect a transformé mon voyage d'affaires en un plaisir absolu.",
      author: "JULIAN ALEXANDER",
      role: "PDG, TECHVISION GLOBAL",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Une expérience incroyable. La voiture était impeccable et le service client très réactif. Je ne louerai plus ailleurs.",
      author: "SARAH JENKINS",
      role: "ARCHITECTE D'INTÉRIEUR",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Le meilleur service de location de voitures de luxe. Simple, rapide et prestigieux. La Range Rover était parfaite.",
      author: "MARC DUPONT",
      role: "ENTREPRENEUR",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "J'ai loué une Porsche pour un week-end et c'était magique. Le processus est d'une fluidité exemplaire.",
      author: "ELENA RODRIGUEZ",
      role: "DESIGNER DE MODE",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Professionnalisme et discrétion. Exactement ce que je recherche pour mes déplacements professionnels de haut niveau.",
      author: "THOMAS MÜLLER",
      role: "CONSULTANT STRATÉGIQUE",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Des voitures magnifiques pour mes shootings photo. DriveSelect comprend les besoins esthétiques de ses clients.",
      author: "SOPHIE MARTIN",
      role: "PHOTOGRAPHE PROFESSIONNELLE",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Fiabilité et luxe. DriveSelect est mon partenaire de confiance pour tous mes séjours en Europe.",
      author: "JAMES WILSON",
      role: "INVESTISSEUR PRIVÉ",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Les voitures sont juste incroyables pour mon contenu. Service 5 étoiles du début à la fin.",
      author: "ISABELLA ROSSI",
      role: "INFLUENCEUSE LUXE",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Excellent service, voitures très bien entretenues. L'accueil à l'aéroport était parfait.",
      author: "AHMED AL-FAYED",
      role: "DIRECTEUR COMMERCIAL",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"
    },
    {
      quote: "Une flotte variée et un processus de réservation fluide. Idéal pour tester différents modèles d'exception.",
      author: "CHLOE THOMPSON",
      role: "DIRECTRICE MARKETING",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

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

    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };

    fetchCars();
    fetchSettings();
  }, []);

  const handleSearch = (filters: any) => {
    const params = new URLSearchParams(filters);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="flex flex-col bg-background">
      {/* Hero Section - Editorial Style */}
      <section className="relative min-h-screen overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={settings?.heroImage || "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=2000"}
            alt="Hero Background"
            className="h-full w-full object-cover object-center"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center text-foreground">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl"
          >
            <motion.span 
              initial={{ opacity: 0, letterSpacing: "1em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="mb-8 inline-block text-[11px] font-black uppercase text-primary"
            >
              {t('home.hero.tag')}
            </motion.span>
            <h1 className="serif text-5xl font-black leading-[0.9] text-foreground sm:hidden tracking-tighter mb-4">
              {t('home.hero.title')}
            </h1>
            <h1 className="serif hidden sm:block font-black leading-[0.9] text-foreground sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] tracking-tighter">
              {t('home.hero.title')}
            </h1>
            <p className="mx-auto mt-10 max-w-2xl text-xl font-light leading-relaxed text-foreground/50 tracking-wide">
              {t('home.hero.subtitle')}
            </p>
            
            <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-8">
              <Link
                to="/cars"
                className="group flex items-center gap-4 sm:gap-6 rounded-full bg-primary px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/40 whitespace-nowrap"
              >
                {t('home.collection.cta')}
                <ChevronRight size={18} className="rtl:rotate-180 transition-transform group-hover:translate-x-2" />
              </Link>
              <Link
                to="/cars"
                className="group flex items-center gap-4 sm:gap-6 rounded-full border border-black/10 bg-white px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black shadow-xl transition-all hover:bg-gray-50 active:scale-95 whitespace-nowrap"
              >
                {t('home.cta.book')}
                <Calendar size={18} className="rtl:rotate-180" />
              </Link>
              <Link
                to="/contact"
                className="group flex items-center gap-4 sm:gap-6 rounded-full border border-black/10 bg-white px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black shadow-xl transition-all hover:bg-gray-50 active:scale-95 whitespace-nowrap"
              >
                {t('home.cta.contact')}
                <MessageCircle size={18} className="rtl:rotate-180 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Search Bar */}
        <div id="search-section" className="relative z-20 -mt-32 mx-auto max-w-6xl px-6 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[3rem] glass p-3 shadow-2xl shadow-black/5 border border-black/5"
          >
            <SearchForm onSearch={handleSearch} />
          </motion.div>
        </div>
      </section>

      {/* Brand Partners / Social Proof */}
      <section className="border-y border-black/5 py-16 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-10 text-center text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">
            {t('home.trusted')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 transition-all">
            {[
              { name: 'Mercedes-Benz', color: 'text-slate-500' },
              { name: 'BMW', color: 'text-blue-600' },
              { name: 'Audi', color: 'text-red-600' },
              { name: 'Porsche', color: 'text-amber-600' },
              { name: 'Tesla', color: 'text-red-700' },
              { name: 'Range Rover', color: 'text-emerald-800' }
            ].map((brand) => (
              <span 
                key={brand.name} 
                className={`serif text-2xl sm:text-3xl font-black italic transition-all hover:scale-110 cursor-default ${brand.color}`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Selection - Bento Grid Style */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 blur-[120px] rounded-full" />
        
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Large Background Text */}
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 rotate-90 hidden xl:block pointer-events-none">
          <span className="text-[200px] font-black text-foreground/[0.03] leading-none select-none tracking-tighter">
            FLEET
          </span>
        </div>

        {/* Vertical Rail Text */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
          <div className="flex flex-col items-center gap-8">
            <div className="h-24 w-[1px] bg-foreground/10" />
            <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-black uppercase tracking-[0.5em] text-foreground/20">
              ESTABLISHED 2026
            </span>
            <div className="h-24 w-[1px] bg-foreground/10" />
          </div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="mb-12 flex flex-col items-end justify-between gap-10 md:flex-row rtl:flex-row-reverse relative">
            <div className="max-w-2xl rtl:text-right">
              <span className="mb-6 inline-block text-[11px] font-black uppercase tracking-[0.4em] text-primary">
                {t('home.collection.tag')}
              </span>
              <h2 className="serif text-6xl font-black text-foreground leading-tight">
                {t('home.collection.title')}
              </h2>
              <p className="mt-8 text-xl font-light text-foreground/40 leading-relaxed max-w-xl">
                {t('home.collection.subtitle')}
              </p>
            </div>

              <div className="flex flex-col items-center md:items-end gap-12 relative">
                {/* Decorative Floating Image */}
                <Link
                  to="/cars"
                  className="group flex items-center gap-6 rounded-full border border-primary bg-primary px-10 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-primary/90 shadow-2xl shadow-primary/30 relative z-10 whitespace-nowrap"
                >
                  {t('home.collection.cta')}
                  <ChevronRight size={20} className="rtl:rotate-180 transition-transform group-hover:translate-x-2" />
                </Link>
              </div>
          </div>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCars.map((car, idx) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Process Section */}
      <section className="py-20 bg-black/5 relative">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="mb-6 inline-block text-[11px] font-black uppercase tracking-[0.4em] text-primary">
              {t('home.process.tag')}
            </span>
            <h2 className="serif text-6xl font-black text-foreground">
              {t('home.process.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: Search, title: t('home.process.step1.title'), desc: t('home.process.step1.desc') },
              { icon: Calendar, title: t('home.process.step2.title'), desc: t('home.process.step2.desc') },
              { icon: Zap, title: t('home.process.step3.title'), desc: t('home.process.step3.desc') }
            ].map((step, idx) => (
              <div key={idx} className="relative group text-center">
                <div className="mb-10 mx-auto flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-primary/10 text-primary shadow-2xl shadow-primary/5 border border-primary/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <step.icon size={36} />
                </div>
                <h4 className="text-2xl font-black text-foreground mb-6 tracking-tight">{step.title}</h4>
                <p className="text-foreground/40 font-light leading-relaxed max-w-xs mx-auto text-lg">{step.desc}</p>
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[75%] w-full h-[1px] bg-gradient-to-r from-primary/20 to-transparent z-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section - Split Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
        <div className="relative aspect-video lg:aspect-auto lg:h-auto overflow-hidden">
          <img 
            src={settings?.experienceImage || "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000"} 
            alt="Driving Experience" 
            className="h-full w-full object-cover object-center brightness-100 contrast-100"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent lg:from-black/60" />
        </div>
        <div className="flex flex-col justify-center bg-black/5 px-8 py-16 lg:px-32 rtl:text-right relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
          <span className="mb-8 inline-block text-[11px] font-black uppercase tracking-[0.4em] text-primary">
            {t('home.experience.tag')}
          </span>
          <h2 className="serif text-5xl sm:text-6xl font-black text-foreground leading-tight">
            {t('home.experience.title')}
          </h2>
          <div className="mt-16 space-y-12">
            {(t('home.experience.steps', { returnObjects: true }) as any[]).map((item, idx) => (
              <div key={idx} className="flex gap-8 rtl:flex-row-reverse group">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-black text-primary shadow-lg shadow-primary/5 transition-all group-hover:scale-110">
                  0{idx + 1}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-foreground tracking-tight">{item.title}</h4>
                  <p className="mt-4 text-lg font-light leading-relaxed text-foreground/40">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Animated Slider */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        
        <div className="mx-auto max-w-5xl px-6 relative">
          <div className="relative min-h-[450px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center w-full"
              >
                <div className="mb-10 flex justify-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="text-primary" size={20} fill="currentColor" />
                  ))}
                </div>

                <h3 className="serif text-3xl sm:text-5xl italic leading-[1.3] text-foreground font-light mb-12 max-w-4xl mx-auto">
                  "{testimonials[currentTestimonial].quote}"
                </h3>

                <div className="flex flex-col items-center">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <img 
                      src={testimonials[currentTestimonial].image} 
                      alt={testimonials[currentTestimonial].author}
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/20 p-1 shadow-xl"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <p className="text-lg font-black uppercase tracking-[0.4em] text-foreground mb-2">
                    {testimonials[currentTestimonial].author}
                  </p>
                  <p className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                    {testimonials[currentTestimonial].role}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between pointer-events-none px-4 sm:-mx-12">
              <button 
                onClick={prevTestimonial}
                className="pointer-events-auto h-14 w-14 rounded-full border border-black/5 bg-white/50 backdrop-blur-md flex items-center justify-center text-foreground/40 transition-all hover:bg-primary hover:text-white hover:border-primary shadow-xl active:scale-90"
              >
                <ChevronLeft size={24} className="rtl:rotate-180" />
              </button>
              <button 
                onClick={nextTestimonial}
                className="pointer-events-auto h-14 w-14 rounded-full border border-black/5 bg-white/50 backdrop-blur-md flex items-center justify-center text-foreground/40 transition-all hover:bg-primary hover:text-white hover:border-primary shadow-xl active:scale-90"
              >
                <ChevronRight size={24} className="rtl:rotate-180" />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="mt-16 flex justify-center gap-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentTestimonial(idx)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${
                    currentTestimonial === idx ? 'w-8 bg-primary' : 'w-2 bg-foreground/10 hover:bg-foreground/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <span className="mb-6 inline-block text-[11px] font-black uppercase tracking-[0.4em] text-primary">
              {t('nav.contact')}
            </span>
            <h2 className="serif text-5xl sm:text-6xl font-black text-foreground">
              {i18n.language === 'ar' ? 'موقعنا في الخريطة' : 'Our Location'}
            </h2>
          </div>
          <div className="relative h-[500px] w-full overflow-hidden rounded-[32px] sm:rounded-[48px] shadow-2xl border border-black/5">
            <iframe 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(i18n.language === 'ar' ? (settings?.addressAr || 'دبي') : (settings?.address || 'Dubai'))}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* CTA Section - Atmospheric */}
      <section className="px-6 pb-16 bg-background">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[4rem] bg-black/5 px-8 py-16 sm:px-12 sm:py-20 text-center text-foreground shadow-2xl border border-black/5">
          <div className="absolute inset-0 z-0">
            <img 
              src={settings?.ctaImage || "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=2000"} 
              alt="CTA Background" 
              className="h-full w-full object-cover opacity-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="relative z-10">
            <span className="mb-8 inline-block text-[11px] font-black uppercase tracking-[0.4em] text-primary">
              {t('home.cta.tag')}
            </span>
            {t('home.cta.title') && (
              <h2 className="serif text-5xl sm:text-8xl font-black text-foreground leading-[0.9] tracking-tighter">
                {t('home.cta.title')}
              </h2>
            )}
            {t('home.cta.subtitle') && (
              <p className="mx-auto mt-10 max-w-2xl text-xl font-light text-foreground/50 leading-relaxed">
                {t('home.cta.subtitle')}
              </p>
            )}
            <div className="mt-16 flex flex-wrap justify-center gap-4 sm:gap-8">
              <Link
                to="/cars"
                className="group flex items-center gap-4 sm:gap-6 rounded-full bg-primary px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-primary/40 whitespace-nowrap"
              >
                {t('home.collection.cta')}
                <ChevronRight size={18} className="rtl:rotate-180 transition-transform group-hover:translate-x-2" />
              </Link>
              <Link
                to="/cars"
                className="group flex items-center gap-4 sm:gap-6 rounded-full border border-black/10 bg-white px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black shadow-xl transition-all hover:bg-gray-50 active:scale-95 whitespace-nowrap"
              >
                {t('home.cta.book')}
                <Calendar size={18} className="rtl:rotate-180" />
              </Link>
              <Link
                to="/contact"
                className="group flex items-center gap-4 sm:gap-6 rounded-full border border-black/10 bg-white px-6 sm:px-10 py-4 sm:py-5 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black shadow-xl transition-all hover:bg-gray-50 active:scale-95 whitespace-nowrap"
              >
                {t('home.cta.contact')}
                <MessageCircle size={18} className="rtl:rotate-180 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
