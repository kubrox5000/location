import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Mail, Key, ArrowRight } from 'lucide-react';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.login({ email, password });
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await adminService.loginWithGoogle();
      toast.success('Login successful!');
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-2xl"
      >
        <div className="bg-primary p-8 text-center text-primary-foreground">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-xl">
            <Lock size={32} />
          </div>
          <h2 className="serif text-2xl font-light tracking-tight">Admin Portal</h2>
          <p className="mt-2 text-sm opacity-60">Secure access for fleet management</p>
        </div>

        <div className="p-8 space-y-6 bg-white">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-primary/10 bg-white py-3 font-bold text-foreground shadow-sm transition-all hover:bg-primary/5 active:scale-95 disabled:opacity-50"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
            Sign in with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-primary/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-foreground/30">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                <input
                  required
                  type="email"
                  placeholder="admin@driveselect.com"
                  className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">Password</label>
              <div className="relative mt-1">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <ArrowRight size={20} />
          </button>

          <p className="text-center text-sm text-foreground/60">
            Need an admin account?{' '}
            <Link to="/admin/register" className="font-bold text-primary hover:underline">
              Register Now
            </Link>
          </p>
        </form>
        </div>
      </motion.div>
    </div>
  );
};
