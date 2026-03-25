import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageCircle, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
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
    { icon: Phone, label: 'Phone', value: settings?.phone || '+1 (555) 123-4567', color: 'text-white', bg: 'bg-primary' },
    { icon: Mail, label: 'Email', value: settings?.email || 'support@driveselect.com', color: 'text-white', bg: 'bg-primary' },
    { icon: MapPin, label: 'Office', value: i18n.language === 'ar' ? settings?.addressAr : settings?.address || '123 Mobility Ave, San Francisco, CA', color: 'text-white', bg: 'bg-primary' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
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
                <div className={`rounded-2xl ${item.bg} p-4 ${item.color} shadow-lg shadow-primary/20`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{item.label}</p>
                  <p className="text-lg font-bold text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social Media Links */}
          <div className="mt-12">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4">{t('footer.followUs')}</p>
            <div className="flex gap-4 rtl:flex-row-reverse">
              {[
                { icon: Facebook, url: settings?.facebook, color: 'bg-[#1877F2]' },
                { icon: Twitter, url: settings?.twitter, color: 'bg-[#000000]' },
                { icon: Instagram, url: settings?.instagram, color: 'bg-[#E4405F]' },
                { icon: Linkedin, url: settings?.linkedin, color: 'bg-[#0077B5]' }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url || '#'}
                  target={social.url ? "_blank" : undefined}
                  rel={social.url ? "noopener noreferrer" : undefined}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${social.color} text-white shadow-lg transition-all hover:-translate-y-1 hover:scale-110`}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
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
          className="rounded-[32px] sm:rounded-[40px] border border-primary/10 bg-white p-6 sm:p-10 shadow-2xl"
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

      {/* Map Section */}
      <div className="mt-24">
        <div className="text-center mb-12">
          <h2 className="serif text-4xl font-light text-foreground">
            {i18n.language === 'ar' ? 'موقعنا في الخريطة' : 'Visit Our Office'}
          </h2>
        </div>
        <div className="relative h-[450px] w-full overflow-hidden rounded-[32px] sm:rounded-[40px] shadow-2xl border border-primary/10">
          <iframe 
            src={`https://maps.google.com/maps?q=${encodeURIComponent(i18n.language === 'ar' ? (settings?.addressAr || 'دبي') : (settings?.address || 'Dubai'))}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Our Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};
