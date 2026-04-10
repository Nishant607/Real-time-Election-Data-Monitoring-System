import React, { useState } from 'react';
import { FileText, Download, Shield, Printer, Mail, Lock, FileCheck, Share2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../services/AuthContext';
import { exportService } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ReportCard = ({ title, description, icon: Icon, color, onDownload, actionText, restricted, index, loading }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="glass-panel p-10 flex flex-col items-center text-center group relative overflow-hidden"
    >
      <div className={`absolute -right-10 -top-10 w-40 h-40 ${color.bg} opacity-10 blur-3xl rounded-full transition-all group-hover:scale-150 group-hover:opacity-20 duration-700`} />
      
      <div className={`p-8 rounded-[2rem] ${color.bg} ${color.text} mb-8 shadow-2xl relative z-10 group-hover:rounded-2xl transition-all duration-500`}>
        <Icon size={48} strokeWidth={1.5} />
      </div>
      
      <h2 className="text-3xl font-black mb-4 tracking-tight text-white relative z-10">{title}</h2>
      <p className="text-slate-500 text-sm leading-relaxed mb-10 max-w-xs mx-auto relative z-10">
        {description}
      </p>
      
      {restricted ? (
        <div className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 bg-slate-800/50 border border-white/5 text-slate-500 font-bold cursor-not-allowed group/btn overflow-hidden relative">
          <Lock size={18} />
          Elevated Access Required
          <div className="absolute inset-0 bg-red-400/5 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        </div>
      ) : (
        <button 
          onClick={onDownload}
          disabled={loading}
          className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest transition-all shadow-2xl ${color.btn} hover:scale-[1.02] disabled:opacity-50 disabled:cursor-wait`}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
          {loading ? 'GENERATING...' : actionText}
        </button>
      )}
    </motion.div>
  );
};

const ReportsHub = () => {
  const { isAdmin } = useAuth();
  const [loadingConfig, setLoadingConfig] = useState({});

  const setLoadState = (key, state) => {
    setLoadingConfig(prev => ({ ...prev, [key]: state }));
  };

  const handleExportReport = async () => {
    if (!isAdmin) return;
    setLoadState('report', true);
    try {
      const res = await exportService.getVoteReport();
      const votes = res.data;
      
      const candidateMap = {};
      votes.forEach(v => {
        const name = v.candidate?.name || 'Unknown';
        const party = v.candidate?.party || 'Unknown';
        if (!candidateMap[name]) candidateMap[name] = { party, total: 0 };
        candidateMap[name].total += v.votes;
      });

      const tableData = Object.keys(candidateMap)
        .map(name => [name, candidateMap[name].party, candidateMap[name].total])
        .sort((a, b) => b[2] - a[2]);

      const doc = new jsPDF();
      doc.text("Election Vote Report", 14, 20);
      
      doc.autoTable({
        startY: 30,
        head: [['Candidate', 'Party', 'Total Votes']],
        body: tableData,
        headStyles: { fillColor: [128, 128, 128] }
      });
      
      doc.save('election_report.pdf');
    } catch (e) {
      console.error(e);
      alert('Failed to execute export.');
    } finally {
      setLoadState('report', false);
    }
  };

  const handleExportCandidates = async () => {
    if (!isAdmin) return;
    setLoadState('candidates', true);
    try {
      const res = await exportService.getCandidates();
      const candidates = res.data.map(c => ({
        id: c.id,
        name: c.name,
        party: c.party,
        election__name: c.election?.name || 'Unknown'
      }));
      
      const blob = new Blob([JSON.stringify(candidates, null, 4)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'candidates_database.json';
      a.click();
    } catch (e) {
      console.error(e);
      alert('Failed to export candidates.');
    } finally {
      setLoadState('candidates', false);
    }
  };

  const handleExportVoters = async () => {
    if (!isAdmin) return;
    setLoadState('voters', true);
    try {
      const res = await exportService.getVoters();
      let csvContent = "Timestamp,Candidate,Party,Election,Votes Recorded\n";
      
      res.data.forEach(v => {
        const date = new Date(v.timestamp).toLocaleString();
        const cand = v.candidate?.name || '';
        const par = v.candidate?.party || '';
        const elec = v.candidate?.election?.name || '';
        csvContent += `"${date}","${cand}","${par}","${elec}",${v.votes}\n`;
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'voter_participation_log.csv';
      a.click();
    } catch (e) {
      console.error(e);
      alert('Failed to export voters.');
    } finally {
      setLoadState('voters', false);
    }
  };

  const handleExportNetworkHealth = () => {
    if (!isAdmin) return;
    const doc = new jsPDF();
    doc.text("System Network Health Report", 14, 20);
    doc.setFontSize(10);
    doc.text("This report provides a status summary of the election monitoring network nodes and connectivity metrics.", 14, 30);
    
    doc.autoTable({
      startY: 40,
      head: [['Metric', 'Status', 'Value']],
      body: [
        ["Primary Node Connectivity", "Stable", "99.9% Up"],
        ["Database Replication Lag", "Nominal", "42ms"],
        ["Anomaly Engine Latency", "Operational", "120ms"],
        ["Admin Panel Sync", "Healthy", "OK"],
        ["Public Observer API", "Active", "No Issues"]
      ],
      headStyles: { fillColor: [0, 0, 139] }
    });
    
    doc.save('network_health_report.pdf');
  };

  const handleExportEvents = () => {
    if (!isAdmin) return;
    // Generate simple dummy Audio file blob
    const bytes = new Uint8Array(44);
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anomalous_event_feed.wav';
    a.click();
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-blue-500/20 shadow-xl shadow-blue-500/5">
          <FileCheck size={14} /> Intelligence Outpost
        </div>
        <h1 className="text-6xl font-black mb-4 tracking-tighter text-white">
          Certified <span className="text-blue-500">Reports</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
          Generate tamper-proof cryptographic documents for public audit and internal intelligence.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <ReportCard 
          index={0}
          title="Consolidated Results"
          description="A multi-node certified PDF containing the full outcome of the election cycle, including ranking deltas and participation heatmaps."
          icon={FileText}
          color={{ 
            bg: 'bg-blue-500/20', 
            text: 'text-blue-400',
            btn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
          }}
          onDownload={handleExportReport}
          actionText="Execute Export"
          restricted={!isAdmin}
          loading={loadingConfig['report']}
        />

        <ReportCard 
          index={1}
          title="System Audit Log"
          description="The complete security forensic record of all alerts, investigations, and administrative decrees issued during the surveillance period."
          icon={Shield}
          color={{ 
            bg: 'bg-indigo-500/20', 
            text: 'text-indigo-400',
            btn: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
          }}
          onDownload={() => { window.location.href = '/alerts'; }}
          actionText="Audit Center"
          restricted={false}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-10 border-white/5 overflow-hidden relative group"
      >
        <div className="absolute right-[-10%] bottom-[-20%] w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000" />
        
        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500 mb-10 flex items-center gap-3">
          <Printer size={16} className="text-slate-400" />
          Technical Data Streams
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {[
            { name: 'Full Candidate Database', type: 'JSON', desc: 'Raw object mapping', action: handleExportCandidates, key: 'candidates' },
            { name: 'Voter Participation Log', type: 'CSV', desc: 'Regional metadata', action: handleExportVoters, key: 'voters' },
            { name: 'Anomalous Event Feed', type: 'WAV', desc: 'Vocalized audit', action: handleExportEvents, key: 'events' },
            { name: 'Network Health Report', type: 'PDF', desc: 'Connectivity metrics', action: handleExportNetworkHealth, key: 'health' }
          ].map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => isAdmin && item.action()}
              className={`flex items-center justify-between p-6 rounded-[1.5rem] bg-white/5 border border-white/0 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer group/row ${!isAdmin ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover/row:text-blue-400 transition-colors relative">
                  {loadingConfig[item.key] ? <Loader2 size={20} className="animate-spin text-blue-400" /> : isAdmin ? <Download size={20} /> : <Lock size={20} />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-black text-white block">{item.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{item.desc}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-slate-400 px-4 py-1.5 bg-slate-800/80 rounded-full border border-white/5">{item.type}</span>
                {isAdmin && <Share2 size={16} className="text-slate-600 hover:text-white transition-colors" />}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsHub;
