import React from 'react';
import { bookingService, carService } from '../services/api';
import { Booking, Car } from '../types';
import { Clock, MapPin, Phone, User, Calendar, Search, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, addDays, startOfDay, parseISO } from 'date-fns';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const AdminReceiveTomorrow = () => {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [cars, setCars] = React.useState<Car[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, carsData] = await Promise.all([
        bookingService.getAll(),
        carService.getAll()
      ]);
      setBookings(bookingsData);
      setCars(carsData);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getCarsToReceiveTomorrow = () => {
    const tomorrow = startOfDay(addDays(new Date(), 1));
    const dateStr = format(tomorrow, 'yyyy-MM-dd');

    let filtered = bookings
      .filter(booking => booking.status === 'Confirmed' && booking.returnDate === dateStr)
      .map(booking => {
        const car = cars.find(c => c.id === booking.carId);
        return { booking, car };
      })
      .filter(item => item.car !== undefined);

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(({ booking, car }) => 
        booking.customerName.toLowerCase().includes(lowerSearch) ||
        car?.name.toLowerCase().includes(lowerSearch) ||
        car?.brand.toLowerCase().includes(lowerSearch)
      );
    }

    return filtered;
  };

  const carsToReceiveTomorrow = getCarsToReceiveTomorrow();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="serif text-2xl font-light tracking-tight text-foreground">Receive Tomorrow</h1>
          <p className="text-foreground/60 text-sm font-light">
            Vehicles scheduled to be returned on {format(addDays(new Date(), 1), 'PPP')}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
            <input
              type="text"
              placeholder="Search by customer or car..."
              className="w-full rounded-xl border border-primary/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {carsToReceiveTomorrow.map(({ booking, car }) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={booking.id}
            className="group overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="aspect-video overflow-hidden">
              <img 
                src={car?.images[0]} 
                alt={car?.name} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{car?.brand}</span>
                <h3 className="serif text-lg font-light text-foreground">{car?.name}</h3>
              </div>

              <div className="space-y-3 border-t border-primary/5 pt-4">
                <div className="flex items-center gap-3 text-sm text-foreground/60 font-light">
                  <div className="rounded-lg bg-primary/5 p-1.5">
                    <User size={14} className="text-primary" />
                  </div>
                  <span className="font-bold text-foreground">{booking.customerName}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/60 font-light">
                  <div className="rounded-lg bg-primary/5 p-1.5">
                    <Phone size={14} className="text-primary" />
                  </div>
                  <span>{booking.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/60 font-light">
                  <div className="rounded-lg bg-primary/5 p-1.5">
                    <MapPin size={14} className="text-primary" />
                  </div>
                  <span>{booking.city}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-primary/5 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <Clock size={14} />
                  Return Tomorrow
                </div>
                <button 
                  onClick={() => window.location.href = `/admin/bookings?id=${booking.id}`}
                  className="text-xs font-bold text-foreground/30 hover:text-primary"
                >
                  Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {carsToReceiveTomorrow.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/10 p-20 text-center">
            <div className="rounded-full bg-primary/5 p-4 text-green-600">
              <Clock size={48} />
            </div>
            <h3 className="mt-4 serif text-lg font-light text-foreground">No Returns Tomorrow</h3>
            <p className="mt-2 text-foreground/60 text-sm font-light">There are no vehicles scheduled to be returned on this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};
