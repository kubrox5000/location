import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CheckCircle2, Calendar, MapPin, Car, CreditCard, Home, ArrowRight, Building2, Phone, Mail, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const ThankYou = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const bookingData = location.state?.bookingData;
  const carData = location.state?.carData;

  if (!bookingData || !carData) {
    return <Navigate to="/" replace />;
  }

  const isArabic = i18n.language === 'ar';

  const handleWhatsApp = () => {
    const message = `Hello, I'm following up on my booking for ${carData.brand} ${carData.name}.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${settings?.whatsapp || '1234567890'}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="serif text-4xl font-black text-foreground tracking-tighter uppercase sm:text-5xl"
          >
            {t('thankYou.title')}
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-lg font-medium text-foreground/60"
          >
            {t('thankYou.subtitle')}
          </motion.p>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-foreground/40 max-w-md mx-auto"
          >
            {t('thankYou.message')}
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 overflow-hidden rounded-[2.5rem] border border-black/5 glass shadow-2xl shadow-black/5"
        >
          <div className="bg-primary/5 p-8 border-b border-black/5">
            <h2 className="flex items-center gap-3 text-xl font-black uppercase tracking-widest text-foreground">
              <div className="rounded-xl bg-primary p-2 text-white">
                <Car size={20} />
              </div>
              {t('thankYou.bookingDetails')}
            </h2>
          </div>
          
          <div className="p-8 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{t('thankYou.car')}</p>
                <p className="text-lg font-bold text-foreground">{carData.brand} {carData.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{t('thankYou.pickupCity')}</p>
                <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <MapPin size={18} className="text-primary" />
                  {bookingData.city}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{t('thankYou.dates')}</p>
                <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <Calendar size={18} className="text-primary" />
                  <span className="text-sm sm:text-base">
                    {bookingData.pickupDate} <ArrowRight size={14} className="inline mx-1 opacity-30" /> {bookingData.returnDate}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{t('thankYou.totalPrice')}</p>
                <div className="flex items-center gap-2 text-2xl font-black text-primary">
                  <CreditCard size={20} />
                  {(() => {
                    const currency = carData.currency || settings?.currency || 'USD';
                    const symbol = currency === 'MAD' ? 'DH' : 
                                  currency === 'AED' ? 'AED' : 
                                  currency === 'SAR' ? 'SR' : 
                                  currency === 'EUR' ? '€' : '$';
                    return currency === 'MAD' || currency === 'AED' || currency === 'SAR' 
                      ? `${bookingData.totalPrice} ${symbol}` 
                      : `${symbol}${bookingData.totalPrice}`;
                  })()}
                </div>
              </div>
            </div>

            {/* Company Info Section */}
            <div className="pt-8 border-t border-black/5">
              <h3 className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/40 mb-6">
                <Building2 size={16} />
                {t('thankYou.companyInfo')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{t('thankYou.address')}</p>
                  <p className="text-sm font-bold text-foreground/60 leading-relaxed">
                    {isArabic ? settings?.addressAr : settings?.address}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{t('thankYou.phone')}</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/60">
                      <Phone size={14} className="text-primary" />
                      <span dir="ltr">{settings?.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">{t('thankYou.email')}</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/60">
                      <Mail size={14} className="text-primary" />
                      {settings?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-black/5 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-black/5 px-8 py-5 text-xs font-black uppercase tracking-[0.3em] text-foreground transition-all hover:bg-black/10 active:scale-95"
              >
                <Home size={18} />
                {t('thankYou.backToHome')}
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-primary px-8 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
              >
                <MessageCircle size={18} />
                {t('thankYou.whatsapp')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
