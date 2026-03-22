import React from 'react';
import { 
  LayoutDashboard, Car, Calendar, 
  Users, LogOut, Plus, Search, 
  TrendingUp, CheckCircle, Clock, XCircle, MapPin, Settings
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { adminService } from '../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: t('admin.nav.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('admin.nav.cars'), path: '/admin/cars', icon: Car },
    { name: t('admin.nav.cities'), path: '/admin/cities', icon: MapPin },
    { name: t('admin.nav.bookings'), path: '/admin/bookings', icon: Calendar },
    { name: 'Available Cars', path: '/admin/available-cars', icon: CheckCircle },
    { name: 'Receive Tomorrow', path: '/admin/receive-tomorrow', icon: Clock },
    { name: t('admin.nav.settings'), path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-primary/5">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-primary/10 bg-white shadow-sm">
        <div className="flex h-20 items-center justify-between border-b border-primary/10 px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5 text-primary-foreground shadow-lg shadow-primary/20">
              <Car size={20} />
            </div>
            <span className="serif text-xl font-light tracking-tight text-foreground">DriveAdmin</span>
          </Link>
          <LanguageSwitcher />
        </div>

        <nav className="mt-8 space-y-1 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                location.pathname === item.path
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-foreground/40 hover:bg-primary/5 hover:text-primary'
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-primary/10 p-4">
          <button
            onClick={async () => {
              await adminService.logout();
              navigate('/admin/login');
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold text-foreground/40 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
};
