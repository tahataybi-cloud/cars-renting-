import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api';
import { CyberButton } from '../ui/CyberButton';
import { GlassCard } from '../ui/GlassCard';

export function Login() {
  const [email, setEmail] = useState('owner@smartrent.ma');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post<{ accessToken: string }>('/auth/login', { email, password });
      localStorage.setItem('smartrent_token', response.data.accessToken);
      window.location.href = '/dashboard';
    } catch {
      setError('Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-obsidian flex items-center justify-center p-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="C:\Users\MSI\.gemini\antigravity\brain\e4e511b2-beb1-4782-a330-028d56b6e958\premium_car_interior_dark_1780220304579.png" 
          alt="Premium Interior" 
          className="w-full h-full object-cover scale-110 blur-sm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent" />
        <div className="absolute inset-0 bg-electric/5 backdrop-brightness-75" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-8 md:p-12 border-white/10 shadow-2xl">
          <div className="text-center mb-10">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-electric text-white font-black text-2xl shadow-[0_0_30px_rgba(0,122,255,0.4)] mb-6"
            >
              SR
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Operations Portal</h1>
            <p className="text-slate-500 mt-2 text-sm font-medium">Access your enterprise management suite</p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Command</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-electric focus:ring-1 focus:ring-electric/50 transition-all placeholder:text-slate-700"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="fleet.adm@smartrent.ma"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Secure Access Key</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-electric focus:ring-1 focus:ring-electric/50 transition-all placeholder:text-slate-700"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs font-bold text-rose-400 text-center"
              >
                {error}
              </motion.div>
            ) : null}

            <CyberButton 
              type="submit" 
              className="w-full py-5 text-base uppercase tracking-widest font-black" 
              disabled={loading}
              glow
            >
              {loading ? 'Authenticating...' : 'Initialize Session'}
            </CyberButton>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">
              Automated Data Recovery · 256-Bit Encrypted
            </p>
          </div>
        </GlassCard>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
          className="text-center mt-6 text-xs text-slate-500 uppercase tracking-tighter"
        >
          Demo: owner@smartrent.ma / password123
        </motion.p>
      </motion.div>
    </main>
  );
}
