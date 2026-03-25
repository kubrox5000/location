import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings } from '../types';
import { settingsService } from '../services/api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.get();
      setSettings(data);
      
      // Update favicon dynamically
      if (data.favicon) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = data.favicon;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = data.favicon;
          document.head.appendChild(newLink);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
