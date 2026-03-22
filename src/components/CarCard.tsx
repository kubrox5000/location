import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Gauge, MapPin, ArrowRight, DoorOpen, Snowflake, ChevronRight } from 'lucide-react';
import { Car } from '../types';
import { motion } from 'motion/react';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 border border-primary/5"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={car.images[0]}
          alt={car.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        
        {/* Badges */}
        <div className="absolute left-6 top-6 flex flex-col gap-2">
          <span className="rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground backdrop-blur-md">
            {car.type}
          </span>
        </div>
        
        <div className="absolute bottom-6 left-6">
          <p className="serif text-2xl font-light text-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 translate-y-4">
            ${car.pricePerDay}<span className="text-sm">/day</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{car.brand}</p>
            <h3 className="serif mt-1 text-2xl font-light text-foreground">{car.name}</h3>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-[10px] font-bold text-primary">
            <MapPin size={12} />
            {car.cities[0]}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="mt-8 grid grid-cols-2 gap-y-4 border-t border-primary/10 pt-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
              <Users size={14} />
            </div>
            <span className="text-xs font-medium text-foreground/60">{car.seats} Seats</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
              <Gauge size={14} />
            </div>
            <span className="text-xs font-medium text-foreground/60">{car.transmission}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
              <Fuel size={14} />
            </div>
            <span className="text-xs font-medium text-foreground/60">{car.fuelType}</span>
          </div>
          {car.airConditioning && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Snowflake size={14} />
              </div>
              <span className="text-xs font-medium text-foreground/60">Climate Control</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="mt-auto pt-8">
          <Link
            to={`/car/${car.id}`}
            className="group/btn flex w-full items-center justify-between rounded-2xl bg-primary/5 px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary border border-primary/10 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95"
          >
            Reserve Now
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover/btn:translate-x-1">
              <ChevronRight size={14} />
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
