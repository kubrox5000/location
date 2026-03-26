import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer } from 'firebase/firestore';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { CarListing } from './pages/CarListing';
import { CarDetails } from './pages/CarDetails';
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCars } from './pages/AdminCars';
import { AdminBookings } from './pages/AdminBookings';
import { AdminAvailableCars } from './pages/AdminAvailableCars';
import { AdminReceiveTomorrow } from './pages/AdminReceiveTomorrow';
import { AdminCities } from './pages/AdminCities';
import { AdminSettings } from './pages/AdminSettings';
import { AdminStaff } from './pages/AdminStaff';
import { AdminAccount } from './pages/AdminAccount';
import { ProtectedRoute } from './components/ProtectedRoute';
import { About } from './pages/About';
import { HowToBook } from './pages/HowToBook';
import { Contact } from './pages/Contact';
import { ThankYou } from './pages/ThankYou';
import { MessageCircle, Loader2 } from 'lucide-react';
import { settingsService, adminService } from './services/api';
import { auth, db } from './services/firebase';
import { Settings } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const { settings, loading: settingsLoading } = useSettings();
  const { user, loading: authLoading } = useAuth();

  const isAdminPath = location.pathname.startsWith('/admin') && 
    !['/admin/login', '/admin/register'].includes(location.pathname);

  React.useEffect(() => {
    const dir = i18n.dir(i18n.language);
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${settings?.whatsapp || '1234567890'}?text=Hello, I have a question about car rentals.`, '_blank');
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  if (isAdminPath) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/cars" element={<ProtectedRoute permission="manage_fleet"><AdminCars /></ProtectedRoute>} />
          <Route path="/admin/cities" element={<ProtectedRoute permission="manage_cities"><AdminCities /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute permission="manage_bookings"><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/available-cars" element={<ProtectedRoute permission="manage_fleet"><AdminAvailableCars /></ProtectedRoute>} />
          <Route path="/admin/receive-tomorrow" element={<ProtectedRoute permission="manage_bookings"><AdminReceiveTomorrow /></ProtectedRoute>} />
          <Route path="/admin/staff" element={<ProtectedRoute permission="manage_staff"><AdminStaff /></ProtectedRoute>} />
          <Route path="/admin/account" element={<ProtectedRoute><AdminAccount /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute permission="manage_settings"><AdminSettings /></ProtectedRoute>} />
        </Routes>
      </AdminLayout>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar settings={settings} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-to-book" element={<HowToBook />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thank-you" element={<ThankYou />} />
        </Routes>
      </main>
      <Footer />

      {/* Global WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition-all hover:scale-110 hover:bg-emerald-600 active:scale-95"
        title="Chat with us"
      >
        <MessageCircle size={24} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold">1</span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <Toaster position="top-right" />
            <AppContent />
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
