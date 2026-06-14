import { motion } from 'framer-motion';
import { Users, ShieldCheck, History, Trophy, Search, UserPlus, Filter } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { MotionPage } from '../ui/MotionPage';
import { CyberButton } from '../ui/CyberButton';
import { cn } from '../utils';

export function Customers() {
  const cards = [
    { 
      title: 'Identity Verification', 
      icon: ShieldCheck, 
      color: 'text-cyber', 
      desc: 'Real-time CIN, Passport, and Driver License OCR processing with biometric cross-check.' 
    },
    { 
      title: 'Rental Lifecycle', 
      icon: History, 
      color: 'text-electric', 
      desc: 'Complete behavioral mapping including driving patterns, fuel compliance, and maintenance impact.' 
    },
    { 
      title: 'Privilege Tiering', 
      icon: Trophy, 
      color: 'text-saffron', 
      desc: 'Dynamic loyalty algorithms and risk-based credit limits for high-value asset access.' 
    }
  ];

  return (
    <MotionPage>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Client Biosphere</h1>
            <p className="text-slate-500 font-medium tracking-wide">Customer intelligence and identity synchronization</p>
          </div>
          <div className="flex items-center gap-3">
             <CyberButton size="md" glow className="flex items-center gap-2">
               <UserPlus className="w-4 h-4" />
               <span>Enlist Client</span>
             </CyberButton>
          </div>
        </div>

        {/* Search & Filter */}
        <GlassCard className="p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_200px_200px_auto]">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                 className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-electric transition-all"
                 placeholder="Search by CIN, Name or ID..."
               />
             </div>
             <select className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-400">
               <option>All Tiers</option>
               <option>Elite</option>
               <option>Premium</option>
               <option>Verified</option>
             </select>
             <select className="bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-400">
               <option>Registration Date</option>
               <option>High Spenders</option>
               <option>Active Rentals</option>
             </select>
             <button className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
               <Filter className="w-5 h-5 text-slate-500" />
             </button>
          </div>
        </GlassCard>

        {/* Quick Stats Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <GlassCard key={card.title} className="p-8 group hover:border-white/20 transition-all">
              <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5", card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-3">{card.title}</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed tracking-wider uppercase">{card.desc}</p>
              <div className="mt-8 pt-6 border-t border-white/5">
                 <button className="flex items-center gap-2 text-[10px] font-black text-electric uppercase tracking-[0.2em] group-hover:gap-3 transition-all">
                   Browse Directory <Users className="w-3 h-3" />
                 </button>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Directory (Placeholder table) */}
        <GlassCard className="p-0 overflow-hidden">
           <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Verified Directory</h2>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Databases Synchronized</span>
           </div>
           <div className="p-20 text-center space-y-4">
              <Users className="w-16 h-16 text-white/5 mx-auto" />
              <p className="text-slate-500 font-black uppercase text-xs tracking-widest italic">Scanning Client Repository...</p>
           </div>
        </GlassCard>
      </div>
    </MotionPage>
  );
}
