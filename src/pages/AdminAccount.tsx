import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { User, Mail, Key, Shield, Loader2, Save, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../services/api';

export const AdminAccount = () => {
  const { t } = useTranslation();
  const [user, setUser] = React.useState(adminService.getCurrentUser());
  const [loading, setLoading] = React.useState(false);
  const [reauthModal, setReauthModal] = React.useState(false);
  const [reauthPassword, setReauthPassword] = React.useState('');
  const [pendingAction, setPendingAction] = React.useState<'email' | 'password' | null>(null);
  
  const [email, setEmail] = React.useState(user?.email || '');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === user?.email) return;
    
    setLoading(true);
    try {
      await adminService.updateEmail(email);
      toast.success(t('admin.account.emailSuccess'));
      setUser(adminService.getCurrentUser());
    } catch (error: any) {
      if (error.message === 'REAUTHENTICATION_REQUIRED') {
        setPendingAction('email');
        setReauthModal(true);
      } else {
        toast.error(error.message || t('admin.account.emailError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t('admin.account.passwordMismatch'));
      return;
    }
    
    setLoading(true);
    try {
      await adminService.updatePassword(newPassword);
      toast.success(t('admin.account.passwordSuccess'));
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.message === 'REAUTHENTICATION_REQUIRED') {
        setPendingAction('password');
        setReauthModal(true);
      } else {
        toast.error(error.message || t('admin.account.passwordError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReauthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.reauthenticate(reauthPassword);
      setReauthModal(false);
      setReauthPassword('');
      toast.success(t('admin.account.reauthSuccess'));
      
      // Retry the pending action
      if (pendingAction === 'email') {
        await adminService.updateEmail(email);
        toast.success(t('admin.account.emailSuccess'));
      } else if (pendingAction === 'password') {
        await adminService.updatePassword(newPassword);
        toast.success(t('admin.account.passwordSuccess'));
        setNewPassword('');
        setConfirmPassword('');
      }
      setPendingAction(null);
    } catch (error: any) {
      toast.error(t('admin.account.reauthError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="serif text-3xl font-light text-foreground">{t('admin.account.title')}</h1>
          <p className="mt-2 text-sm text-foreground/50">{t('admin.account.subtitle')}</p>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Email Section */}
        <div className="rounded-[2.5rem] border border-primary/10 bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Mail size={24} />
            </div>
            <h2 className="serif text-xl font-light">{t('admin.account.emailSection')}</h2>
          </div>
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                {t('admin.account.currentEmail')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || email === user?.email}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && pendingAction === 'email' ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {t('admin.account.updateEmail')}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="rounded-[2.5rem] border border-primary/10 bg-white p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Key size={24} />
            </div>
            <h2 className="serif text-xl font-light">{t('admin.account.passwordSection')}</h2>
          </div>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                {t('admin.account.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                {t('admin.account.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newPassword}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {loading && pendingAction === 'password' ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {t('admin.account.updatePassword')}
            </button>
          </form>
        </div>
      </div>

      {/* Reauthentication Modal */}
      {reauthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setReauthModal(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
              <Shield size={32} />
            </div>
            <h2 className="serif text-center text-2xl font-light text-foreground mb-2">
              {t('admin.account.reauthTitle')}
            </h2>
            <p className="text-center text-sm text-foreground/50 mb-8 leading-relaxed">
              {t('admin.account.reauthDesc')}
            </p>
            <form onSubmit={handleReauthenticate} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">
                  {t('admin.account.currentPassword')}
                </label>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReauthModal(false)}
                  className="flex-1 rounded-xl border border-primary/10 py-3 text-sm font-bold text-foreground/60 transition-all hover:bg-primary/5"
                >
                  {t('admin.account.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t('admin.account.confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
