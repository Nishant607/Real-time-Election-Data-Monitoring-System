import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Loader2, ShieldCheck, Activity, Globe, ShieldAlert } from 'lucide-react';
import { useAuth } from '../services/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] overflow-hidden relative font-sans">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="w-full max-w-xl px-6 z-10 flex flex-col md:flex-row gap-0 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(30,58,138,0.2)] border border-white/5"
      >
        {/* Left Side: Brand/Info */}
        <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-blue-600 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-10 border border-white/20">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
              Election <br /> Monitor <span className="text-blue-200">System</span>
            </h1>
            <p className="text-blue-100/70 text-sm leading-relaxed font-medium">
              Enterprise-grade surveillance for democratic integrity. Verified node connectivity.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 text-white">
                <Globe size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Global Status</p>
                <p className="text-xs font-bold text-white uppercase">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/10 text-white">
                <Activity size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Network Latency</p>
                <p className="text-xs font-bold text-white uppercase">12ms Response</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 bg-slate-900/80 backdrop-blur-3xl p-10 md:p-14 border-l border-white/5">
          <div className="md:hidden flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Election Monitor</h2>
          </div>

          <div className="mb-10 text-left">
            <h3 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">Sign In</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-[1.25rem] py-4 pl-14 pr-6 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm shadow-inner"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-[1.25rem] py-4 pl-14 pr-16 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm shadow-inner tracking-widest"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl flex items-center gap-3">
                    <ShieldAlert size={16} />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-50 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Login
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.div>
                </>
              )}
            </button>
          </form>

          <footer className="mt-14 pt-8 border-t border-white/5 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Node ID: 8824-V</p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
