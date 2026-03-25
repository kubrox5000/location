import React from 'react';
import { TrendingUp, Car, Calendar, CheckCircle, Clock, XCircle, DollarSign, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { bookingService, carService } from '../services/api';
import { Booking, Car as CarType } from '../types';
import { subDays, format, isAfter, startOfDay, parseISO, eachDayOfInterval, addDays, isWithinInterval } from 'date-fns';

import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [timeRange, setTimeRange] = React.useState<'day' | 'week' | 'month' | 'custom'>('week');
  const [customDays, setCustomDays] = React.useState(7);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [cars, setCars] = React.useState<CarType[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, carsData] = await Promise.all([
          bookingService.getAll(),
          carService.getAll()
        ]);
        setBookings(bookingsData);
        setCars(carsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getFilteredBookings = () => {
    const now = new Date();
    let startDate: Date;

    switch(timeRange) {
      case 'day': startDate = startOfDay(now); break;
      case 'week': startDate = subDays(now, 7); break;
      case 'month': startDate = subDays(now, 30); break;
      case 'custom': startDate = subDays(now, customDays); break;
      default: startDate = subDays(now, 7);
    }

    return bookings.filter(b => isAfter(parseISO(b.pickupDate), startDate));
  };

  const filteredBookings = getFilteredBookings();

  // Calculate stats based on filtered bookings
  const totalEarnings = filteredBookings.reduce((acc, b) => b.status === 'Confirmed' ? acc + b.totalPrice : acc, 0);
  const totalBookingsCount = filteredBookings.length;
  const pendingBookingsCount = filteredBookings.filter(b => b.status === 'Pending').length;
  const completedBookingsCount = filteredBookings.filter(b => b.status === 'Confirmed').length;

  const stats = [
    { 
      label: t('admin.dashboard.stats.earnings'), 
      value: settings?.currency === 'MAD' ? `${totalEarnings.toLocaleString()} DH` : `$${totalEarnings.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'bg-primary' 
    },
    { 
      label: t('admin.dashboard.stats.cars'), 
      value: cars.length.toString(), 
      icon: Car, 
      color: 'bg-primary/80' 
    },
    { 
      label: t('admin.dashboard.stats.bookings'), 
      value: totalBookingsCount.toString(), 
      icon: Calendar, 
      color: 'bg-primary/60' 
    },
    { 
      label: t('admin.dashboard.stats.pending'), 
      value: pendingBookingsCount.toString(), 
      icon: Clock, 
      color: 'bg-primary/40' 
    },
    { 
      label: t('admin.dashboard.stats.completed'), 
      value: completedBookingsCount.toString(), 
      icon: CheckCircle, 
      color: 'bg-primary/20' 
    },
  ];

  const getChartData = () => {
    const now = new Date();
    let days: number;
    switch(timeRange) {
      case 'day': days = 1; break;
      case 'week': days = 7; break;
      case 'month': days = 30; break;
      case 'custom': days = customDays; break;
      default: days = 7;
    }

    const interval = eachDayOfInterval({
      start: subDays(now, days - 1),
      end: now
    });

    return interval.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayBookings = filteredBookings.filter(b => b.pickupDate === dateStr);
      return {
        name: format(date, days > 7 ? 'MMM dd' : 'EEE'),
        bookings: dayBookings.length,
        earnings: dayBookings.reduce((acc, b) => b.status === 'Confirmed' ? acc + b.totalPrice : acc, 0)
      };
    });
  };

  const dynamicData = getChartData();

  const getAvailableCarsToday = () => {
    const today = startOfDay(new Date());
    const dateStr = format(today, 'yyyy-MM-dd');

    return cars.filter(car => {
      if (car.availability && car.availability[dateStr] === false) return false;
      const isBooked = bookings.some(booking => {
        if (booking.carId !== car.id || booking.status === 'Cancelled') return false;
        const start = startOfDay(parseISO(booking.pickupDate));
        const end = startOfDay(parseISO(booking.returnDate));
        return isWithinInterval(today, { start, end });
      });
      return !isBooked;
    });
  };

  const availableCarsToday = getAvailableCarsToday();

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="serif text-2xl font-light tracking-tight text-foreground">{t('admin.dashboard.title')}</h1>
          <p className="text-foreground/60 text-sm font-light">{t('admin.dashboard.subtitle')}</p>
        </div>

        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 rounded-2xl border border-primary/10 bg-white px-4 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-primary/5 active:scale-95"
          >
            <Filter size={16} className="text-primary/40" />
            <span>
              {timeRange === 'day' ? t('admin.dashboard.today') : 
               timeRange === 'week' ? t('admin.dashboard.thisWeek') : 
               timeRange === 'month' ? t('admin.dashboard.thisMonth') : 
               t('admin.dashboard.lastDays', { days: customDays })}
            </span>
            <ChevronDown size={16} className={`text-primary/40 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute end-0 z-20 mt-2 w-56 rounded-3xl border border-primary/10 bg-white p-2 shadow-xl"
                >
                  <button 
                    onClick={() => { setTimeRange('day'); setIsFilterOpen(false); }}
                    className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${timeRange === 'day' ? 'bg-primary/5 text-primary' : 'text-foreground/60 hover:bg-primary/5'}`}
                  >
                    {t('admin.dashboard.today')}
                  </button>
                  <button 
                    onClick={() => { setTimeRange('week'); setIsFilterOpen(false); }}
                    className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${timeRange === 'week' ? 'bg-primary/5 text-primary' : 'text-foreground/60 hover:bg-primary/5'}`}
                  >
                    {t('admin.dashboard.thisWeek')}
                  </button>
                  <button 
                    onClick={() => { setTimeRange('month'); setIsFilterOpen(false); }}
                    className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-all ${timeRange === 'month' ? 'bg-primary/5 text-primary' : 'text-foreground/60 hover:bg-primary/5'}`}
                  >
                    {t('admin.dashboard.thisMonth')}
                  </button>
                  <div className="my-2 border-t border-primary/10" />
                  <div className="px-4 py-2">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.dashboard.customDays')}</p>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={customDays}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCustomDays(val > 0 ? val : 1);
                          setTimeRange('custom');
                        }}
                        className="w-full rounded-lg border border-primary/10 px-3 py-1.5 text-sm font-bold text-foreground focus:border-primary focus:outline-none bg-primary/5"
                      />
                      <button 
                        onClick={() => { setTimeRange('custom'); setIsFilterOpen(false); }}
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground transition-all hover:bg-primary/90"
                      >
                        {t('admin.dashboard.apply')}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group rounded-[2rem] border border-primary/5 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-2xl ${stat.color} p-3 text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <stat.icon size={24} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                +12%
              </div>
            </div>
            <div className="mt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20">{stat.label}</p>
              <p className="serif mt-1 text-3xl font-light text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-[2.5rem] border border-primary/5 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="serif text-xl font-light text-foreground">
              {timeRange === 'day' ? t('admin.dashboard.today') : 
               timeRange === 'week' ? t('admin.dashboard.thisWeek') : 
               timeRange === 'month' ? t('admin.dashboard.thisMonth') : 
               t('admin.dashboard.lastDays', { days: customDays })} {t('admin.dashboard.charts.bookings')}
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#0f172a', opacity: 0.3 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#0f172a', opacity: 0.3 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                />
                <Area type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-primary/5 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="serif text-xl font-light text-foreground">
              {timeRange === 'day' ? t('admin.dashboard.today') : 
               timeRange === 'week' ? t('admin.dashboard.thisWeek') : 
               timeRange === 'month' ? t('admin.dashboard.thisMonth') : 
               t('admin.dashboard.lastDays', { days: customDays })} {t('admin.dashboard.charts.earnings')}
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#0f172a', opacity: 0.3 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#0f172a', opacity: 0.3 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="earnings" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-primary/5 bg-white p-8 shadow-sm lg:col-span-2">
          <h3 className="serif text-xl font-light text-foreground mb-8">{t('admin.dashboard.recentBookings')}</h3>
          <div className="grid grid-cols-1 gap-4">
            {bookings.slice(0, 5).map((booking, idx) => {
              const car = cars.find(c => c.id === booking.carId);
              return (
                <div key={idx} className="group flex items-center justify-between rounded-2xl border border-transparent p-4 transition-all hover:bg-secondary/50 hover:border-primary/5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary transition-transform group-hover:scale-110">
                      {booking.customerName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{booking.customerName}</p>
                      <p className="text-xs text-foreground/40 font-light">{car ? `${car.brand} ${car.name}` : t('admin.fleet.unknownCar')} • {booking.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{booking.pickupDate}</p>
                    <span className={`mt-1 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      booking.status === 'Confirmed' ? 'bg-primary/10 text-primary' : 
                      booking.status === 'Pending' ? 'bg-accent/10 text-accent' : 'bg-red-50 text-red-500'
                    }`}>
                      {booking.status === 'Confirmed' ? t('admin.bookings.status.confirmed') : 
                       booking.status === 'Pending' ? t('admin.bookings.status.pending') : t('admin.bookings.status.cancelled')}
                    </span>
                  </div>
                </div>
              );
            })}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-secondary p-4 text-foreground/20 mb-4">
                  <Calendar size={32} />
                </div>
                <p className="text-sm text-foreground/30">{t('admin.dashboard.noBookings')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-[2.5rem] border border-primary/5 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="serif text-xl font-light text-foreground">{t('admin.dashboard.availableToday')}</h3>
            <button 
              onClick={() => window.location.href = '/admin/available-cars'}
              className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-primary transition-colors"
            >
              {t('admin.dashboard.viewAll')}
              <ChevronDown size={14} className="-rotate-90 transition-transform group-hover:translate-x-1 rtl:rotate-90 rtl:group-hover:-translate-x-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {availableCarsToday.slice(0, 4).map((car) => (
              <div key={car.id} className="group flex items-center gap-4 rounded-2xl border border-transparent p-3 transition-all hover:bg-secondary/50 hover:border-primary/5">
                <div className="relative h-12 w-20 overflow-hidden rounded-xl">
                  <img src={car.images[0]} alt={car.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{car.brand} {car.name}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{t('admin.bookings.available')}</p>
                </div>
              </div>
            ))}
            {availableCarsToday.length === 0 && (
              <p className="col-span-full text-center text-xs text-foreground/30 py-8">{t('admin.dashboard.noAvailable')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
