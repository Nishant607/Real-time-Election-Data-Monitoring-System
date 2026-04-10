import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, Clock, ArrowRight, Search, Download } from 'lucide-react';
import { alertService } from '../services/api';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../services/AuthContext';

const AlertsList = () => {
  const { isAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await alertService.getAll();
        setAlerts(res.data);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();

    const alertsSub = supabase.channel('alerts-list-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => fetchAlerts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(alertsSub);
    };
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Scanning Integrity Protocols...</p>
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
            Security Alerts <span className="text-orange-500">.</span>
          </h1>
          <p className="text-slate-400 max-w-lg">
            Automated anomaly detection system. {isAdmin ? 'Investigate and resolve flagged incidents below.' : 'View real-time system integrity status.'}
          </p>
        </div>
        
        {isAdmin && (
          <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="relative z-50"
          >
            <button 
              onClick={() => window.location.href = '/export-alerts/'}
              className="px-10 py-4 rounded-2xl bg-orange-500 text-white font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-orange-600 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)] shadow-2xl"
            >
              <Download size={20} />
              Download History
            </button>
          </motion.div>
        )}
      </motion.header>

      <div className="space-y-6">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-20 text-center border-emerald-500/20 bg-emerald-500/5"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Perimeter Secure</h3>
              <p className="text-slate-500 max-w-sm mx-auto">All election data streams are currently verified and operating within normal parameters.</p>
            </motion.div>
          ) : (
            alerts.map((alert, index) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="glass-panel overflow-hidden flex group relative"
              >
                {/* Severity Indicators */}
                <div className={`w-1.5 shrink-0 ${alert.status === 'Active' ? 'bg-gradient-to-b from-orange-500 to-red-600' : 'bg-emerald-500'}`}></div>
                
                <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-1">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      alert.status === 'Active' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {alert.status === 'Active' ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                        alert.status === 'Active' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {alert.status}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                        <Clock size={12} />
                        {new Date(alert.created_at).toLocaleString()}
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">
                      Suspicious Activity Identified
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <p className="text-slate-500">
                        Candidate: <span className="text-slate-200 font-bold">{alert.anomaly?.candidate_name || 'N/A'}</span>
                      </p>
                      <div className="w-[1px] h-3 bg-white/10" />
                      <p className="text-slate-500">
                        Vector: <span className="text-blue-400 font-mono italic">{alert.anomaly?.reason || "Growth Spike"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">System Risk</p>
                      <p className="text-sm font-bold text-slate-300">Statistical Anomaly Detected</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end">
                    {isAdmin ? (
                      <Link 
                        to={`/alerts/investigate/${alert.id}`}
                        className="group/btn flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-800 border border-white/5 text-white font-bold hover:bg-blue-600 hover:border-blue-500 transition-all shadow-xl hover:shadow-blue-600/20"
                      >
                        Action <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest bg-slate-800/20 px-4 py-2 rounded-xl">
                        <Clock size={14} /> Monitoring
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default AlertsList;
