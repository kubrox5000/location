import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowUpRight, Linkedin } from 'lucide-react';
import { settingsService } from '../services/api';
import { Settings } from '../types';

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = React.useState<Settings | null>(null);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const socialLinks = [
    { Icon: Facebook, url: settings?.facebook || '#', color: 'hover:bg-[#1877F2] hover:border-[#1877F2]', textColor: 'text-[#1877F2]' },
    { Icon: Twitter, url: settings?.twitter || '#', color: 'hover:bg-[#000000] hover:border-[#000000]', textColor: 'text-[#000000]' },
    { Icon: Instagram, url: settings?.instagram || '#', color: 'hover:bg-[#E4405F] hover:border-[#E4405F]', textColor: 'text-[#E4405F]' },
    { Icon: Linkedin, url: settings?.linkedin || '#', color: 'hover:bg-[#0077B5] hover:border-[#0077B5]', textColor: 'text-[#0077B5]' }
  ];

  return (
    <footer className="bg-background pt-20 pb-12 text-foreground border-t border-black/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="rounded-xl bg-primary p-2 text-white transition-all duration-700 group-hover:rotate-[360deg] shadow-2xl shadow-primary/40">
                <Car size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter text-foreground">
                DRIVE<span className="text-primary">SELECT</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-base font-light leading-relaxed text-foreground/40 rtl:text-right">
              {t('footer.tagline')}
            </p>
            <div className="mt-6 flex gap-3 rtl:flex-row-reverse">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.url}
                  target={social.url !== '#' ? "_blank" : undefined}
                  rel={social.url !== '#' ? "noopener noreferrer" : undefined}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-black/5 ${social.textColor} transition-all hover:text-white ${social.color} hover:-translate-y-1 shadow-lg shadow-black/5 backdrop-blur-xl`}
                >
                  <social.Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('footer.company')}</h3>
            <ul className="mt-4 space-y-4">
              {[
                { label: t('footer.links.about'), path: '/about' },
                { label: t('footer.links.howToBook'), path: '/how-to-book' },
                { label: t('footer.links.contact'), path: '/contact' },
                { label: t('footer.links.terms'), path: '/terms' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="group flex items-center gap-2 text-xs font-bold text-foreground/40 transition-all hover:text-foreground hover:translate-x-1 rtl:hover:-translate-x-1 rtl:flex-row-reverse">
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100 rtl:rotate-[-90deg]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('footer.services')}</h3>
            <ul className="mt-4 space-y-4">
              {[
                { label: t('footer.links.fleet'), path: '/cars' },
                { label: t('footer.links.luxury'), path: '/cars' },
                { label: t('footer.links.suv'), path: '/cars' },
                { label: t('footer.links.electric'), path: '/cars' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="group flex items-center gap-2 text-xs font-bold text-foreground/40 transition-all hover:text-foreground hover:translate-x-1 rtl:hover:-translate-x-1 rtl:flex-row-reverse">
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100 rtl:rotate-[-90deg]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">{t('footer.contact')}</h3>
            <ul className="mt-4 space-y-6">
              <li className="flex items-start gap-4 rtl:flex-row-reverse group">
                <div className="mt-1 rounded-full bg-primary p-2 text-white shadow-lg shadow-primary/20 transition-all group-hover:scale-110">
                  <Phone size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">{t('footer.callUs')}</p>
                  <p className="mt-1 text-sm font-bold text-foreground/80 transition-colors group-hover:text-primary" dir="ltr">{settings?.phone || '+1 (555) 123-4567'}</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rtl:flex-row-reverse group">
                <div className="mt-1 rounded-full bg-primary p-2 text-white shadow-lg shadow-primary/20 transition-all group-hover:scale-110">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">{t('footer.email')}</p>
                  <p className="mt-1 text-sm font-bold text-foreground/80 transition-colors group-hover:text-primary">{settings?.email || 'concierge@driveselect.com'}</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rtl:flex-row-reverse group">
                <div className="mt-1 rounded-full bg-primary p-2 text-white shadow-lg shadow-primary/20 transition-all group-hover:scale-110">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20">{t('footer.location')}</p>
                  <p className="mt-1 text-sm font-bold text-foreground/80 leading-relaxed transition-colors group-hover:text-primary">
                    {i18n.language === 'ar' ? settings?.addressAr : settings?.address}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-8 border-t border-black/5 pt-8 md:flex-row rtl:flex-row-reverse">
          <div className="flex flex-col items-center md:items-start gap-4 rtl:md:items-end">
            <p className="text-[8px] font-medium uppercase tracking-widest text-foreground/20">
              &copy; {new Date().getFullYear()} DRIVE SELECT. {t('footer.rights')}
            </p>
            <div className="flex gap-6 text-[8px] font-medium uppercase tracking-widest text-foreground/20">
              <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-primary transition-colors">{t('footer.cookie')}</a>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {[
              { src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg", alt: "Mastercard" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg", alt: "PayPal" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg", alt: "Amex" },
              { src: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg", alt: "Apple Pay" }
            ].map((payment, idx) => (
              <div key={idx} className="flex h-12 items-center justify-center px-4 py-2 rounded-xl border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <img src={payment.src} alt={payment.alt} className="h-8 w-auto object-contain" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
