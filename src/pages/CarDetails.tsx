import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, Fuel, Gauge, MapPin, Calendar, 
  ChevronLeft, MessageCircle, CreditCard, 
  CheckCircle2, Info, DoorOpen, Snowflake
} from 'lucide-react';
import { carService, bookingService } from '../services/api';
import { Car, Booking } from '../types';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { addDays, eachDayOfInterval, format, parseISO } from 'date-fns';

import { useTranslation } from 'react-i18next';

export const CarDetails = () => {
  const { t, i18n } = useTranslation();
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
        const [carsData, bookingsData] = await Promise.all([
          carService.getAll(),
          bookingService.getAll()
        ]);
        const found = carsData.find(c => c.id === id);
        setCar(found || null);
        if (found) {
          setFormData(prev => ({ ...prev, city: found.cities[0] || '' }));
        }
        setBookings(bookingsData.filter(b => b.carId === id && b.status !== 'Cancelled'));
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

  if (loading) return <div className="p-20 text-center">{t('carDetails.loading')}</div>;

  if (!car) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h2 className="serif text-2xl font-light text-foreground">{t('carDetails.notFound')}</h2>
        <button onClick={() => navigate('/cars')} className="mt-4 text-primary font-bold hover:underline">{t('carDetails.backToFleet')}</button>
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
      customerPhone: formData.phone,
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
    const message = `Hello, I want to book ${car.brand} ${car.name} in ${formData.city}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/1234567890?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-sm font-bold text-foreground/40 transition-colors hover:text-primary"
      >
        <ChevronLeft size={18} className="rtl:rotate-180" />
        {t('carDetails.back')}
      </button>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: Images & Specs */}
        <div className="space-y-8">
          <div className="space-y-4">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-video overflow-hidden rounded-3xl border border-primary/10 shadow-lg"
            >
              <img
                src={car.images[activeImage]}
                alt={car.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            
            {car.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {car.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${car.name} ${idx}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
            {[
              { icon: Users, label: t('carDetails.specs.seats'), value: car.seats },
              { icon: DoorOpen, label: t('carDetails.specs.doors'), value: car.doors },
              { icon: Gauge, label: t('carDetails.specs.transmission'), value: car.transmission },
              { icon: Fuel, label: t('carDetails.specs.fuel'), value: car.fuelType },
              { icon: Snowflake, label: t('carDetails.specs.ac'), value: car.airConditioning ? t('carDetails.specs.yes') : t('carDetails.specs.no') },
              { icon: MapPin, label: t('carDetails.specs.cities'), value: car.cities.join(', ') },
            ].map((spec, idx) => (
              <div key={idx} className="flex flex-col items-center rounded-2xl bg-primary/5 p-4 text-center">
                <spec.icon size={20} className="mb-2 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{spec.label}</span>
                <span className="text-sm font-bold text-foreground">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-primary/5 p-8">
            <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Info size={20} className="text-primary" />
              {t('carDetails.description')}
            </h3>
            <p className="mt-4 text-foreground/60 leading-relaxed">
              Experience the perfect blend of performance and luxury with the {car.brand} {car.name}. 
              Whether you're planning a weekend getaway or a business trip, this {car.type} offers 
              unmatched comfort and reliability. Features include advanced safety systems, 
              premium audio, and climate control.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                t('carDetails.features.insurance'),
                t('carDetails.features.sanitized'),
                t('carDetails.features.mileage'),
                t('carDetails.features.cancellation')
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm font-medium text-foreground/60">
                  <CheckCircle2 size={16} className="text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Booking Card */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-2xl">
            <div className="bg-primary p-8 text-primary-foreground">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t('carDetails.rentalPrice')}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="serif text-4xl font-light">${car.pricePerDay}</span>
                <span className="text-sm font-light opacity-60">{t('carDetails.perDay')}</span>
              </div>
            </div>

            <div className="p-8">
              {!bookingOption ? (
                <div className="space-y-4">
                  <h3 className="serif text-xl font-light text-foreground">{t('carDetails.chooseMethod')}</h3>
                  <p className="text-sm text-foreground/60">{t('carDetails.methodDesc')}</p>
                  
                  <button
                    onClick={() => setBookingOption('website')}
                    className="flex w-full items-center justify-between rounded-2xl border-2 border-primary/5 p-4 transition-all hover:border-primary hover:bg-primary/5 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <CreditCard size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{t('carDetails.bookWebsite')}</p>
                        <p className="text-xs text-foreground/60">{t('carDetails.websiteDesc')}</p>
                      </div>
                    </div>
                    <ChevronLeft size={20} className="rotate-180 text-foreground/20 group-hover:text-primary rtl:rotate-0" />
                  </button>

                  <button
                    onClick={handleWhatsAppBooking}
                    className="flex w-full items-center justify-between rounded-2xl border-2 border-primary/5 p-4 transition-all hover:border-primary hover:bg-primary/5 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <MessageCircle size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-foreground">{t('carDetails.bookWhatsapp')}</p>
                        <p className="text-xs text-foreground/60">{t('carDetails.whatsappDesc')}</p>
                      </div>
                    </div>
                    <ChevronLeft size={20} className="rotate-180 text-foreground/20 group-hover:text-primary rtl:rotate-0" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWebsiteBooking} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="serif text-xl font-light text-foreground">{t('carDetails.bookingForm')}</h3>
                    <button 
                      type="button"
                      onClick={() => setBookingOption(null)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      {t('carDetails.changeMethod')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('carDetails.fullName')}</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="mt-1 w-full rounded-xl border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('carDetails.phone')}</label>
                      <input
                        required
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="mt-1 w-full rounded-xl border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('carDetails.pickupCity')}</label>
                      <select
                        required
                        className="mt-1 w-full rounded-xl border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      >
                        {car.cities.map((city, idx) => (
                          <option key={idx} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('carDetails.pickupDate')}</label>
                        <DatePicker
                          selected={formData.pickupDate}
                          onChange={(date) => setFormData({ ...formData, pickupDate: date })}
                          selectsStart
                          startDate={formData.pickupDate}
                          endDate={formData.returnDate}
                          minDate={new Date()}
                          excludeDates={excludedDates}
                          placeholderText={t('carDetails.selectDate')}
                          className="mt-1 w-full rounded-xl border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('carDetails.returnDate')}</label>
                        <DatePicker
                          selected={formData.returnDate}
                          onChange={(date) => setFormData({ ...formData, returnDate: date })}
                          selectsEnd
                          startDate={formData.pickupDate}
                          endDate={formData.returnDate}
                          minDate={formData.pickupDate || new Date()}
                          excludeDates={excludedDates}
                          placeholderText={t('carDetails.selectDate')}
                          className="mt-1 w-full rounded-xl border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="mt-6 w-full rounded-2xl bg-primary py-4 font-black text-primary-foreground shadow-xl transition-all hover:bg-primary/90 active:scale-95"
                  >
                    {t('carDetails.confirm')}
                  </button>
                  <p className="text-center text-[10px] text-foreground/30">
                    {t('carDetails.terms')}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
