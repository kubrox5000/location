import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
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

  return (
    <footer className="bg-white pt-24 pb-12 text-foreground border-t border-primary/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="rounded-xl bg-primary p-2 text-primary-foreground transition-transform group-hover:rotate-12">
                <Car size={22} />
              </div>
              <span className="serif text-xl font-light tracking-tight text-foreground">
                Drive<span className="text-primary">Select</span>
              </span>
            </Link>
            <p className="mt-8 text-sm font-light leading-relaxed text-foreground/50 rtl:text-right">
              {t('footer.tagline')}
            </p>
            <div className="mt-8 flex space-x-6 rtl:space-x-reverse">
              {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                <a key={idx} href="#" className="text-foreground/40 transition-colors hover:text-primary">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{t('footer.company')}</h3>
            <ul className="mt-8 space-y-4">
              {[
                { label: t('footer.links.about'), path: '/about' },
                { label: t('footer.links.howToBook'), path: '/how-to-book' },
                { label: t('footer.links.contact'), path: '/contact' },
                { label: t('footer.links.terms'), path: '/terms' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className="group flex items-center gap-2 text-sm font-light text-foreground/60 transition-colors hover:text-primary rtl:flex-row-reverse">
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 rtl:rotate-[-90deg]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{t('footer.services')}</h3>
            <ul className="mt-8 space-y-4">
              {[
                { label: t('footer.links.fleet'), path: '/cars' },
                { label: t('footer.links.luxury'), path: '/cars' },
                { label: t('footer.links.suv'), path: '/cars' },
                { label: t('footer.links.electric'), path: '/cars' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="group flex items-center gap-2 text-sm font-light text-foreground/60 transition-colors hover:text-primary rtl:flex-row-reverse">
                    {item.label}
                    <ArrowUpRight size={12} className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 rtl:rotate-[-90deg]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rtl:text-right">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{t('footer.contact')}</h3>
            <ul className="mt-8 space-y-6">
              <li className="flex items-start gap-4 rtl:flex-row-reverse">
                <div className="mt-1 rounded-full bg-primary/5 p-2 text-primary">
                  <Phone size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('footer.callUs')}</p>
                  <p className="mt-1 text-sm font-light text-foreground/80" dir="ltr">{settings?.phone || '+1 (555) 123-4567'}</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rtl:flex-row-reverse">
                <div className="mt-1 rounded-full bg-primary/5 p-2 text-primary">
                  <Mail size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('footer.email')}</p>
                  <p className="mt-1 text-sm font-light text-foreground/80">{settings?.email || 'concierge@driveselect.com'}</p>
                </div>
              </li>
              <li className="flex items-start gap-4 rtl:flex-row-reverse">
                <div className="mt-1 rounded-full bg-primary/5 p-2 text-primary">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('footer.location')}</p>
                  <p className="mt-1 text-sm font-light text-foreground/80 leading-relaxed">
                    {i18n.language === 'ar' ? settings?.addressAr : settings?.address}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-24 flex flex-col items-center justify-between gap-8 border-t border-primary/10 pt-12 md:flex-row rtl:flex-row-reverse">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20">
            &copy; {new Date().getFullYear()} DRIVE SELECT. {t('footer.rights')}
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/20">
            <a href="#" className="hover:text-primary transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('footer.cookie')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
