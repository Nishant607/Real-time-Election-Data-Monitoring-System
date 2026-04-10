import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Activity, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans overflow-hidden relative selection:bg-blue-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
            <ShieldCheck className="text-blue-400" size={24} />
          </div>
          <span className="text-xl font-black tracking-tight text-white uppercase">Election<span className="text-blue-500">Monitor</span></span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors uppercase tracking-widest">
            Node Access
          </Link>
          <Link to="/login" className="group flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
            Initialize
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">v2.4 Core Online</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-tight"
        >
          Democratic <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            Integrity Engine
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl text-lg text-slate-400 mb-12 font-medium leading-relaxed"
        >
          Real-time election surveillance, cryptographic candidate verification, and distributed anomaly detection for next-generation democratic processes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Link to="/login" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black text-sm uppercase tracking-[0.2em] transition-all hover:bg-blue-50 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
            Access Command Center
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-colors">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">Live Telemetry</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Continuous stream of voting data cross-referenced with demographic baselines to identify statistical anomalies instantly.</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-indigo-500/30 transition-colors">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="text-indigo-400" size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">Geospatial Sync</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Map-based interface providing precinct-level fidelity across all active voting jurisdictions.</p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-3xl hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">Cryptographic Logs</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Immutable audit trails for every administrative action, ensuring total accountability of the command center.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
