import React, { useState, useEffect } from 'react';
import { Search, Trophy, Filter, ArrowUpRight, Users, Target, Zap, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { candidateService } from '../services/api';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import AddCandidateModal from './AddCandidateModal';

const CandidateRoster = () => {
  const { isAdmin } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [allCandidates, setAllCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank'); // 'rank', 'name', 'votes'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCandidates = async () => {
    try {
      const res = await candidateService.getRankings();
      setCandidates(res.data);
      setAllCandidates(res.data);
      const uniqueParties = ['All', ...new Set(res.data.map(c => c.candidate__party))];
      setParties(uniqueParties);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();

    const candidatesSub = supabase.channel('roster-candidates-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        () => fetchCandidates()
      )
      .subscribe();

    const votesSub = supabase.channel('roster-votes-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetchCandidates()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(candidatesSub);
      supabase.removeChannel(votesSub);
    };
  }, []);

  const getFilteredAndSorted = () => {
    let result = [...allCandidates];
    
    // Filter by Party
    if (selectedParty !== 'All') {
      result = result.filter(c => c.candidate__party === selectedParty);
    }
    
    // Search by Name
    if (searchTerm) {
      result = result.filter(c => 
        c.candidate__name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.candidate__name.localeCompare(b.candidate__name);
      if (sortBy === 'votes') return b.total_votes - a.total_votes;
      return a.rank - b.rank; // Default is rank
    });
    
    return result;
  };

  const currentCandidates = getFilteredAndSorted();

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Retrieving Roster Data...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            Candidate Roster <span className="text-purple-500">.</span>
          </h1>
          <p className="text-slate-400 max-w-lg">
            Verified performance metrics and real-time rankings for all active candidates in the system.
          </p>
        </div>
        {isAdmin && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-10 py-4 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-2xl shadow-purple-600/20 hover:opacity-90 transition-all font-bold"
            >
              <UserPlus size={20} />
              Add Candidate
            </button>
          </motion.div>
        )}
      </motion.header>

      {/* Controls Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col xl:flex-row xl:items-center gap-6"
      >
        {/* Search */}
        <div className="flex-1 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search candidate by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 pl-16 pr-6 text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-600 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/5 w-fit">
          <div className="px-6 flex items-center gap-3 text-slate-500 border-r border-white/10 py-2">
            <Filter size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parties</span>
          </div>
          <div className="flex gap-2 p-1">
            {parties.map((party) => (
              <button
                key={party}
                onClick={() => setSelectedParty(party)}
                className={`px-6 py-2.5 rounded-full transition-all text-[10px] font-black tracking-widest uppercase border ${
                  selectedParty === party 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20' 
                    : 'bg-transparent border-transparent text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {party}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/5 w-fit">
          <div className="px-6 flex items-center gap-3 text-slate-500 border-r border-white/10 py-2">
            <Trophy size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sort</span>
          </div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 focus:outline-none cursor-pointer"
          >
            <option value="rank" className="bg-slate-900">Rank (Default)</option>
            <option value="name" className="bg-slate-900">Alphabetical</option>
            <option value="votes" className="bg-slate-900">Total Votes</option>
          </select>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence>
          {currentCandidates.map((c, index) => (
            <motion.div 
              key={c.candidate__id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -8 }}
              className="glass-panel p-8 relative overflow-hidden group border-white/5 hover:border-purple-500/30 transition-all duration-500"
            >
              {/* Dynamic Background Glow */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-purple-600/5 blur-3xl rounded-full group-hover:bg-purple-600/20 transition-all duration-700" />
              
              {/* Rank Indicia */}
              <div className={`absolute -right-2 -top-2 w-16 h-16 flex items-center justify-center rounded-3xl rotate-12 transition-all group-hover:rotate-0 group-hover:scale-110 duration-500 font-black text-xl shadow-2xl ${
                c.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-orange-600 text-white' : 
                c.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                c.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-700 text-white' : 'bg-slate-800 text-slate-500'
              }`}>
                #{c.rank}
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center text-4xl font-black text-white shadow-2xl group-hover:rounded-2xl transition-all duration-500 relative overflow-hidden">
                   <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {c.initials}
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-black text-xl leading-tight text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors uppercase">
                    {c.candidate__name}
                  </h3>
                  <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                    <Target size={12} /> {c.candidate__party}
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8 bg-black/20 p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Zap size={12} className="text-amber-500" /> Total Votes
                  </span>
                  <span className="font-black text-white text-lg">{c.total_votes.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${c.percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  />
                </div>
                <div className="flex justify-between items-center text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vote Share</span>
                  <span className="font-black text-purple-400">{c.percentage}%</span>
                </div>
              </div>

              <Link 
                to="/analytics"
                className="w-full py-4 rounded-2xl bg-slate-900 border border-white/5 hover:bg-purple-600 hover:border-purple-500 hover:text-white text-slate-400 transition-all font-bold flex items-center justify-center gap-3 text-sm shadow-xl group/btn"
              >
                Deep Intelligence 
                <ArrowUpRight size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AddCandidateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={fetchCandidates}
      />
    </div>
  );
};

export default CandidateRoster;
