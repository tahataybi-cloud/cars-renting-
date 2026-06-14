import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Sparkles, 
  BrainCircuit, 
  Target,
  ArrowUpRight,
  Gauge,
  TrendingUp,
  ShieldAlert,
  Users,
  Globe,
  Zap,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { MotionPage } from '../ui/MotionPage';
import { CyberButton } from '../ui/CyberButton';
import { cn } from '../utils';

const projectionData = [
  { name: 'JUN', real: 4000, projected: 4000 },
  { name: 'JUL', real: 4500, projected: 4600 },
  { name: 'AUG', real: 5100, projected: 5200 },
  { name: 'SEP', real: 4800, projected: 5500 },
  { name: 'OCT', real: null, projected: 6100 },
  { name: 'NOV', real: null, projected: 6800 },
  { name: 'DEC', real: null, projected: 7500 },
];

const radarData = [
  { subject: 'Maintenance', A: 120, fullMark: 150 },
  { subject: 'Revenue', A: 98, fullMark: 150 },
  { subject: 'Utilization', A: 86, fullMark: 150 },
  { subject: 'Security', A: 99, fullMark: 150 },
  { subject: 'Loyalty', A: 85, fullMark: 150 },
];

export function Analytics() {
  return (
    <MotionPage>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[22px] bg-electric/20 flex items-center justify-center border border-electric/30 shadow-[0_0_40px_rgba(0,122,255,0.2)]">
               <BrainCircuit className="w-8 h-8 text-electric animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">AI Projection Hub</h1>
              <p className="text-slate-500 font-medium tracking-wide flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-cyber" />
                Neural network forecasting & market intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <CyberButton variant="outline" size="md">Reprocess Neural Cache</CyberButton>
             <CyberButton size="md" glow>Run New Simulation</CyberButton>
          </div>
        </div>

        {/* Hero Projection Chart */}
        <GlassCard className="p-0 overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyber/10 border border-cyber/20 text-[10px] font-black text-cyber uppercase tracking-widest">
                <Zap className="w-3 h-3 fill-cyber" />
                98.4% Confidence
              </div>
           </div>
           
           <div className="p-8 border-b border-white/5 bg-white/[0.01]">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Economic trajectory</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Predictive Revenue Analysis Index (PRAI)</p>
           </div>
           
           <div className="h-[450px] p-8 pb-10 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <defs>
                    <linearGradient id="gradientReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradientProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF94" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="real" 
                    name="Live Data" 
                    stroke="#007AFF" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#gradientReal)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="projected" 
                    name="AI Insight" 
                    stroke="#00FF94" 
                    strokeWidth={3}
                    strokeDasharray="8 8"
                    fillOpacity={1} 
                    fill="url(#gradientProjected)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="absolute bottom-12 right-12 space-y-4">
                 <div className="p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 w-48 shadow-2xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Projected Growth</p>
                    <div className="flex items-end justify-between">
                       <span className="text-2xl font-black text-white italic">+42.8%</span>
                       <TrendingUp className="w-6 h-6 text-cyber mb-1" />
                    </div>
                 </div>
              </div>
           </div>
        </GlassCard>

        {/* Secondary Insights Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
           <GlassCard className="lg:col-span-1 p-0 overflow-hidden">
             <div className="p-6 border-b border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">System Efficiency</h3>
                <p className="text-[9px] font-bold text-slate-500 uppercase">Cross-functional performance audit</p>
             </div>
             <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#ffffff05" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 700 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                      name="SmartRent"
                      dataKey="A"
                      stroke="#007AFF"
                      fill="#007AFF"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
             </div>
             <div className="px-6 pb-6 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black">
                   <span className="text-slate-500 uppercase tracking-widest">Fleet Integrity</span>
                   <span className="text-cyber">92%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                   <div className="w-[92%] h-full bg-cyber" />
                </div>
             </div>
           </GlassCard>

           <GlassCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Strategic insights</h3>
                 <span className="text-[9px] font-black text-cyber uppercase animate-pulse tracking-widest">AI ACTIVE</span>
              </div>
              <div className="flex-1 p-6 space-y-4">
                 {[
                   { title: 'Fleet Expansion Recommended', desc: 'Predicted 35% demand spike in luxury SUVs for DEC cycle.', icon: Target, color: 'text-cyber' },
                   { title: 'Dynamic Rate Optimization', desc: 'Increase manual transmission rates by 12% on weekends.', icon: Gauge, color: 'text-electric' },
                   { title: 'Maintenance Risk Detected', desc: 'Predictive failure alert for fleet unit DL-Logan01 engine block.', icon: ShieldAlert, color: 'text-rose-500' }
                 ].map((insight, i) => (
                   <motion.div 
                     key={i}
                     whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.02)' }}
                     className="p-4 rounded-2xl border border-white/5 flex items-start gap-4 transition-all cursor-pointer"
                   >
                     <div className={cn("mt-1", insight.color)}><insight.icon className="w-5 h-5" /></div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                           <h4 className="text-sm font-black text-white uppercase tracking-tight">{insight.title}</h4>
                           <ArrowUpRight className="w-3 h-3 text-slate-700" />
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tighter">{insight.desc}</p>
                     </div>
                   </motion.div>
                 ))}
              </div>
              <div className="p-4 bg-white/[0.02] border-t border-white/5">
                 <CyberButton variant="outline" className="w-full text-[10px] font-black uppercase tracking-widest">Full Intelligence Report</CyberButton>
              </div>
           </GlassCard>
        </div>

        {/* Global Summary Hub */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
           {[
             { label: 'Market Cap Share', val: '12.4%', icon: Globe, color: 'text-electric' },
             { label: 'Retention Coefficient', val: '0.85', icon: Users, color: 'text-cyber' },
             { label: 'Unit Liquidated %', val: '65.2%', icon: BarChart3, color: 'text-saffron' },
             { label: 'Carbon Compliance', val: 'A+', icon: Zap, color: 'text-emerald-500' }
           ].map((stat, i) => (
             <GlassCard key={i} className="p-6">
                <div className="flex justify-between items-start mb-4">
                   <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}><stat.icon className="w-4 h-4" /></div>
                   <span className="text-[10px] font-black text-slate-700">STABLE</span>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white tracking-tighter italic">{stat.val}</p>
             </GlassCard>
           ))}
        </div>
      </div>
    </MotionPage>
  );
}
