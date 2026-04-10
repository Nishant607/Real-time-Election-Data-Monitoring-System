import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, PieChart, Star, Target, Crown, Activity, BarChart3, Globe } from 'lucide-react';
import { analyticsService } from '../services/api';
import { supabase } from '../supabaseClient';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsCenter = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getStats();
        setData(res.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();

    const votesSub = supabase.channel('analytics-votes-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetchAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesSub);
    };
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Aggregating Global Metrics...</p>
    </div>
  );

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        borderRadius: 12,
        borderColor: 'rgba(56, 189, 248, 0.2)',
        borderWidth: 1,
      }
    },
    scales: {
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }, 
        ticks: { color: '#64748b', font: { size: 10, weight: '600' } } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#cbd5e1', font: { size: 10, weight: '600' } } 
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom', 
        labels: { 
          color: '#94a3b8', 
          padding: 30, 
          font: { size: 11, weight: '600', family: 'Inter' },
          usePointStyle: true,
          pointStyle: 'circle'
        } 
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        borderRadius: 12,
        borderColor: 'rgba(168, 85, 247, 0.2)',
        borderWidth: 1,
      }
    },
    cutout: '75%',
  };

  const barData = {
    labels: data.bar_chart.labels,
    datasets: [{
      label: 'Votes',
      data: data.bar_chart.data,
      backgroundColor: 'rgba(56, 189, 248, 0.6)',
      borderRadius: 12,
      hoverBackgroundColor: '#38bdf8',
      barThickness: 32,
    }]
  };

  const doughnutData = {
    labels: data.doughnut_chart.labels,
    datasets: [{
      data: data.doughnut_chart.data,
      backgroundColor: [
        '#3b82f6',
        '#f97316',
        '#a855f7',
        '#10b981',
        '#ef4444'
      ],
      borderWidth: 0,
      hoverOffset: 20
    }]
  };

  return (
    <div className="space-y-12 pb-20">
      <motion.header
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-5xl font-black mb-3 tracking-tight">
          Analytics <span className="text-blue-500">Center</span>
        </h1>
        <p className="text-slate-400 max-w-lg font-medium">
          Deep-intelligence monitoring of global voting trends, party dominance, and demographic distribution.
        </p>
      </motion.header>

      {/* Snapshot Insight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-10 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 text-white relative overflow-hidden group"
        >
          <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-white/10 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-2">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Aggregate Participation</p>
              <h2 className="text-5xl font-black tracking-tighter">{data.total_votes.toLocaleString()}</h2>
            </div>
            <div className="mt-12 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white/90 bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur-md">
              <Globe size={14} /> Verified Census Node
            </div>
          </div>
          <Target className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5 opacity-40 rotate-12" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-10 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="space-y-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Primary Contender</p>
            <h2 className="text-3xl font-black text-amber-500 mb-4 tracking-tight uppercase leading-none">{data.leader}</h2>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded-full border border-amber-500/20 uppercase tracking-[0.2em] shadow-lg shadow-amber-500/5">P1 Lead Status</span>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -right-6 -bottom-6 opacity-5"
          >
            <Crown size={140} className="text-white" />
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-10 relative overflow-hidden flex flex-col justify-between"
        >
          <div className="space-y-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Majority Coalition</p>
            <h2 className="text-3xl font-black text-blue-400 mb-4 tracking-tight uppercase leading-none">{data.leading_party}</h2>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/20 uppercase tracking-[0.2em] shadow-lg shadow-blue-500/5">System Domain</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-5 rotate-12">
            <BarChart3 size={140} className="text-white" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-8 glass-panel p-10"
        >
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
              <h3 className="text-xl font-black flex items-center gap-3 tracking-tight">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Candidate Stratification
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-4">Live vote distribution per major contender</p>
            </div>
          </div>
          <div className="h-96 w-full relative pl-2">
            <Bar options={barOptions} data={barData} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-4 glass-panel p-10 flex flex-col overflow-hidden relative"
        >
          <div className="absolute right-[-10%] top-[-5%] w-40 h-40 bg-purple-500/5 blur-[50px] rounded-full" />
          <div className="space-y-1 mb-10 text-center">
            <h3 className="text-xl font-black tracking-tight text-white uppercase">
              Party Share
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global dominance breakdown</p>
          </div>
          <div className="h-80 w-full relative mb-10">
            <Doughnut options={doughnutOptions} data={doughnutData} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Total</p>
               <p className="text-2xl font-black text-white">{data.total_votes.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-4 relative z-10">
             {data.doughnut_chart.labels.slice(0, 3).map((label, i) => (
               <div key={label} className="flex justify-between items-center bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-slate-300 capitalize">{label}</span>
                  <span className="text-xs font-black text-white">{((data.doughnut_chart.data[i] / data.total_votes) * 100).toFixed(1)}%</span>
               </div>
             ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsCenter;
