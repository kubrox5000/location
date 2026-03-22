import React from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Mail, Phone, MessageCircle, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { settingsService } from '../services/api';
import { Settings } from '../types';

export const AdminSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

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
      toast.success(t('admin.settings.success'));
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
      <div className="mb-8">
        <h1 className="serif text-3xl font-light text-foreground">{t('admin.settings.title')}</h1>
        <p className="mt-2 text-sm text-foreground/50">{t('admin.settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
              placeholder="+15551234567"
              className="w-full rounded-xl border border-primary/10 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
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
