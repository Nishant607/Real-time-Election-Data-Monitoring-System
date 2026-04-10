import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { electionService } from '../services/api';

const ProvisionElectionModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await electionService.create(formData);
      setSuccess(true);
      setTimeout(() => {
        onRefresh();
        onClose();
        setSuccess(false);
        setFormData({ name: '', start_date: '', end_date: '' });
      }, 2000);
    } catch (err) {
      console.error("Error creating election:", err);
      setError(err.response?.data?.detail || "Failed to provision election. Please verify inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-2xl bg-slate-900 border border-white/5 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 to-transparent">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Provision Registry</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Initialize new secure election node</p>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm"
              >
                <ShieldAlert size={18} /> {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm font-bold uppercase tracking-widest"
              >
                <CheckCircle2 size={18} /> Node Provisioned Successfully
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Election Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g., General Assembly 2026"
                  className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Activation Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      required
                      type="date"
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Termination Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      required
                      type="date"
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading || success}
                className="w-full primary-btn flex items-center justify-center gap-3 py-5 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed group shadow-emerald-600/20 shadow-2xl"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Authorize Provisioning</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProvisionElectionModal;
