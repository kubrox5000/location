import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, Fuel, Gauge, MapPin, Calendar, 
  ChevronLeft, MessageCircle, CreditCard, 
  CheckCircle2, Info, DoorOpen, Snowflake,
  Loader2
} from 'lucide-react';
import { carService, bookingService } from '../services/api';
import { Car, Booking } from '../types';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays, eachDayOfInterval, format, parseISO } from 'date-fns';

import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

export const CarDetails = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = React.useState<Car | null>(null);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [activeImage, setActiveImage] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [bookingOption, setBookingOption] = React.useState<'website' | 'whatsapp' | null>(null);
  const [formData, setFormData] = React.useState({
    fullName: '',
    phone: '',
    city: '',
    pickupDate: null as Date | null,
    returnDate: null as Date | null,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const carData = await carService.getById(id);
        setCar(carData);
        if (carData) {
          setFormData(prev => ({ ...prev, city: carData.cities[0] || '' }));
          try {
            const bookingsData = await bookingService.getAll();
            setBookings(bookingsData.filter(b => b.carId === id && b.status !== 'Cancelled'));
          } catch (e) {
            console.warn('Could not fetch bookings (likely public user):', e);
            setBookings([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const excludedDates = React.useMemo(() => {
    const dates: Date[] = [];
    
    // 1. Exclude dates from existing bookings
    bookings.forEach(booking => {
      const start = parseISO(booking.pickupDate);
      const end = parseISO(booking.returnDate);
      const interval = eachDayOfInterval({ start, end });
      dates.push(...interval);
    });

    // 2. Exclude dates manually marked as unavailable in car.availability
    if (car?.availability) {
      Object.entries(car.availability).forEach(([dateStr, isAvailable]) => {
        if (!isAvailable) {
          dates.push(parseISO(dateStr));
        }
      });
    }

    return dates;
  }, [bookings, car]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-xl font-black uppercase tracking-[0.4em] text-foreground/40">{t('carDetails.loading')}</p>
      </div>
    </div>
  );

  if (!car) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center bg-background px-6">
        <h2 className="serif text-4xl font-black text-foreground tracking-tighter uppercase">{t('carDetails.notFound')}</h2>
        <button 
          onClick={() => navigate('/cars')} 
          className="mt-8 rounded-2xl bg-primary px-10 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-primary/40 transition-all hover:scale-105 active:scale-95"
        >
          {t('carDetails.backToFleet')}
        </button>
      </div>
    );
  }

  const handleWebsiteBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !formData.pickupDate || !formData.returnDate) return;

    if (formData.pickupDate >= formData.returnDate) {
      toast.error(t('carDetails.errorDates'));
      return;
    }

    const diffTime = Math.abs(formData.returnDate.getTime() - formData.pickupDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const bookingData = {
      carId: car.id,
      customerName: formData.fullName,
      phone: formData.phone,
      city: formData.city,
      pickupDate: format(formData.pickupDate, 'yyyy-MM-dd'),
      returnDate: format(formData.returnDate, 'yyyy-MM-dd'),
      totalPrice: car.pricePerDay * (diffDays || 1),
      status: 'Pending' as const
    };

    try {
      await bookingService.create(bookingData);
      toast.success(t('carDetails.success'));
      setBookingOption(null);
    } catch (error: any) {
      toast.error(error.message || t('carDetails.errorBooking'));
    }
  };


  const handleWhatsAppBooking = () => {
    const currency = settings?.currency || 'USD';
    const message = `Hello, I want to book ${car.brand} ${car.name} in ${formData.city}. Price: ${car.pricePerDay} ${currency}/day.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${settings?.whatsapp || '1234567890'}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="bg-background min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] text-foreground/40 transition-colors hover:text-primary"
        >
          <ChevronLeft size={20} className="rtl:rotate-180" />
          {t('carDetails.back')}
        </button>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          {/* Left: Images & Specs */}
          <div className="space-y-8">
            <div className="space-y-6">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-[4/3] sm:aspect-video overflow-hidden rounded-[3rem] border border-black/5 shadow-2xl shadow-black/10"
              >
                <img
                  src={car.images[activeImage]}
                  alt={car.name}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              
              {car.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {car.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
                        activeImage === idx ? 'border-primary scale-105 shadow-xl shadow-primary/20' : 'border-transparent opacity-40 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${car.name} ${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {[
                { icon: Users, label: t('carDetails.specs.seats'), value: car.seats },
                { icon: DoorOpen, label: t('carDetails.specs.doors'), value: car.doors },
                { icon: Gauge, label: t('carDetails.specs.transmission'), value: t(`admin.fleet.options.transmissions.${car.transmission.toLowerCase()}`) },
                { icon: Fuel, label: t('carDetails.specs.fuel'), value: t(`admin.fleet.options.fuels.${car.fuelType.toLowerCase()}`) },
                { icon: Snowflake, label: t('carDetails.specs.ac'), value: car.airConditioning ? t('carDetails.specs.yes') : t('carDetails.specs.no') },
                { icon: MapPin, label: t('carDetails.specs.cities'), value: car.cities.join(', ') },
              ].map((spec, idx) => (
                <div key={idx} className="group flex flex-col items-center rounded-[2rem] glass p-8 text-center border border-black/5 transition-all hover:bg-black/5 hover:border-primary/30">
                  <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6">
                    <spec.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{spec.label}</span>
                  <span className="mt-2 text-sm font-bold text-foreground tracking-wide">{spec.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-[3rem] glass p-8 sm:p-10 border border-black/5 shadow-2xl shadow-black/10">
              <h3 className="flex items-center gap-4 text-2xl font-black uppercase tracking-tighter text-foreground">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Info size={24} />
                </div>
                {t('carDetails.description')}
              </h3>
              <p className="mt-6 text-lg font-light text-foreground/40 leading-relaxed">
                Experience the perfect blend of performance and luxury with the {car.brand} {car.name}. 
                Whether you're planning a weekend getaway or a business trip, this {car.type} offers 
                unmatched comfort and reliability. Features include advanced safety systems, 
                premium audio, and climate control.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  t('carDetails.features.insurance'),
                  t('carDetails.features.sanitized'),
                  t('carDetails.features.mileage'),
                  t('carDetails.features.cancellation')
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-sm font-bold text-foreground/60 glass p-4 rounded-2xl border border-black/5">
                    <div className="rounded-full bg-primary/20 p-1.5 text-primary">
                      <CheckCircle2 size={16} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="overflow-hidden rounded-[3rem] border border-black/5 glass shadow-2xl shadow-black/10">
              <div className="bg-white p-8 text-foreground relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground">{t('carDetails.rentalPrice')}</p>
                  <div className="mt-4 flex items-baseline gap-3 text-primary">
                    {settings?.currency === 'MAD' ? (
                      <>
                        <span className="serif text-6xl font-black tracking-tighter">{car.pricePerDay}</span>
                        <span className="text-2xl font-black tracking-tighter">DH</span>
                      </>
                    ) : (
                      <>
                        <span className="serif text-6xl font-black tracking-tighter">
                          {settings?.currency === 'EUR' ? '€' : 
                           settings?.currency === 'AED' ? 'AED' :
                           settings?.currency === 'SAR' ? 'SR' : '$'}
                          {car.pricePerDay}
                        </span>
                      </>
                    )}
                    <span className="text-sm font-bold uppercase tracking-widest opacity-60 text-muted-foreground">{t('carDetails.perDay')}</span>
                  </div>
                </div>
                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/5 blur-[80px]" />
                <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-black/5 blur-[80px]" />
              </div>

              <div className="p-8">
                {!bookingOption ? (
                  <div className="space-y-10">
                    <div className="space-y-3">
                      <h3 className="serif text-3xl font-black text-foreground tracking-tighter uppercase">{t('carDetails.chooseMethod')}</h3>
                      <p className="text-lg text-foreground/40 font-light leading-relaxed">{t('carDetails.methodDesc')}</p>
                    </div>
                    
                    <div className="space-y-5">
                      <button
                        onClick={() => setBookingOption('website')}
                        className="flex w-full items-center justify-between rounded-3xl bg-primary p-6 transition-all hover:bg-primary/90 group shadow-xl shadow-primary/20 active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-6">
                          <div className="rounded-2xl bg-white/20 p-4 text-white shadow-inner transition-all group-hover:scale-110 group-hover:bg-white/30">
                            <CreditCard size={28} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm text-white uppercase tracking-widest">{t('carDetails.bookWebsite')}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-2 font-bold">{t('carDetails.websiteDesc')}</p>
                          </div>
                        </div>
                        <ChevronLeft size={24} className="rotate-180 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-2 rtl:rotate-0 rtl:group-hover:-translate-x-2" />
                      </button>

                      <button
                        onClick={handleWhatsAppBooking}
                        className="flex w-full items-center justify-between rounded-3xl bg-primary p-6 transition-all hover:bg-primary/90 group shadow-xl shadow-primary/20 active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-6">
                          <div className="rounded-2xl bg-white/20 p-4 text-white shadow-inner transition-all group-hover:scale-110 group-hover:bg-white/30">
                            <MessageCircle size={28} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-sm text-white uppercase tracking-widest">{t('carDetails.bookWhatsapp')}</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-2 font-bold">{t('carDetails.whatsappDesc')}</p>
                          </div>
                        </div>
                        <ChevronLeft size={24} className="rotate-180 text-white/40 group-hover:text-white transition-transform group-hover:translate-x-2 rtl:rotate-0 rtl:group-hover:-translate-x-2" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleWebsiteBooking} className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="serif text-3xl font-black text-foreground tracking-tighter uppercase">{t('carDetails.bookingForm')}</h3>
                      <button 
                        type="button"
                        onClick={() => setBookingOption(null)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors"
                      >
                        {t('carDetails.changeMethod')}
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 transition-colors group-focus-within:text-primary">{t('carDetails.fullName')}</label>
                        <input
                          required
                          type="text"
                          placeholder="John Doe"
                          className="mt-3 w-full rounded-2xl border border-black/5 bg-black/5 px-6 py-5 text-sm font-bold text-foreground outline-none transition-all focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 tracking-wide"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 transition-colors group-focus-within:text-primary">{t('carDetails.phone')}</label>
                        <input
                          required
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="mt-3 w-full rounded-2xl border border-black/5 bg-black/5 px-6 py-5 text-sm font-bold text-foreground outline-none transition-all focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 tracking-wide"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 transition-colors group-focus-within:text-primary">{t('carDetails.pickupCity')}</label>
                        <select
                          required
                          className="mt-3 w-full rounded-2xl border border-black/5 bg-black/5 px-6 py-5 text-sm font-bold text-foreground outline-none transition-all focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer tracking-wide"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        >
                          {car.cities.map((city, idx) => (
                            <option key={idx} value={city} className="bg-white text-foreground">{city}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 transition-colors group-focus-within:text-primary">{t('carDetails.pickupDate')}</label>
                          <DatePicker
                            selected={formData.pickupDate}
                            onChange={(date) => setFormData({ ...formData, pickupDate: date })}
                            selectsStart
                            startDate={formData.pickupDate}
                            endDate={formData.returnDate}
                            minDate={new Date()}
                            excludeDates={excludedDates}
                            placeholderText={t('carDetails.selectDate')}
                            className="mt-3 w-full rounded-2xl border border-black/5 bg-black/5 px-6 py-5 text-sm font-bold text-foreground outline-none transition-all focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 cursor-pointer tracking-wide [color-scheme:light]"
                            required
                          />
                        </div>
                        <div className="group">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 transition-colors group-focus-within:text-primary">{t('carDetails.returnDate')}</label>
                          <DatePicker
                            selected={formData.returnDate}
                            onChange={(date) => setFormData({ ...formData, returnDate: date })}
                            selectsEnd
                            startDate={formData.pickupDate}
                            endDate={formData.returnDate}
                            minDate={formData.pickupDate || new Date()}
                            excludeDates={excludedDates}
                            placeholderText={t('carDetails.selectDate')}
                            className="mt-3 w-full rounded-2xl border border-black/5 bg-black/5 px-6 py-5 text-sm font-bold text-foreground outline-none transition-all focus:bg-black/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 cursor-pointer tracking-wide [color-scheme:light]"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="group/btn relative mt-10 w-full overflow-hidden rounded-2xl bg-primary py-6 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-primary/40 transition-all hover:shadow-primary/60 active:scale-[0.98]"
                    >
                      <span className="relative z-10">{t('carDetails.confirm')}</span>
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                    </button>
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">
                      {t('carDetails.terms')}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
