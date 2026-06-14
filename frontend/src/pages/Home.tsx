import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Zap, Globe, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CyberButton } from '../ui/CyberButton';
import { GlassCard } from '../ui/GlassCard';

export function Home() {
  return (
    <div className="min-h-screen bg-obsidian text-slate-300 selection:bg-electric/30 overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-electric/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-cyber/10 blur-[150px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-20 flex items-center justify-between px-6 lg:px-16 z-50 bg-obsidian/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-electric flex items-center justify-center text-white font-black">SR</div>
          <span className="text-white font-bold text-xl tracking-tighter">SmartRent</span>
        </div>
        <div className="hidden md:flex items-center space-x-10 text-sm font-semibold tracking-wide">
          <a href="#fleet" className="hover:text-white transition-colors">Fleet</a>
          <a href="#experience" className="hover:text-white transition-colors">Experience</a>
          <a href="#company" className="hover:text-white transition-colors">Company</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-bold hover:text-white transition-colors">Client Portal</Link>
          <Link to="/login">
            <CyberButton size="sm" glow>Join the Future</CyberButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 text-center overflow-hidden">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="relative z-10"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-100">Next-Gen Mobility is Here</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white leading-[1] tracking-tighter mb-6">
            REDESIGNING THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-cyber">AUTOMOTIVE EXPERIENCE</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium mb-10 leading-relaxed">
            The world's most advanced fleet management and luxury car rental marketplace. 
            Experience speed, precision, and pure innovation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <CyberButton size="lg" className="w-full sm:w-auto px-10 py-5 text-lg">Book Your Journey</CyberButton>
            <button className="flex items-center space-x-2 px-8 py-5 text-white font-bold hover:text-electric transition-colors group">
              <span>Explore Fleet</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* 3D Hero Car Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="relative mt-20 perspective-[1000px] w-full max-w-6xl"
        >
          <div className="relative group">
            {/* Glow behind the car */}
            <div className="absolute -inset-10 bg-electric/20 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <img 
              src="C:\Users\MSI\.gemini\antigravity\brain\e4e511b2-beb1-4782-a330-028d56b6e958\hero_car_futuristic_1780220288875.png" 
              alt="Futuristic Luxury SUV" 
              className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,122,255,0.2)]"
            />
            
            {/* Animated UI overlays on the car image */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] -left-10 md:left-20"
            >
              <GlassCard className="py-3 px-5 border-electric/50" animate={false}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-electric/20 text-electric"><Zap className="w-4 h-4" /></div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Acceleration</p>
                    <p className="text-sm font-black text-white">0-100 in 2.8s</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[30%] -right-10 md:right-20"
            >
              <GlassCard className="py-3 px-5 border-cyber/50" animate={false}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-cyber/20 text-cyber"><Globe className="w-4 h-4" /></div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Range</p>
                    <p className="text-sm font-black text-white">740 km WLTP</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 lg:px-16 space-y-20">
        <div className="max-w-4xl section-reveal">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">PRECISION <br />MEETS TECHNOLOGY</h2>
          <p className="text-xl text-slate-400">Our platform is built for the high-end mobility era. Every pixel is tuned for performance.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <GlassCard className="p-10 space-y-6 group hover:border-electric/50 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center text-electric group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Instant Deployment</h3>
            <p className="text-slate-500 leading-relaxed font-medium">Manage your entire fleet from one centralized control center with zero latency.</p>
          </GlassCard>

          <GlassCard className="p-10 space-y-6 group hover:border-cyber/50 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-cyber/10 flex items-center justify-center text-cyber group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Advanced Security</h3>
            <p className="text-slate-500 leading-relaxed font-medium">Enterprise-grade protection with real-time tracking and automated risk analysis.</p>
          </GlassCard>

          <GlassCard className="p-10 space-y-6 group hover:border-white/20 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ArrowRight className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Global Scalability</h3>
            <p className="text-slate-500 leading-relaxed font-medium">Expand your business globally with automated compliance and multi-market support.</p>
          </GlassCard>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 lg:px-16">
        <div className="rounded-[40px] bg-gradient-to-br from-electric/20 via-blue-900/10 to-obsidian p-16 md:p-24 text-center border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5" />
          <motion.div whileInView={{ scale: [0.95, 1], opacity: [0, 1] }} className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">READY TO DRIVE THE FUTURE?</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join hundreds of luxury car rental agencies transforming their business with SmartRent.</p>
            <CyberButton size="lg" glow className="px-12 py-6 text-xl">Get Started Now</CyberButton>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-6 lg:px-16 border-t border-white/5 text-center">
        <p className="text-sm font-bold tracking-widest text-slate-600 uppercase">© 2026 SmartRent Morocco · Future Mobility Platforms</p>
      </footer>
    </div>
  );
}
