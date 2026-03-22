import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, User, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar = () => {
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
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        scrolled 
          ? 'border-b border-primary/10 bg-white/80 py-3 backdrop-blur-xl shadow-sm' 
          : isHome ? 'bg-transparent py-6' : 'border-b border-primary/10 bg-white py-6'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className={`rounded-xl p-2 transition-all duration-500 ${scrolled || !isHome ? 'bg-primary text-primary-foreground' : 'bg-white text-primary'}`}>
                <Car size={22} />
              </div>
              <span className={`serif text-xl font-light tracking-tight transition-colors duration-500 ${scrolled || !isHome ? 'text-foreground' : 'text-white'}`}>
                Drive<span className="text-primary">Select</span>
              </span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-primary ${
                    location.pathname === link.path 
                      ? 'text-primary' 
                      : scrolled || !isHome ? 'text-foreground/70' : 'text-white/70'
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 h-0.5 w-full bg-primary"
                    />
                  )}
                </Link>
              ))}
              <div className="flex items-center gap-4 border-l border-primary/10 pl-8">
                <LanguageSwitcher />
                <Link
                  to="/admin/login"
                  className={`flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${
                    scrolled || !isHome 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-white text-primary hover:bg-primary/5'
                  }`}
                >
                  {t('nav.admin')}
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center justify-center rounded-xl p-2 transition-colors ${
                scrolled || !isHome ? 'text-foreground hover:bg-primary/5' : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full border-b border-primary/10 bg-white shadow-2xl md:hidden"
          >
            <div className="space-y-1 px-4 pb-8 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-xl px-4 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                    location.pathname === link.path ? 'bg-primary/5 text-primary' : 'text-foreground/60 hover:bg-primary/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 border-t border-primary/10 pt-4">
                <Link
                  to="/admin/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-primary px-4 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground"
                >
                  {t('nav.admin')}
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
