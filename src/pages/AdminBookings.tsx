import React from 'react';
import { Calendar, Search, CheckCircle, XCircle, Clock, Eye, Plus, User, Phone, MapPin, DollarSign, Loader2, Car as CarIcon } from 'lucide-react';
import { bookingService, carService, cityService } from '../services/api';
import { Booking, Car } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { eachDayOfInterval, format, parseISO, isWithinInterval, startOfDay, addDays } from 'date-fns';

import { useTranslation } from 'react-i18next';

export const AdminBookings = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [cities, setCities] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    customerName: '',
    phone: '',
    carId: '',
    city: '',
    pickupDate: null as Date | null,
    returnDate: null as Date | null,
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, carsData, citiesData] = await Promise.all([
        bookingService.getAll(),
        carService.getAll(),
        cityService.getAll()
      ]);
      setBookings(bookingsData);
      setCars(carsData);
      setCities(citiesData);
    } catch (error) {
      toast.error(t('admin.bookings.errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  const multiplier = 1; // Default multiplier for admin manual booking

  const calculateTotalPrice = () => {
    if (!formData.carId || !formData.pickupDate || !formData.returnDate) return 0;
    const car = cars.find(c => c.id === formData.carId);
    if (!car) return 0;

    const diffTime = Math.abs(formData.returnDate.getTime() - formData.pickupDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    return diffDays * car.pricePerDay;
  };

  const excludedDates = React.useMemo(() => {
    if (!formData.carId) return [];
    const dates: Date[] = [];
    
    // 1. Existing bookings for this car
    bookings.filter(b => b.carId === formData.carId && b.status !== 'Cancelled').forEach(booking => {
      const start = parseISO(booking.pickupDate);
      const end = parseISO(booking.returnDate);
      const interval = eachDayOfInterval({ start, end });
      dates.push(...interval);
    });

    // 2. Manual availability blocks
    const car = cars.find(c => c.id === formData.carId);
    if (car?.availability) {
      Object.entries(car.availability).forEach(([dateStr, isAvailable]) => {
        if (!isAvailable) {
          dates.push(parseISO(dateStr));
        }
      });
    }

    return dates;
  }, [formData.carId, bookings, cars]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pickupDate || !formData.returnDate) {
      toast.error(t('admin.bookings.errorDates'));
      return;
    }
    setIsSubmitting(true);

    try {
      const totalPrice = calculateTotalPrice();
      const newBooking = await bookingService.create({
        ...formData,
        pickupDate: format(formData.pickupDate, 'yyyy-MM-dd'),
        returnDate: format(formData.returnDate, 'yyyy-MM-dd'),
        totalPrice,
        status: 'Confirmed',
      });
      setBookings([newBooking, ...bookings]);
      setIsCreateModalOpen(false);
      setFormData({
        customerName: '',
        phone: '',
        carId: '',
        city: '',
        pickupDate: null,
        returnDate: null,
      });
      toast.success(t('admin.bookings.successCreate'));
    } catch (error) {
      toast.error(t('admin.bookings.errorCreate'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCarName = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    return car ? `${car.brand} ${car.name}` : `ID: ${carId}`;
  };

  const getCarType = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    return car ? car.type : '-';
  };

  const updateStatus = async (id: string, status: 'Confirmed' | 'Cancelled') => {
    try {
      await bookingService.updateStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast.success(t('admin.bookings.successStatus', { status: status.toLowerCase() }));
    } catch (error) {
      toast.error(t('admin.bookings.errorStatus'));
    }
  };

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

  if (loading) return <div className="p-20 text-center text-primary font-light serif text-2xl">{t('admin.bookings.loading')}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="serif text-2xl font-light tracking-tight text-foreground">{t('admin.bookings.title')}</h1>
          <p className="text-foreground/60 text-sm font-light">{t('admin.bookings.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus size={18} />
          {t('admin.bookings.addNew')}
        </button>
      </div>

      <div className="rounded-3xl border border-primary/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.customer')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.phone')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.vehicle')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.type')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.city')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.dates')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.total')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.status')}</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {booking.customerName[0]}
                      </div>
                      <span className="font-bold text-foreground">{booking.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60 font-light">{booking.phone}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{getCarName(booking.carId)}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-primary/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {getCarType(booking.carId)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground/60 font-light">{booking.city}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-foreground">{booking.pickupDate}</span>
                      <span className="text-foreground/30">{t('admin.bookings.to')} {booking.returnDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">${booking.totalPrice}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      booking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                      booking.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {booking.status === 'Confirmed' ? t('admin.bookings.status.confirmed') : 
                       booking.status === 'Pending' ? t('admin.bookings.status.pending') : t('admin.bookings.status.cancelled')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {booking.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(booking.id, 'Confirmed')}
                            className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 transition-all"
                            title={t('admin.bookings.actions.confirm')}
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => updateStatus(booking.id, 'Cancelled')}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition-all"
                            title={t('admin.bookings.actions.cancel')}
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => setSelectedBooking(booking)}
                        className="rounded-lg p-2 text-foreground/30 hover:bg-primary/10 hover:text-primary transition-all"
                        title={t('admin.bookings.actions.viewDetails')}
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Booking Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl overflow-y-auto max-h-[90vh] border border-primary/10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="serif text-2xl font-light tracking-tight text-foreground">{t('admin.bookings.modal.createTitle')}</h2>
                  <p className="text-foreground/60 text-sm font-light">{t('admin.bookings.modal.createSubtitle')}</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full p-2 hover:bg-primary/5 transition-all"
                >
                  <XCircle size={24} className="text-foreground/30" />
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.modal.customerName')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                      <input
                        required
                        type="text"
                        placeholder={t('admin.bookings.modal.customerPlaceholder')}
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.modal.phone')}</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                      <input
                        required
                        type="tel"
                        placeholder="+971 XX XXX XXXX"
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.modal.selectVehicle')}</label>
                    <div className="relative">
                      <CarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                      <select
                        required
                        className="w-full appearance-none rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                        value={formData.carId}
                        onChange={(e) => setFormData({ ...formData, carId: e.target.value })}
                      >
                        <option value="">{t('admin.bookings.modal.chooseCar')}</option>
                        {cars.map(car => (
                          <option key={car.id} value={car.id}>{car.brand} {car.name} (${car.pricePerDay}/{t('admin.bookings.day')})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.modal.selectCity')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                      <select
                        required
                        className="w-full appearance-none rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      >
                        <option value="">{t('admin.bookings.modal.chooseCity')}</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.modal.pickupDate')}</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 z-10" size={18} />
                      <DatePicker
                        required
                        selected={formData.pickupDate}
                        onChange={(date) => setFormData({ ...formData, pickupDate: date })}
                        selectsStart
                        startDate={formData.pickupDate}
                        endDate={formData.returnDate}
                        minDate={new Date()}
                        excludeDates={excludedDates}
                        placeholderText={t('admin.bookings.modal.selectDate')}
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.bookings.modal.returnDate')}</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 z-10" size={18} />
                      <DatePicker
                        required
                        selected={formData.returnDate}
                        onChange={(date) => setFormData({ ...formData, returnDate: date })}
                        selectsEnd
                        startDate={formData.pickupDate}
                        endDate={formData.returnDate}
                        minDate={formData.pickupDate || new Date()}
                        excludeDates={excludedDates}
                        placeholderText={t('admin.bookings.modal.selectDate')}
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-primary/5 p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary p-2 text-primary-foreground">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">{t('admin.bookings.modal.estimatedTotal')}</p>
                      <p className="text-2xl font-black text-primary">${calculateTotalPrice()}</p>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={18} />}
                    {t('admin.bookings.modal.confirmButton')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="serif text-2xl font-light tracking-tight text-foreground">{t('admin.bookings.modal.detailsTitle')}</h2>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="rounded-full p-2 hover:bg-primary/5 transition-all"
                >
                  <XCircle size={24} className="text-foreground/30" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.modal.customerName')}</p>
                    <p className="font-bold text-foreground">{selectedBooking.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.modal.phone')}</p>
                    <p className="font-bold text-primary">{selectedBooking.phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.table.vehicle')}</p>
                    <p className="font-bold text-foreground">{getCarName(selectedBooking.carId)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.table.type')}</p>
                    <span className="inline-block rounded-full bg-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                      {getCarType(selectedBooking.carId)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.modal.pickupDate')}</p>
                    <p className="font-bold text-foreground">{selectedBooking.pickupDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.modal.returnDate')}</p>
                    <p className="font-bold text-foreground">{selectedBooking.returnDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.table.city')}</p>
                    <p className="font-bold text-foreground">{selectedBooking.city}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">{t('admin.bookings.table.total')}</p>
                    <p className="text-xl font-black text-primary">${selectedBooking.totalPrice}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-primary/10">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/30 mb-2">{t('admin.bookings.table.status')}</p>
                  <span className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                    selectedBooking.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 
                    selectedBooking.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {selectedBooking.status === 'Confirmed' ? t('admin.bookings.status.confirmed') : 
                     selectedBooking.status === 'Pending' ? t('admin.bookings.status.pending') : t('admin.bookings.status.cancelled')}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full rounded-2xl bg-primary py-4 font-bold text-white shadow-lg transition-all hover:bg-primary/90"
                >
                  {t('admin.bookings.modal.close')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Available Cars Section */}
      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="serif text-xl font-light tracking-tight text-foreground">{t('admin.dashboard.availableToday')}</h2>
            <p className="text-foreground/60 text-sm font-light">{t('admin.bookings.availableSubtitle', { date: format(new Date(), 'PPP') })}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/admin/available-cars'}
            className="text-sm font-bold text-primary hover:underline"
          >
            {t('admin.bookings.viewCalendar')}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {availableCarsToday.map((car) => (
            <div key={car.id} className="group relative overflow-hidden rounded-2xl border border-primary/10 bg-white p-4 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <img src={car.images[0]} alt={car.name} className="h-12 w-20 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">{car.brand} {car.name}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{car.type}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-primary/5 pt-4">
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                  <CheckCircle size={12} />
                  {t('admin.bookings.available')}
                </div>
                <p className="text-sm font-black text-foreground">${car.pricePerDay}/{t('admin.bookings.day')}</p>
              </div>
            </div>
          ))}
          {availableCarsToday.length === 0 && (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-primary/5 p-8 text-center">
              <p className="text-sm font-medium text-foreground/30">{t('admin.dashboard.noAvailable')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
