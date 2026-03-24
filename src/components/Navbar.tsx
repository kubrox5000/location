import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, ChevronRight, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Settings } from '../types';

export const Navbar = ({ settings }: { settings: Settings | null }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.cars'), path: '/cars' },
    { name: t('nav.about'), path: '/about' },
    { name: t('nav.howToBook'), path: '/how-to-book' },
    { name: t('nav.contact'), path: '/contact' },
  ];

  const isHome = location.pathname === '/';

  return (
    <nav 
      className={`fixed top-0 z-50 w-full transition-all duration-500 glass border-b border-black/5 ${
        scrolled 
          ? 'py-2 shadow-2xl' 
          : 'py-4 shadow-lg'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              ) : (
                <>
                  <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Car size={20} />
                    <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <span className="text-xl font-black tracking-tighter text-foreground">
                    DRIVE<span className="text-primary">SELECT</span>
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative whitespace-nowrap rounded-full px-3 xl:px-5 py-2.5 text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.1em] xl:tracking-[0.2em] transition-all hover:bg-black/5 ${
                    location.pathname === link.path 
                      ? 'text-primary' 
                      : 'text-foreground/60 hover:text-foreground'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                    />
                  )}
                </Link>
              ))}
              <div className="ms-2 flex items-center gap-3 border-s border-black/10 ps-4 xl:ms-6 xl:gap-6 xl:ps-8">
                <LanguageSwitcher />
                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[9px] xl:px-6 xl:text-[10px] font-black uppercase tracking-[0.1em] xl:tracking-[0.2em] text-white transition-all hover:bg-primary/90 active:scale-95 shadow-xl shadow-primary/30"
                >
                  {t('nav.admin')}
                  <Lock size={12} className="rtl:rotate-0" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 lg:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2 transition-all text-foreground hover:bg-black/10 bg-black/5 backdrop-blur-md border border-black/10"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full overflow-hidden border-b border-black/10 glass lg:hidden"
          >
            <div className="space-y-2 px-6 pb-12 pt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-[0.3em] transition-all ${
                    location.pathname === link.path 
                      ? 'bg-primary/20 text-primary border border-primary/20' 
                      : 'text-foreground/60 hover:bg-black/5 border border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-8 pt-8 border-t border-black/10">
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-2xl bg-primary px-6 py-5 text-xs font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-primary/30"
                >
                  {t('nav.admin')}
                  <Lock size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
