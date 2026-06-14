import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { 
  TrendingUp, 
  Car, 
  Calendar, 
  Users, 
  Wrench, 
  ShieldAlert, 
  Wallet,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { api, DashboardOverview } from '../api';
import { GlassCard } from '../ui/GlassCard';
import { MotionPage } from '../ui/MotionPage';
import { CyberButton } from '../ui/CyberButton';
import { cn } from '../utils';

const statusColors: Record<string, string> = {
  AVAILABLE: '#00FF94', // Cyber Mint
  RESERVED: '#007AFF', // Electric Blue
  RENTED: '#1A1A1A',
  MAINTENANCE: '#FFD600', // Saffron
  OUT_OF_SERVICE: '#FF3B30' // Rose
};

const severityColors = {
  INFO: 'border-sky-500/30 text-sky-400 bg-sky-500/5',
  WARNING: 'border-amber-500/30 text-amber-400 bg-amber-500/5',
  CRITICAL: 'border-rose-500/30 text-rose-400 bg-rose-500/5'
};

export function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => (await api.get<DashboardOverview>('/dashboard/overview')).data
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <MotionPage>
        <GlassCard className="text-center py-20 border-rose-500/20">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-80" />
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">System Down</h1>
          <p className="mt-2 text-slate-500 font-medium">Remote command center failed to initialize data streams.</p>
          <CyberButton onClick={() => refetch()} variant="destructive" className="mt-8 px-8">Retry Connection</CyberButton>
        </GlassCard>
      </MotionPage>
    );
  }

  const { summary } = data;
  const stats = [
    { label: 'Revenue Today', value: money(summary.revenueToday), icon: Wallet, color: 'text-cyber', helper: '+12% from yesterday' },
    { label: 'Monthly Revenue', value: money(summary.revenueThisMonth), icon: TrendingUp, color: 'text-electric', helper: 'Target: 850k MAD' },
    { label: 'Active Rentals', value: summary.activeRentals, icon: Car, color: 'text-white', helper: 'Utilization: 68.5%' },
    { label: 'Available Now', value: summary.availableCars, icon: Calendar, color: 'text-cyber', helper: 'Ready for dispatch' },
    { label: 'In Maintenance', value: summary.carsInMaintenance, icon: Wrench, color: 'text-saffron', helper: 'Avg. turnaround: 2.1d' },
    { label: 'Insurance Alert', value: summary.expiringInsurance, icon: ShieldAlert, color: 'text-rose-500', helper: 'Critical renewals' },
    { label: 'Customer Base', value: summary.customerGrowth, icon: Users, color: 'text-electric', helper: '+24 this week' },
    { label: 'Pending Deposits', value: summary.pendingDeposits, icon: Wallet, color: 'text-slate-400', helper: 'Escrow verification' }
  ];

  return (
    <MotionPage>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Control Center</h1>
            <p className="text-slate-500 font-medium tracking-wide">Real-time mobility analytics & fleet synchronization</p>
          </div>
          <div className="flex items-center gap-3">
             <CyberButton variant="outline" size="md">Export Data</CyberButton>
             <CyberButton size="md" glow className="flex items-center gap-2">
               <Plus className="w-4 h-4" />
               <span>Launch Booking</span>
             </CyberButton>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <GlassCard key={stat.label} className="group hover:border-white/20 transition-all duration-500">
               <div className="flex items-start justify-between">
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color.replace('text-', 'bg-').replace('500', '500/10'))}>
                   <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div className="flex items-center text-[10px] font-black text-cyber bg-cyber/10 px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  LIVE
                </div>
               </div>
               <div className="mt-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white tracking-tight group-hover:text-glow transition-all">{stat.value}</p>
                <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase tracking-tighter">{stat.helper}</p>
               </div>
            </GlassCard>
          ))}
        </div>

        {/* Charts & Alerts Row */}
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Revenue Trajectory</h2>
                <p className="text-xs text-slate-500 font-medium">Performance metrics across the current fiscal cycle</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-electric/10 border border-electric/20 text-[10px] font-black text-electric">
                  <div className="w-1.5 h-1.5 rounded-full bg-electric animate-pulse" />
                  REAL-TIME
                </div>
              </div>
            </div>
            <div className="h-[400px] p-8 pb-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <defs>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00FF94" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="paidRevenue" 
                    name="Liquidated" 
                    stroke="#007AFF" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorPaid)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bookedRevenue" 
                    name="Projected" 
                    stroke="#00FF94" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorBooked)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Active Alerts</h2>
                <div className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-500 text-[10px] font-black">
                  {data.alerts.length}
                </div>
              </div>
              <div className="space-y-4">
                {data.alerts.map(alert => (
                  <motion.div 
                    key={alert.id}
                    whileHover={{ x: 5 }}
                    className={cn("p-4 rounded-xl border flex gap-3 group", severityColors[alert.severity as keyof typeof severityColors] || severityColors.INFO)}
                  >
                    <div className="mt-1"><ShieldAlert className="w-4 h-4" /></div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] font-black uppercase tracking-tighter mb-0.5">{alert.title}</p>
                      <p className="text-[11px] font-medium opacity-70 leading-relaxed truncate">{alert.description}</p>
                      <button 
                        onClick={() => navigate(alert.targetPath)}
                        className="mt-3 flex items-center gap-1.5 text-[10px] font-bold group-hover:gap-2 transition-all underline underline-offset-4"
                      >
                        RESOLVE <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-0 overflow-hidden">
               <div className="p-6 border-b border-white/5">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Fleet Bio-Status</h2>
               </div>
               <div className="h-60 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={data.fleetUtilization.filter(i => i.count > 0)} 
                      innerRadius={60} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="count"
                    >
                      {data.fleetUtilization.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={statusColors[entry.status]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
               </div>
               <div className="px-6 pb-6 grid grid-cols-2 gap-2">
                 {data.fleetUtilization.map(u => (
                   <div key={u.status} className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColors[u.status] }} />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{u.status}</span>
                   </div>
                 ))}
               </div>
            </GlassCard>
          </div>
        </div>

        {/* Global Recent Activity */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">Live Mission Feed</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-[0.2em] mt-1">Global synchronization active</p>
            </div>
            <CyberButton variant="outline" size="sm" onClick={() => navigate('/dashboard/bookings')}>Audit All Logs</CyberButton>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator / Unit</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Timeline</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right whitespace-nowrap">Asset Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentBookings.map((booking) => (
                  <tr 
                    key={booking.id} 
                    onClick={() => navigate('/dashboard/bookings')}
                    className="group cursor-pointer hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-xs font-black text-slate-400">
                          {booking.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white tracking-tight">{booking.customerName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">
                            {booking.vehicleLabel} · <span className="text-electric">{booking.plateNumber}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <p className="text-[10px] font-black text-slate-300 mb-1">{dateTime(booking.pickupAt)}</p>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[60%] h-full bg-electric/50" />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:border-electric/50 transition-all">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-sm font-black text-white tracking-tight">{money(booking.totalAmount)}</p>
                      <p className="text-[9px] font-black text-cyber uppercase tracking-tighter">SECURE</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </MotionPage>
  );
}

function money(value: number) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(value);
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat('fr-MA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
