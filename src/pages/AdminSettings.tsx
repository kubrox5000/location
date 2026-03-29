import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Save, Mail, Phone, MessageCircle, MapPin, Image as ImageIcon, Coins, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { settingsService } from '../services/api';
import { Settings } from '../types';

import { SettingsProvider, useSettings } from '../context/SettingsContext';

export const AdminSettings = () => {
  const { t, i18n } = useTranslation();
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
  ];

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsService.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error(t('admin.settings.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await settingsService.update(settings);
      await refreshSettings();
      toast.success(t('admin.settings.success'));
      
      // Update favicon dynamically if changed
      if (settings.favicon) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = settings.favicon;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = settings.favicon;
          document.head.appendChild(newLink);
        }
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error(t('admin.settings.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-light text-foreground">{t('admin.settings.title')}</h1>
          <p className="mt-2 text-sm text-foreground/50">{t('admin.settings.subtitle')}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Logo URL */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon size={16} className="text-primary" />
                {t('admin.settings.logo')}
              </label>
              <input
                type="url"
                value={settings?.logo || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, logo: e.target.value } : null)}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            {settings?.logo && (
              <div className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center justify-center">
                <img src={settings.logo} alt="Logo Preview" className="max-h-12 object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          {/* Favicon URL */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon size={16} className="text-primary" />
                {t('admin.settings.favicon')}
              </label>
              <input
                type="url"
                value={settings?.favicon || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, favicon: e.target.value } : null)}
                placeholder="https://example.com/favicon.ico"
                className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            {settings?.favicon && (
              <div className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center justify-center">
                <img src={settings.favicon} alt="Favicon Preview" className="h-8 w-8 object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          {/* Hero Image URL */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon size={16} className="text-primary" />
                {t('admin.settings.heroImage')}
              </label>
              <input
                type="url"
                value={settings?.heroImage || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, heroImage: e.target.value } : null)}
                placeholder="https://example.com/hero.jpg"
                className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            {settings?.heroImage && (
              <div className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center justify-center overflow-hidden">
                <img src={settings.heroImage} alt="Hero Preview" className="max-h-32 w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          {/* Hero Image Mobile URL */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon size={16} className="text-primary" />
                {t('admin.settings.heroImageMobile')}
              </label>
              <input
                type="url"
                value={settings?.heroImageMobile || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, heroImageMobile: e.target.value } : null)}
                placeholder="https://example.com/hero-mobile.jpg"
                className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            {settings?.heroImageMobile && (
              <div className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center justify-center overflow-hidden">
                <img src={settings.heroImageMobile} alt="Hero Mobile Preview" className="max-h-32 w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          {/* CTA Image URL */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon size={16} className="text-primary" />
                {t('admin.settings.ctaImage')}
              </label>
              <input
                type="url"
                value={settings?.ctaImage || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, ctaImage: e.target.value } : null)}
                placeholder="https://example.com/cta-bg.jpg"
                className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            {settings?.ctaImage && (
              <div className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center justify-center overflow-hidden">
                <img src={settings.ctaImage} alt="CTA Preview" className="max-h-32 w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          {/* Experience Image URL */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ImageIcon size={16} className="text-primary" />
                {t('admin.settings.experienceImage')}
              </label>
              <input
                type="url"
                value={settings?.experienceImage || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, experienceImage: e.target.value } : null)}
                placeholder="https://example.com/experience.jpg"
                className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            {settings?.experienceImage && (
              <div className="rounded-2xl border border-primary/10 bg-white p-4 flex items-center justify-center overflow-hidden">
                <img src={settings.experienceImage} alt="Experience Preview" className="max-h-32 w-full object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Mail size={16} className="text-primary" />
              {t('admin.settings.email')}
            </label>
            <input
              type="email"
              value={settings?.email || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, email: e.target.value } : null)}
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Phone size={16} className="text-primary" />
              {t('admin.settings.phone')}
            </label>
            <input
              type="text"
              value={settings?.phone || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, phone: e.target.value } : null)}
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageCircle size={16} className="text-primary" />
              {t('admin.settings.whatsapp')}
            </label>
            <input
              type="text"
              value={settings?.whatsapp || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, whatsapp: e.target.value } : null)}
              placeholder="+212674740010"
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Coins size={16} className="text-primary" />
              {t('admin.settings.currency')}
            </label>
            <select
              value={settings?.currency || 'USD'}
              onChange={(e) => setSettings(prev => prev ? { ...prev, currency: e.target.value } : null)}
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol}) - {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Facebook */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Facebook size={16} className="text-primary" />
              {t('admin.settings.facebook')}
            </label>
            <input
              type="url"
              value={settings?.facebook || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, facebook: e.target.value } : null)}
              placeholder="https://facebook.com/yourpage"
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Twitter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Twitter size={16} className="text-primary" />
              {t('admin.settings.twitter')}
            </label>
            <input
              type="url"
              value={settings?.twitter || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, twitter: e.target.value } : null)}
              placeholder="https://twitter.com/yourhandle"
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Instagram size={16} className="text-primary" />
              {t('admin.settings.instagram')}
            </label>
            <input
              type="url"
              value={settings?.instagram || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, instagram: e.target.value } : null)}
              placeholder="https://instagram.com/yourprofile"
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Linkedin size={16} className="text-primary" />
              {t('admin.settings.linkedin')}
            </label>
            <input
              type="url"
              value={settings?.linkedin || ''}
              onChange={(e) => setSettings(prev => prev ? { ...prev, linkedin: e.target.value } : null)}
              placeholder="https://linkedin.com/company/yourcompany"
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Address English */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin size={16} className="text-primary" />
            {t('admin.settings.address')}
          </label>
          <textarea
            value={settings?.address || ''}
            onChange={(e) => setSettings(prev => prev ? { ...prev, address: e.target.value } : null)}
            rows={3}
            className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>

        {/* Address Arabic */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin size={16} className="text-primary" />
            {t('admin.settings.addressAr')}
          </label>
          <textarea
            value={settings?.addressAr || ''}
            onChange={(e) => setSettings(prev => prev ? { ...prev, addressAr: e.target.value } : null)}
            dir="rtl"
            rows={3}
            className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? '...' : t('admin.settings.save')}
          </button>
        </div>
      </form>
    </div>
  );
};
