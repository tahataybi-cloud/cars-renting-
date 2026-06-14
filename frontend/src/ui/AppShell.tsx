import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  CalendarCheck, 
  Car, 
  Gauge, 
  Menu, 
  Users, 
  Wrench, 
  X,
  LogOut,
  ChevronRight,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Login } from '../pages/Login';
import { api, Me } from '../api';
import { cn } from '../utils';

const nav = [
  { to: '/dashboard', label: 'Overview', icon: Gauge },
  { to: '/dashboard/fleet', label: 'Fleet', icon: Car },
  { to: '/dashboard/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/dashboard/customers', label: 'Customers', icon: Users },
  { to: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 }
];

export function AppShell() {
  const token = localStorage.getItem('smartrent_token');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get<Me>('/auth/me')).data,
    enabled: !!token && token !== 'undefined' && token !== 'null'
  });

  const isValidToken = token && token !== 'undefined' && token !== 'null';

  if (!isValidToken) {
    return <Login />;
  }

  function logout() {
    localStorage.removeItem('smartrent_token');
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-obsidian text-slate-300 font-sans selection:bg-electric/30">
      {/* Dynamic Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20 transition-opacity duration-1000">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-electric/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-cyber/10 blur-[100px]" />
      </div>

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 lg:flex flex-col border-r border-white/5 bg-graphite/40 backdrop-blur-2xl z-30">
        <div className="h-20 flex items-center px-8 border-b border-white/5 space-x-3">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.6 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(0,122,255,0.4)]"
          >
            SR
          </motion.div>
          <div>
            <h2 className="text-white font-bold tracking-tight text-lg">SmartRent</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-electric font-black opacity-80">Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => cn(
                "group relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-electric/10 text-white" 
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-electric" : "group-hover:text-slate-300")} />
                  <span className="font-medium text-sm tracking-wide">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute left-0 w-1 h-6 bg-electric rounded-r-full shadow-[0_0_10px_rgba(0,122,255,0.8)]"
                    />
                  )}
                  <ChevronRight className={cn("ml-auto w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-40 group-hover:translate-x-0", isActive && "opacity-0")} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center space-x-3 p-3 rounded-2xl bg-white/5 border border-white/5 mb-4 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border border-white/10" />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{me?.fullName || 'User Name'}</p>
              <p className="text-[10px] text-slate-500 truncate">{me?.email || 'email@example.com'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all duration-500 font-medium text-sm group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20 bg-obsidian/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-white">
                {nav.find(item => item.to === location.pathname)?.label || 'Overview'}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                System Status: <span className="text-cyber">Optimal</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center bg-white/5 rounded-full px-4 py-1.5 border border-white/10 space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber animate-pulse-fast shadow-[0_0_8px_rgba(0,255,148,0.6)]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Live Monitor</span>
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-electric rounded-full border-2 border-obsidian" />
            </button>
            
            <button className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white text-obsidian font-bold text-sm hover:bg-electric hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span>New Action</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page View */}
        <main className="flex-1 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-graphite border-r border-white/10 z-50 lg:hidden flex flex-col"
            >
              <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded bg-electric flex items-center justify-center text-white font-bold">SR</div>
                  <span className="font-bold text-white uppercase tracking-tighter">SmartRent</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-2 text-slate-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 py-6 px-4 space-y-2">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                     className={({ isActive }) => cn(
                      "flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all",
                      isActive ? "bg-electric text-white shadow-lg shadow-electric/20" : "text-slate-400"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
