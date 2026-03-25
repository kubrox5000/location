import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Fuel, Gauge, MapPin, DoorOpen, Snowflake, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Car } from '../types';
import { motion } from 'motion/react';
import { useSettings } from '../context/SettingsContext';

interface CarCardProps {
  car: Car;
}

export const CarCard: React.FC<CarCardProps> = ({ car }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();

  const translatedType = t(`admin.fleet.options.types.${car.type.toLowerCase()}`);
  const translatedTransmission = t(`admin.fleet.options.transmissions.${car.transmission.toLowerCase()}`);
  const translatedFuel = t(`admin.fleet.options.fuels.${car.fuelType.toLowerCase()}`);

  const currencySymbol = settings?.currency === 'MAD' ? 'DH' : 
                        settings?.currency === 'EUR' ? '€' : 
                        settings?.currency === 'AED' ? 'AED' :
                        settings?.currency === 'SAR' ? 'SR' : '$';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col overflow-hidden rounded-[2rem] bg-white transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border border-black/5 hover:border-primary/30"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={car.images[0]}
          alt={car.name}
          className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 brightness-95 group-hover:brightness-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-40" />
        
        {/* Badges */}
        <div className="absolute inset-y-6 start-6 flex flex-col items-start gap-2">
          <span className="rounded-full bg-primary px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/20 border border-primary/20">
            {translatedType}
          </span>
        </div>
        
        <div className="absolute bottom-6 start-6">
          <p className="serif text-2xl font-black text-primary transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100 translate-y-4">
            {settings?.currency === 'MAD' ? (
              <>{car.pricePerDay} <span className="text-sm">DH</span></>
            ) : (
              <>{currencySymbol}{car.pricePerDay}</>
            )}
            <span className="text-xs font-light opacity-60 italic"> {t('carDetails.perDay')}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">{car.brand}</p>
            <h3 className="serif text-xl font-black tracking-tighter text-foreground leading-none">{car.name}</h3>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-[9px] font-black text-primary border border-primary/20 backdrop-blur-md shadow-lg shadow-primary/10">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
              <MapPin size={10} />
            </div>
            {car.cities[0]}
          </div>
        </div>

        {/* Specs Grid */}
        <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-black/5 pt-6">
          <div className="flex items-center gap-3 group/spec">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-500 group-hover/spec:scale-110">
              <Users size={16} />
            </div>
            <span className="text-[10px] font-bold text-foreground/60 transition-colors tracking-wide">{car.seats} {t('carDetails.specs.seats')}</span>
          </div>
          <div className="flex items-center gap-3 group/spec">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-500 group-hover/spec:scale-110">
              <Gauge size={16} />
            </div>
            <span className="text-[10px] font-bold text-foreground/60 transition-colors tracking-wide">{translatedTransmission}</span>
          </div>
          <div className="flex items-center gap-3 group/spec">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-500 group-hover/spec:scale-110">
              <Fuel size={16} />
            </div>
            <span className="text-[10px] font-bold text-foreground/60 transition-colors tracking-wide">{translatedFuel}</span>
          </div>
          {car.airConditioning && (
            <div className="flex items-center gap-3 group/spec">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-500 group-hover/spec:scale-110">
                <Snowflake size={16} />
              </div>
              <span className="text-[10px] font-bold text-foreground/60 transition-colors tracking-wide">{t('carDetails.specs.ac')}</span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="mt-auto pt-8">
          <Link
            to={`/car/${car.id}`}
            className="group/btn relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-primary px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98] whitespace-nowrap"
          >
            <span className="relative z-10">{t('carDetails.reserveNow')}</span>
            <ChevronRight size={16} className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-2 rtl:rotate-180 rtl:group-hover/btn:-translate-x-2" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
