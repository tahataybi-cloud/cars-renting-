import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ShieldAlert, Calendar, CheckSquare, Clock, ArrowRight, Activity, Terminal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { MotionPage } from '../ui/MotionPage';
import { CyberButton } from '../ui/CyberButton';
import { cn } from '../utils';

const alerts = [
  {
    id: 'm1',
    title: 'Oil change due for Dacia Logan',
    detail: 'Lubrication systems reaching critical efficiency threshold. Schedule immediate synthetic oil replacement and filter synchronization.',
    severity: 'WARNING',
    unit: 'DL-2023-MOB',
    deadline: '72h Remaining'
  },
  {
    id: 'm2',
    title: 'Insurance expires in 15 days',
    detail: 'Administrative compliance cycle terminating. Protocol requires digital renewal and ledger update to maintain operational legality.',
    severity: 'CRITICAL',
    unit: 'GLOBAL_FLEET',
    deadline: '15 Days'
  },
  {
    id: 'm3',
    title: 'Technical inspection due next week',
    detail: 'Structural and safety audit required by regulatory framework. Book localized inspection slot and attach hardware certification.',
    severity: 'INFO',
    unit: 'RN-MEG-46',
    deadline: 'Scheduled'
  }
];

export function Maintenance() {
  const [selectedId, setSelectedId] = useState(alerts[0].id);
  const [reviewed, setReviewed] = useState<string[]>([]);

  const selected = alerts.find(a => a.id === selectedId) || alerts[0];

  function review(id: string) {
    setReviewed(prev => prev.includes(id) ? prev : [...prev, id]);
  }

  return (
    <MotionPage>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Diagnostic Terminal</h1>
          <p className="text-slate-500 font-medium tracking-wide">Infrastructure health monitoring and compliance auditing</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Active Alerts List */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-4">
               <Activity className="w-5 h-5 text-electric animate-pulse" />
               <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Live Diagnostic Stream</h2>
            </div>

            <div className="space-y-4">
              {alerts.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 10 }}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "relative group cursor-pointer transition-all duration-500",
                    selectedId === item.id ? "scale-[1.02]" : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                  )}
                >
                  <GlassCard className={cn(
                    "p-6 flex items-center justify-between gap-6 overflow-hidden",
                    selectedId === item.id ? "border-electric shadow-[0_0_30px_rgba(0,122,255,0.1)]" : "border-white/5"
                  )}>
                    {selectedId === item.id && (
                      <motion.div 
                        layoutId="active-indicator" 
                        className="absolute left-0 top-0 bottom-0 w-1 bg-electric shadow-[4px_0_15px_rgba(0,122,255,0.5)]" 
                      />
                    )}
                    
                    <div className="flex items-center gap-6">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors",
                         item.severity === 'CRITICAL' ? "border-rose-500/20 text-rose-500 bg-rose-500/5" :
                         item.severity === 'WARNING' ? "border-saffron/20 text-saffron bg-saffron/5" :
                         "border-cyber/20 text-cyber bg-cyber/5"
                       )}>
                         {item.severity === 'CRITICAL' ? <ShieldAlert className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
                       </div>
                       
                       <div>
                         <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{item.unit}</p>
                         <h3 className="text-lg font-black text-white tracking-tighter leading-tight">{item.title}</h3>
                         <div className="flex items-center gap-3 mt-2">
                            <Clock className="w-3.5 h-3.5 text-slate-600" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{item.deadline}</span>
                         </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <AnimatePresence>
                         {reviewed.includes(item.id) && (
                           <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                             <CheckSquare className="w-5 h-5 text-cyber" />
                           </motion.div>
                         )}
                       </AnimatePresence>
                       <ArrowRight className={cn("w-5 h-5 transition-transform group-hover:translate-x-2", selectedId === item.id ? "text-electric" : "text-slate-800")} />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Detailed Diagnosis */}
          <div className="sticky top-8 self-start">
             <GlassCard className="p-0 border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-3xl bg-graphite/40">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Terminal className="w-32 h-32" />
                </div>
                
                <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                  <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Unit Analysis</h2>
                  <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">{selected.title}</h3>
                  <div className="mt-6 flex flex-wrap gap-2">
                     <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">{selected.unit}</span>
                     <span className={cn(
                       "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                       selected.severity === 'CRITICAL' ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : "text-electric border-electric/20 bg-electric/5"
                     )}>{selected.severity}</span>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                   <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-electric" />
                       Action Protocol
                     </h4>
                     <p className="text-sm font-medium text-slate-400 leading-relaxed uppercase tracking-tighter">
                       {selected.detail}
                     </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Time to Failure</p>
                        <p className="text-sm font-black text-white italic underline underline-offset-4 decoration-electric/50">{selected.deadline}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Compliance State</p>
                        <p className={cn("text-sm font-black italic", reviewed.includes(selected.id) ? "text-cyber" : "text-rose-500")}>
                          {reviewed.includes(selected.id) ? 'AUDITED' : 'PENDING'}
                        </p>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-white/5 space-y-4">
                      <CyberButton 
                        glow={!reviewed.includes(selected.id)} 
                        onClick={() => review(selected.id)}
                        disabled={reviewed.includes(selected.id)}
                        className="w-full py-4 text-xs font-black tracking-[0.2em]"
                      >
                        {reviewed.includes(selected.id) ? 'LOGS ARCHIVED' : 'CONFIRM AUDIT'}
                      </CyberButton>
                      <button className="w-full text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors py-2">
                        Forward to Technician
                      </button>
                   </div>
                </div>

                <div className="px-8 pb-8">
                   <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[10px] text-electric opacity-50">
                      &gt; SYSTEM_READY<br />
                      &gt; SCANNING_UNIT_{selected.unit}...<br />
                      &gt; NO_CRITICAL_HARDWARE_FAILURE_DETECTED<br />
                      &gt; WAITING_FOR_OPERATOR_SIGNATURE_
                   </div>
                </div>
             </GlassCard>
          </div>
        </div>
      </div>
    </MotionPage>
  );
}
