import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  AlertTriangle, 
  History, 
  User, 
  Activity, 
  CheckCircle, 
  ShieldAlert,
  Save,
  FileBarChart,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { alertService } from '../services/api';
import { motion } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AlertInvestigation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Active');
  const [action, setAction] = useState('flag');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchAlertDetail = async () => {
      try {
        const res = await alertService.getOne(id);
        setAlert(res.data);
        setNote(res.data.verification_note || '');
        setStatus(res.data.status || 'Active');
      } catch (error) {
        console.error("Error fetching alert detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlertDetail();
  }, [id, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await alertService.investigate(id, {
        verification_note: note,
        status: status,
        action: action
      });
      navigate('/alerts');
    } catch (error) {
      console.error("Error submitting investigation:", error);
      alert("Failed to Transmit Decree. Please check the network or refresh. " + (error.response?.data?.detail || error.message));
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-slate-500 font-medium animate-pulse">Extracting Forensics...</p>
    </div>
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link to="/alerts" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors w-fit group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Terminal
        </Link>
      </motion.div>

      <motion.header 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-orange-500/10 rounded-[2rem] flex items-center justify-center text-orange-500 border border-orange-500/20 shadow-2xl shadow-orange-500/10">
            <ShieldAlert size={40} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">Investigation <span className="text-orange-500">#{id.toString().padStart(4, '0')}</span></h1>
            <p className="text-slate-400 text-sm max-w-md">Critical forensic review for voting pattern anomalies and potential system interference.</p>
          </div>
        </div>
        <div className={`px-8 py-3 rounded-2xl border text-xs font-black uppercase tracking-[0.2em] shadow-2xl ${
          status === 'Active' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          {status}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Context */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-10 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10 flex items-center gap-3">
              <User size={14} className="text-blue-500" /> Subject Identity & Metrics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Primary Candidate</p>
                  <p className="text-4xl font-black text-white">{alert.anomaly?.candidate_name || 'Verified Node'}</p>
                </div>
                <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Time Log</p>
                    <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                       <Clock size={16} className="text-blue-500" />
                       {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 p-8 rounded-[2rem] border border-white/5 space-y-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Anomalous Growth Vector</p>
                    <div className="flex items-end gap-3">
                       <p className="text-5xl font-black text-orange-500">+{((alert.anomaly?.current_votes || 0) - (alert.anomaly?.previous_votes || 0)).toLocaleString()}</p>
                       <p className="text-sm font-bold text-slate-500 mb-2 whitespace-nowrap">Surge Units</p>
                    </div>
                 </div>
                 <div className="h-[1px] w-full bg-white/5" />
                 <p className="text-xs text-slate-400 font-medium italic leading-relaxed">
                   "{alert.anomaly?.reason || 'System flagged a non-standard voting acceleration.'}"
                 </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-10"
          >
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-3">
              <Activity size={14} className="text-purple-500" /> Intelligence Delta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               {[
                 { label: 'Base Count', val: alert.anomaly?.previous_votes?.toLocaleString(), icon: History, color: 'slate' },
                 { label: 'Peak Count', val: alert.anomaly?.current_votes?.toLocaleString(), icon: Zap, color: 'orange' },
                 { label: 'Delta %', val: `${((alert.anomaly?.current_votes / (alert.anomaly?.previous_votes || 1) - 1) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'red' }
               ].map((item, i) => (
                 <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">{item.label}</p>
                    <p className={`text-2xl font-black text-${item.color}-400 flex items-center gap-2`}>
                       <item.icon size={20} />
                       {item.val}
                    </p>
                 </div>
               ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Forensic Vote History</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Snapshot Log</span>
                    </div>
                </div>
                <div className="h-48 w-full bg-black/20 rounded-3xl p-6 border border-white/5">
                    <Bar 
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { grid: { display: false }, ticks: { display: false } },
                                x: { grid: { display: false }, ticks: { color: '#475569', font: { size: 8 } } }
                            }
                        }} 
                        data={{
                            labels: alert.vote_history?.map(v => new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) || [],
                            datasets: [{
                                label: 'Votes',
                                data: alert.vote_history?.map(v => v.votes) || [],
                                backgroundColor: 'rgba(56, 189, 248, 0.4)',
                                borderRadius: 4,
                            }]
                        }} 
                    />
                </div>
            </div>
          </motion.div>
        </div>

        {/* Action Panel */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-10 h-fit border-orange-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/20"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">System Decree</h2>
          </div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 text-left block">Investigation Log</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter formal findings..."
                className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-6 text-slate-200 outline-none focus:border-orange-500/50 transition-all resize-none text-sm placeholder:text-slate-700 leading-relaxed shadow-inner"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 text-left block">Decree Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-slate-200 outline-none focus:border-orange-500/50 transition-all text-sm font-bold pr-10 appearance-none shadow-inner"
              >
                <option value="Active">Operational Watch</option>
                <option value="Resolved">Verified Authentic</option>
                <option value="Flagged">Suspected Fraud</option>
              </select>
            </div>

            <div className="p-6 rounded-3xl bg-black/30 border border-white/5 space-y-5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block">Corrective Action</label>
              {[
                { val: 'approve', label: 'Approve Pending Votes (Safe)', color: 'emerald' },
                { val: 'flag', label: 'Escalate to Oversight', color: 'amber' },
                { val: 'reject', label: 'Reject / De-authorize Surge', color: 'red' }
              ].map((opt) => (
                <label key={opt.val} className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-all">
                  <input 
                    type="radio" 
                    name="action" 
                    value={opt.val} 
                    checked={action === opt.val}
                    onChange={() => setAction(opt.val)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    action === opt.val ? `border-${opt.color}-500 bg-${opt.color}-500/20` : 'border-white/10'
                  }`}>
                    {action === opt.val && <div className={`w-2 h-2 rounded-full bg-${opt.color}-500`} />}
                  </div>
                  <span className={`text-xs font-bold transition-colors ${
                    action === opt.val ? `text-${opt.color}-400` : 'text-slate-500 group-hover:text-slate-300'
                  }`}>{opt.label}</span>
                </label>
              ))}
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full flex items-center justify-center gap-3 primary-btn py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl transition-all ${submitting ? 'opacity-50 cursor-wait' : 'hover:scale-[1.02] shadow-orange-500/20 shadow-2xl'}`}
            >
              {submitting ? 'Executing Decree...' : <><Save size={20} /> Transmit Decree</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AlertInvestigation;
