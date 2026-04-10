import React, { useState, useEffect } from 'react';
import { activityLogService } from '../services/api';
import { motion } from 'framer-motion';
import { Shield, Clock, Activity, ArrowRight, UserCheck, HardDrive } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await activityLogService.getAll();
        setLogs(res.data);
      } catch (error) {
        console.error("Error fetching activity logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-slate-500/20 border-t-slate-500 rounded-full animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Accessing Audit Vault...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <motion.header
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-5xl font-black mb-3 tracking-tight">
            System Audit <span className="text-slate-500">Logs</span>
          </h1>
          <p className="text-slate-400 max-w-lg font-medium">
            Immutable timeline of all system-level operations, security investigations, and registry modifications.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-4 bg-slate-900/50 px-6 py-4 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md">
           <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Shield size={20} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Integrity</p>
              <p className="text-sm font-black text-white">Secure Audit Trail</p>
           </div>
        </div>
      </motion.header>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 via-slate-800 to-transparent mb-10" />

        <div className="space-y-8 relative z-10">
          {logs.length === 0 ? (
            <div className="glass-panel p-20 text-center ml-20">
               <p className="text-slate-500 font-bold uppercase tracking-widest">No activity recorded in the current vault period.</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-8 group"
              >
                {/* Node */}
                <div className={`w-20 h-20 shrink-0 rounded-[1.5rem] bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:rounded-2xl group-hover:border-blue-500/30 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Activity size={24} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 glass-panel p-8 hover:bg-white/[0.03] transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-slate-800 rounded-lg text-slate-400">
                        <UserCheck size={14} />
                      </span>
                      <h3 className="text-lg font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                        {log.action}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-black/20 px-4 py-2 rounded-full border border-white/5">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-800/50 px-3 py-1.5 rounded-lg">
                      <HardDrive size={12} /> Storage Node Alpha
                    </div>
                    <span className="text-[10px] font-mono text-slate-600">ID: {log.id.toString().padStart(6, '0')}</span>
                    <ArrowRight size={14} className="ml-auto text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
