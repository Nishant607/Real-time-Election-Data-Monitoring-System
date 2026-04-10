import React, { useState, useEffect } from 'react';
import { 
  Vote, Plus, Eye, Key, MapPin, Search, Calendar, CheckCircle2, XCircle, SearchX
} from 'lucide-react';
import { electionService } from '../services/api';
import { supabase } from '../supabaseClient';
import ProvisionElectionModal from './ProvisionElectionModal';
import { motion, AnimatePresence } from 'framer-motion';

const ElectionsHub = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isProvisionModalOpen, setProvisionModalOpen] = useState(false);

  useEffect(() => {
    fetchElections();

    const electionsSub = supabase.channel('elections-hub-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'elections' },
        () => fetchElections()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(electionsSub);
    };
  }, []);

  const fetchElections = async () => {
    try {
      const res = await electionService.getAll();
      setElections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeElections = elections.filter(e => e.status === 'Active');
  const inactiveElections = elections.filter(e => e.status !== 'Active');

  const filteredElections = [...activeElections, ...inactiveElections].filter(e => {
    const nameStr = e.name ? e.name.toLowerCase() : '';
    return nameStr.includes(search.toLowerCase());
  });

  return (
    <div className="pb-20 space-y-10">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10"
      >
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Module Active</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter text-white drop-shadow-lg flex items-center gap-4">
            Elections <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Hub</span>
          </h1>
          <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
            Monitor and manage active electoral events. Provision new secure environments for decentralized recording.
          </p>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          onClick={() => setProvisionModalOpen(true)}
          className="relative flex items-center gap-3 py-4 px-8 rounded-2xl bg-blue-600 text-white overflow-hidden font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] transition-all group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Plus size={18} className="relative z-10" />
          <span className="relative z-10">Provision Election</span>
        </motion.button>
      </motion.header>

      {/* Toolbar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-40 bg-slate-900/90"
      >
        <div className="relative w-full md:w-96 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search events or locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-medium focus:shadow-[0_0_20px_rgba(56,189,248,0.15)]"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="glass-panel bg-slate-950/50 border-white/5 px-6 py-3 flex items-center gap-3 rounded-xl flex-1 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{activeElections.length} Active</span>
          </div>
          <div className="glass-panel bg-slate-950/50 border-white/5 px-6 py-3 flex items-center gap-3 rounded-xl flex-1 justify-center">
            <span className="w-2 h-2 rounded-full bg-slate-600" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{inactiveElections.length} Inactive</span>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence>
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <motion.div 
                key={`skeleton-${i}`} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-[280px] rounded-[2rem] bg-slate-800/50 border border-white/5 shadow-lg animate-pulse"
              />
            ))
          ) : filteredElections.map((election, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              key={election.id}
              className={`rounded-[2rem] p-6 border relative overflow-hidden group bg-slate-900 transition-all shadow-xl hover:shadow-2xl ${election.status === 'Active' ? 'border-blue-500/20 hover:border-blue-500/50' : 'border-white/5 hover:border-white/20'}`}
            >
              {/* Dynamic Gradients */}
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${election.status === 'Active' ? 'from-blue-600/10 to-indigo-900/10' : 'from-white/5 to-transparent'}`} />
              
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${election.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                  <Vote size={20} />
                </div>
                <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 border text-[9px] font-black uppercase tracking-[0.2em] ${election.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                  {election.status === 'Active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                  {election.status === 'Active' ? 'Receiving Votes' : 'Closed'}
                </div>
              </div>

              {/* Info */}
              <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-blue-400 transition-colors">
                {election.name}
              </h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-sm text-slate-400 flex items-center gap-3">
                  <span className="w-6 flex justify-center text-slate-600 group-hover:text-blue-500/50 transition-colors"><MapPin size={16} /></span>
                  {election.location || 'Distributed'}
                </p>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span className="w-6 flex justify-center text-slate-600 group-hover:text-blue-500/50 transition-colors"><Calendar size={16} /></span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-0.5">Start</span>
                    {new Date(election.start_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Hover Actions */}
              <div className="pt-4 border-t border-white/5 flex gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                <button className="flex-1 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-bold tracking-widest uppercase hover:bg-blue-500 hover:text-white transition-colors border border-blue-500/20 flex items-center justify-center gap-2">
                  <Eye size={14} />
                  Inspect
                </button>
                <button className={`p-2.5 rounded-xl border flex items-center justify-center transition-colors ${election.status === 'Active' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}>
                  <Key size={16} />
                </button>
              </div>
            </motion.div>
          ))}
          
          {!loading && filteredElections.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full h-64 flex flex-col items-center justify-center text-slate-500 border border-white/5 rounded-[2rem] border-dashed"
            >
              <SearchX size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-bold">No elections found</p>
              <p className="text-sm">Try adjusting your tracking parameters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProvisionElectionModal 
        isOpen={isProvisionModalOpen} 
        onClose={() => setProvisionModalOpen(false)} 
        onRefresh={fetchElections} 
      />
    </div>
  );
};

export default ElectionsHub;
