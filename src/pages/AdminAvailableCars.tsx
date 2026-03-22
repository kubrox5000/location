import React from 'react';
import { Car, Booking } from '../types';
import { carService, bookingService } from '../services/api';
import { CheckCircle, XCircle, MapPin, Car as CarIcon, Calendar, Search, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { format, isWithinInterval, parseISO, startOfDay, addDays } from 'date-fns';

export const AdminAvailableCars = () => {
  const [cars, setCars] = React.useState<Car[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsData, bookingsData] = await Promise.all([
        carService.getAll(),
        bookingService.getAll()
      ]);
      setCars(carsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableCars = () => {
    const targetDate = startOfDay(selectedDate);
    const dateStr = format(targetDate, 'yyyy-MM-dd');

    return cars.filter(car => {
      // 1. Check manual availability blocks
      if (car.availability && car.availability[dateStr] === false) {
        return false;
      }

      // 2. Check existing bookings
      const isBooked = bookings.some(booking => {
        if (booking.carId !== car.id || booking.status === 'Cancelled') return false;
        
        const start = startOfDay(parseISO(booking.pickupDate));
        const end = startOfDay(parseISO(booking.returnDate));
        
        return isWithinInterval(targetDate, { start, end });
      });

      if (isBooked) return false;

      // 3. Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          car.name.toLowerCase().includes(searchLower) ||
          car.brand.toLowerCase().includes(searchLower) ||
          car.type.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  };

  const availableCars = getAvailableCars();

  if (loading) return <div className="p-20 text-center text-primary font-light serif text-2xl">Checking availability...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="serif text-2xl font-light tracking-tight text-foreground">Available Cars</h1>
          <p className="text-foreground/60 text-sm font-light">Real-time view of vehicles ready for rental on {format(selectedDate, 'PPP')}.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
            <input
              type="text"
              placeholder="Search available cars..."
              className="rounded-xl border border-primary/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
            <input
              type="date"
              className="rounded-xl border border-primary/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableCars.map((car) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={car.id}
            className="group overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="aspect-video overflow-hidden">
              <img 
                src={car.images[0]} 
                alt={car.name} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{car.brand}</span>
                  <h3 className="serif text-lg font-light text-foreground">{car.name}</h3>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  <CheckCircle size={12} />
                  Available
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-foreground/60 font-light">
                  <CarIcon size={16} className="text-foreground/30" />
                  {car.type}
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60 font-light">
                  <MapPin size={16} className="text-foreground/30" />
                  {car.cities.length} Cities
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-primary/10 pt-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Daily Rate</p>
                  <p className="text-xl font-black text-foreground">${car.pricePerDay}</p>
                </div>
                <button 
                  onClick={() => window.location.href = `/admin/bookings?carId=${car.id}`}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary/90"
                >
                  Create Booking
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {availableCars.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary/10 p-20 text-center">
            <div className="rounded-full bg-primary/5 p-4 text-foreground/30">
              <XCircle size={48} />
            </div>
            <h3 className="mt-4 serif text-lg font-light text-foreground">No Cars Available</h3>
            <p className="mt-2 text-foreground/60 text-sm font-light">All vehicles are either booked or blocked for this date.</p>
          </div>
        )}
      </div>
    </div>
  );
};
