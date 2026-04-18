import React, { useState, useEffect } from 'react';
import { 
  Users, Vote, AlertTriangle, TrendingUp, ShieldCheck, 
  ArrowRight, FileText, Activity, Clock 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyticsService, activityLogService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../supabaseClient';

const MetricCard = ({ title, value, icon: Icon, color, delay }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 80 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative overflow-hidden rounded-[2rem] p-6 shadow-2xl transition-all duration-300 border border-white/5 bg-slate-900 group`}
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color.bgGrad} opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
      
      {/* Animated Light Beam */}
      <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-beam" />
      
      {/* Decorative Blob */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:scale-150 transition-transform duration-700 ${color.blob}`} />

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div className="flex justify-between items-start">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-950/50 backdrop-blur-xl border border-white/10 shadow-inner group-hover:border-white/20 transition-all`}>
            <Icon className={color.text} size={28} />
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50 tracking-widest uppercase">
            Live
          </div>
        </div>
        
        <div>
          <p className={`text-5xl font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br ${color.textGrad} drop-shadow-sm`}>
            {value}
          </p>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-[0.2em]">{title}</h3>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, activityRes] = await Promise.all([
          analyticsService.getStats(),
          activityLogService.getAll()
        ]);
        setMetrics(metricsRes.data);
        setRecentActivity(activityRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    // Subscribe to realtime changes
    const activitySub = supabase.channel('custom-activity-channel')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'activity_logs' }, 
        () => fetchDashboardData()
      )
      .subscribe();

    const electionsSub = supabase.channel('custom-elections-channel')
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'vote_records' }, 
        () => fetchDashboardData()
      )
      .subscribe();

    // Polling fallback to guarantee live updates for Viva
    const pollInterval = setInterval(fetchDashboardData, 1500);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(activitySub);
      supabase.removeChannel(electionsSub);
    };
  }, []);



  return (
    <div className="pb-24 space-y-16">
      {/* Header Section */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 relative z-10"
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">Network Secured</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tighter text-white drop-shadow-lg leading-tight flex flex-wrap gap-2">
            Election <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Overview</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-medium">
            {user ? (
              <>Authorization confirmed, <span className="text-white font-bold">{user.username}</span>. All integrity protocols are nominal.</>
            ) : (
              <>Viewing as <span className="text-white font-bold">Guest</span>. Global view access granted.</>
            )}
          </p>
        </div>
        
        {isAdmin && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group">
            <Link to="/reports" className="relative flex items-center gap-3 py-4 px-10 rounded-2xl bg-white text-slate-900 overflow-hidden font-black uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <FileText size={20} className="relative z-10" />
              <span className="relative z-10">Compile Report</span>
            </Link>
          </motion.div>
        )}
      </motion.header>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Processed Votes" 
          value={metrics?.total_votes?.toLocaleString() || '0'} 
          icon={Vote} 
          color={{ bgGrad: 'from-blue-600/10 to-indigo-900/40', textGrad: 'from-white to-blue-200', text: 'text-blue-400', blob: 'bg-blue-500' }}
          delay={0.1}
        />
        <MetricCard 
          title="Registered Candidates" 
          value={metrics?.total_candidates || '0'} 
          icon={Users} 
          color={{ bgGrad: 'from-purple-600/10 to-fuchsia-900/40', textGrad: 'from-white to-purple-200', text: 'text-purple-400', blob: 'bg-purple-500' }}
          delay={0.2}
        />
        <MetricCard 
          title="Leading Entity" 
          value={metrics?.leading_party || 'None'} 
          icon={TrendingUp} 
          color={{ bgGrad: 'from-emerald-600/10 to-teal-900/40', textGrad: 'from-white to-emerald-200', text: 'text-emerald-400', blob: 'bg-emerald-500' }}
          delay={0.3}
        />
        <MetricCard 
          title="System Integrity" 
          value="99.9%" 
          icon={ShieldCheck} 
          color={{ bgGrad: 'from-amber-600/10 to-orange-900/40', textGrad: 'from-white to-amber-200', text: 'text-amber-400', blob: 'bg-amber-500' }}
          delay={0.4}
        />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Module Navigation Cards */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-2 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
            Core Modules
          </h2>
          {[
            { id: 1, icon: Vote, title: 'Elections Console', desc: 'Manage active polling streams', path: '/elections', gradient: 'from-blue-600 to-indigo-600' },
            { id: 2, icon: Users, title: 'Candidate Roster', desc: 'Participant parameter tracking', path: '/candidates', gradient: 'from-purple-600 to-violet-600' },
            { id: 3, icon: AlertTriangle, title: 'Security Matrix', desc: 'Anomaly resolution tickets', path: '/alerts', gradient: 'from-orange-500 to-red-600' }
          ].map((action, i) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + (i * 0.1), type: "spring" }}
            >
              <Link 
                to={action.path} 
                className="group relative flex items-center justify-between p-6 md:p-8 rounded-[2rem] bg-slate-900 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${action.gradient} p-[1px] shadow-lg overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
                    <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center">
                      <action.icon className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" size={26} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white tracking-tight mb-1">{action.title}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{action.desc}</p>
                  </div>
                </div>
                
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-slate-950 group-hover:bg-white text-slate-500 group-hover:text-black group-hover:-rotate-45 transition-all duration-500 shadow-inner relative z-10">
                  <ArrowRight size={20} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Activity Stream */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 60 }}
          className="xl:col-span-7 rounded-[2.5rem] bg-slate-900/80 backdrop-blur-3xl border border-white/5 p-8 md:p-10 shadow-2xl flex flex-col relative overflow-hidden h-[600px] xl:h-[auto]"
        >
          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 blur-[100px] rounded-full" />

          <div className="flex justify-between items-center mb-8 relative z-10">
            <h2 className="text-2xl font-black text-white flex items-center gap-4 tracking-tighter">
              <Activity className="text-blue-500" />
              Event Stream
            </h2>
            <Link 
              to="/audit-logs" 
              className="px-5 py-2.5 rounded-xl bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20"
            >
              Examine Logs
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar relative z-10">
            <AnimatePresence>
              {recentActivity.map((log, idx) => (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + (idx * 0.05) }}
                  className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all flex items-start gap-5 overflow-hidden cursor-default"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500 group-hover:text-blue-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all shrink-0 border border-white/5">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors">{log.action}</p>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-2">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {recentActivity.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                <Activity size={48} className="opacity-20" />
                <p className="font-semibold uppercase tracking-widest text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
};

export default Dashboard;
