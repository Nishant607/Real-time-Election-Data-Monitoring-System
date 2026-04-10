import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, User, ShieldCheck, Info, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'User'
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            role: formData.role
          }
        }
      });

      if (error) throw error;

      setStatus({ 
        type: 'success', 
        message: `Account for ${formData.username} created successfully. They can now access the system.` 
      });
      setFormData({ username: '', email: '', password: '', role: 'User' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.message || 'Failed to create account.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-2">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
          <UserPlus size={14} />
          Provision Access
        </div>
        <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-white mb-4">
          Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Account</span>
        </h1>
        <p className="text-slate-400 font-medium max-w-2xl">
          Provision new operator identites for the Election Monitor system. Ensure all new operators have undergone required clearance procedures.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-10 relative overflow-hidden"
          >
            {/* Mesh gradient background */}
            <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[100%] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Identity Vector (Username)</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-semibold text-sm shadow-inner"
                      placeholder="e.g. jdoe_ops"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Comm Channel (Email)</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-semibold text-sm shadow-inner"
                      placeholder="operator@election.local"
                    />
                  </div>
                </div>

              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Access Protocol (Password)</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/50 transition-all font-semibold text-sm shadow-inner tracking-widest"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Clearance Level (Role)</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'User'})}
                    className={`py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.role === 'User' 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.15)]' 
                        : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                    }`}
                  >
                    <User size={24} />
                    <span className="text-xs font-black uppercase tracking-wider">Standard Operator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'Admin'})}
                    className={`py-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      formData.role === 'Admin' 
                        ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                        : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                    }`}
                  >
                    <ShieldCheck size={24} />
                    <span className="text-xs font-black uppercase tracking-wider">Administrator</span>
                  </button>
                </div>
              </div>

              {/* Status Message */}
              <AnimatePresence>
                {status.message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`mt-4 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center gap-2 border ${
                      status.type === 'success' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {status.type === 'success' ? <ShieldCheck size={16} /> : <Info size={16} />}
                      {status.message}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Provision Identity
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-blue-900/10 border border-blue-500/20 rounded-[2rem] p-8 h-full flex flex-col">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
              <Info size={24} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-4">Security Protocol</h3>
            <div className="space-y-4 text-sm text-slate-400 font-medium">
              <p>
                All provisioned identities are granted preliminary access to the operational dashboard but are subjected to continuous behavioral analysis.
              </p>
              <p>
                Administrators possess overriding capabilities including alert dismissal and threshold configurations. 
              </p>
              <div className="mt-8 pt-6 border-t border-blue-500/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Password Policy</p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Minimum 12 characters</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Cryptographic entropy</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> No spatial patterns</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
