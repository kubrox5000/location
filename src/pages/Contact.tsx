import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { settingsService } from '../services/api';
import { Settings } from '../types';

export const Contact = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you shortly.');
  };

  const contactItems = [
    { icon: Phone, label: 'Phone', value: settings?.phone || '+1 (555) 123-4567', color: 'text-primary', bg: 'bg-primary/5' },
    { icon: Mail, label: 'Email', value: settings?.email || 'support@driveselect.com', color: 'text-primary', bg: 'bg-primary/5' },
    { icon: MapPin, label: 'Office', value: i18n.language === 'ar' ? settings?.addressAr : settings?.address || '123 Mobility Ave, San Francisco, CA', color: 'text-primary', bg: 'bg-primary/5' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        <div className="rtl:text-right">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">{t('nav.contact')}</span>
          <h1 className="serif mt-4 text-5xl font-light tracking-tight text-foreground">Get in Touch.</h1>
          <p className="mt-6 text-lg text-foreground/60 font-light leading-relaxed">
            Have a question about our fleet, pricing, or booking process? 
            Our team is here to help you 24/7. Reach out via the form or our direct channels.
          </p>

          <div className="mt-12 space-y-8">
            {contactItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-6 rtl:flex-row-reverse">
                <div className={`rounded-2xl ${item.bg} p-4 ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{item.label}</p>
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl bg-primary/5 p-8 border border-primary/10">
            <div className="flex items-center gap-4 rtl:flex-row-reverse">
              <div className="rounded-2xl bg-primary p-3 text-primary-foreground">
                <MessageCircle size={24} />
              </div>
              <div>
                <p className="font-bold text-foreground">Prefer WhatsApp?</p>
                <p className="text-sm text-foreground/60">Chat with us instantly for quick support.</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${settings?.whatsapp || '1234567890'}`, '_blank')}
              className="mt-6 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground transition-all hover:bg-primary/90"
            >
              Start Chat
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[40px] border border-primary/10 bg-white p-10 shadow-2xl"
        >
          <h2 className="serif text-2xl font-light text-foreground">Send a Message</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">First Name</label>
                <input required type="text" className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="John" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Last Name</label>
                <input required type="text" className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Email Address</label>
              <input required type="email" className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Message</label>
              <textarea required rows={4} className="w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="How can we help you?" />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
            >
              Send Message
              <Send size={20} />
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
