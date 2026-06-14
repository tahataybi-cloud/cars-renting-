import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, ShieldCheck, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import { GlassCard } from '../ui/GlassCard';
import { MotionPage } from '../ui/MotionPage';
import { cn } from '../utils';

type Booking = {
  id: string;
  status: string;
  pickupAt: string;
  returnAt: string;
  totalAmount: number;
  customerName: string;
  vehicleLabel: string;
};

export function Bookings() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await api.get<Booking[]>('/bookings')).data
  });

  return (
    <MotionPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Reservation Matrix</h1>
          <p className="text-slate-500 font-medium tracking-wide">Autonomous scheduling and conflict resolution engine</p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1fr_400px]">
          {/* Calendar View */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-electric/10 text-electric"><Calendar className="w-5 h-5" /></div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tighter">Mission Timeline</h2>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-500">
                <span className="w-2 h-2 rounded-full bg-electric" /> ACTIVE
                <span className="w-2 h-2 rounded-full bg-white/10 ml-2" /> IDLE
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                  <div key={day} className="bg-black/20 p-4 text-[10px] font-black text-slate-500 text-center tracking-widest">{day}</div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const day = i - 3; // Offset for demo
                  return (
                    <div key={i} className="min-h-[120px] bg-graphite/40 hover:bg-white/5 transition-colors p-4 group border-t border-l border-white/5 first:border-l-0">
                      {day > 0 && day <= 31 && (
                        <>
                          <span className={cn("text-xs font-black", day === 15 ? "text-electric" : "text-slate-600")}>{day}</span>
                          {day === 15 && (
                            <motion.div 
                              initial={{ scale: 0 }} 
                              animate={{ scale: 1 }}
                              className="mt-2 p-2 rounded-lg bg-electric/20 border border-electric/30 text-[8px] font-black text-white uppercase leading-tight"
                            >
                              Launch: Porsche 911
                            </motion.div>
                          )}
                          {day === 18 && (
                            <div className="mt-2 p-2 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase leading-tight">
                              Return: Tesla Model S
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            <GlassCard className="border-electric/30 bg-electric/5">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-electric/20 text-electric"><ShieldCheck className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">PostgreSQL Guard</h3>
                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-2 uppercase tracking-tighter">
                    Exclusion-style range indexing active. Overlapping reservations are blocked at the infrastructure layer.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-0 overflow-hidden">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Incoming Stream</h3>
              </div>
              <div className="p-6 space-y-6">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)
                ) : data.length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <AlertCircle className="w-10 h-10 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Logs</p>
                  </div>
                ) : (
                  data.map((booking, i) => (
                    <motion.div 
                      key={booking.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative pl-6 border-l border-white/10 group cursor-pointer"
                    >
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-electric border-4 border-obsidian group-hover:scale-150 transition-transform" />
                      <div className="space-y-1">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-electric uppercase tracking-widest">{booking.status}</span>
                            <span className="text-xs font-black text-white tracking-tighter">{money(booking.totalAmount)}</span>
                         </div>
                         <p className="text-sm font-black text-slate-200">{booking.customerName || 'Anonymous Client'}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase">{booking.vehicleLabel || 'Fleet Unit'}</p>
                         <div className="flex items-center gap-3 text-[9px] font-black text-slate-600 mt-2">
                            <Clock className="w-3 h-3" />
                            <span>{dateTime(booking.pickupAt)}</span>
                         </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              <div className="p-4 bg-white/5 text-center">
                <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors">Load Archive</button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </MotionPage>
  );
}

function money(v: number) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v);
}

function dateTime(v: string) {
  return new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v));
}
