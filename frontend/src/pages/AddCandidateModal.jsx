import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Target, CheckCircle2, ShieldAlert, ChevronDown } from 'lucide-react';
import { candidateService, electionService } from '../services/api';

const AddCandidateModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    election: '',
  });
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchElections = async () => {
        try {
          const res = await electionService.getAll();
          setElections(res.data);
          if (res.data.length > 0) {
            setFormData(prev => ({ ...prev, election: res.data[0].id }));
          }
        } catch (err) {
          console.error("Error fetching elections:", err);
        }
      };
      fetchElections();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        name: formData.name,
        party: formData.party,
        election_id: formData.election
      };
      
      await candidateService.create(payload);
      setSuccess(true);
      setTimeout(() => {
        onRefresh();
        onClose();
        setSuccess(false);
        setFormData({ name: '', party: '', election: elections[0]?.id || '' });
      }, 2000);
    } catch (err) {
      console.error("Error adding candidate:", err);
      setError("Failed to add candidate. Ensure all fields are valid.");
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
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-purple-500/10 to-transparent">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Enter Contender</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Enroll new candidate in election node</p>
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
                className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center gap-3 text-sm font-bold uppercase tracking-widest"
              >
                <CheckCircle2 size={18} /> Candidate Enrolled Successfully
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Full Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g., John Doe"
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Affiliated Party</label>
                  <div className="relative">
                    <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      required
                      type="text"
                      placeholder="e.g., Independent"
                      className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700"
                      value={formData.party}
                      onChange={(e) => setFormData({...formData, party: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Assigned Election</label>
                <div className="relative group">
                  <select 
                    required
                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                    value={formData.election}
                    onChange={(e) => setFormData({...formData, election: e.target.value})}
                  >
                    {elections.map(e => (
                      <option key={e.id} value={e.id} className="bg-slate-900">{e.name} ({e.status})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-purple-400 transition-colors" size={18} />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                disabled={loading || success || elections.length === 0}
                className="w-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-semibold flex items-center justify-center gap-3 py-5 rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed group shadow-purple-600/20 shadow-2xl transition-all hover:opacity-90 active:scale-95"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span>Authorize Enrollment</span>
                  </>
                )}
              </button>
              {elections.length === 0 && (
                <p className="text-[10px] text-center text-amber-500 uppercase tracking-widest font-black mt-4">Warning: No active elections found to assign candidate</p>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddCandidateModal;
