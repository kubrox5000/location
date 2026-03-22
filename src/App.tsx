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
import { AdminRegister } from './pages/AdminRegister';
import { AdminLayout } from './components/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCars } from './pages/AdminCars';
import { AdminBookings } from './pages/AdminBookings';
import { AdminAvailableCars } from './pages/AdminAvailableCars';
import { AdminReceiveTomorrow } from './pages/AdminReceiveTomorrow';
import { AdminCities } from './pages/AdminCities';
import { AdminSettings } from './pages/AdminSettings';
import { About } from './pages/About';
import { HowToBook } from './pages/HowToBook';
import { Contact } from './pages/Contact';
import { MessageCircle, Loader2 } from 'lucide-react';
import { settingsService, adminService } from './services/api';
import { auth, db } from './services/firebase';
import { Settings } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [isAuthReady, setIsAuthReady] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  const isAdminPath = location.pathname.startsWith('/admin') && 
    !['/admin/login', '/admin/register'].includes(location.pathname);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });

    // Test Firestore connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'settings', 'global'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    if (isAuthReady) {
      fetchSettings();
    }
  }, [isAuthReady]);

  React.useEffect(() => {
    const dir = i18n.dir(i18n.language);
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${settings?.whatsapp || '1234567890'}?text=Hello, I have a question about car rentals.`, '_blank');
  };

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
      </div>
    );
  }

  if (isAdminPath) {
    if (!user) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/cities" element={<AdminCities />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/available-cars" element={<AdminAvailableCars />} />
          <Route path="/admin/receive-tomorrow" element={<AdminReceiveTomorrow />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </AdminLayout>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<CarListing />} />
          <Route path="/car/:id" element={<CarDetails />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-to-book" element={<HowToBook />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />

      {/* Global WhatsApp Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl transition-all hover:scale-110 hover:bg-emerald-600 active:scale-95"
        title="Chat with us"
      >
        <MessageCircle size={32} />
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">1</span>
      </button>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-right" />
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}
