import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Vote, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  LogOut,
  ShieldCheck,
  Loader2,
  UserPlus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './services/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import ElectionsHub from './pages/ElectionsHub';
import CandidateRoster from './pages/CandidateRoster';
import AlertsList from './pages/AlertsList';
import AnalyticsCenter from './pages/AnalyticsCenter';
import ReportsHub from './pages/ReportsHub';
import AlertInvestigation from './pages/AlertInvestigation';
import AuditLogs from './pages/AuditLogs';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import CreateAccount from './pages/CreateAccount';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <Loader2 className="text-blue-500 animate-spin z-10" size={48} />
        <p className="mt-4 text-blue-300/50 text-sm font-semibold tracking-widest uppercase z-10">Initializing Core</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const NavigationLink = ({ item }) => {
  const isExternal = item.path.startsWith('/admin');
  const baseClass = "group relative flex items-center gap-3 px-4 py-3.5 my-1 rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden";
  
  if (isExternal) {
    return (
      <div
        onClick={() => window.location.href = item.path}
        className={`${baseClass} text-slate-400 hover:text-white`}
      >
        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors duration-500" />
        <item.icon size={22} className="relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(255,255,255,0)] group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
        <span className="relative z-10 font-medium tracking-wide">{item.name}</span>
      </div>
    );
  }

  return (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        `${baseClass} ${
          isActive 
            ? 'text-white' 
            : 'text-slate-400 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/0 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
          {isActive && (
            <motion.div 
              layoutId="activeTab"
              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(56,189,248,0.7)]" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          <item.icon size={22} className={`relative z-10 transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)] text-blue-400' : 'group-hover:scale-110'}`} />
          <span className={`relative z-10 font-medium tracking-wide transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>{item.name}</span>
        </>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Elections', path: '/elections', icon: Vote },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Create Account', path: '/create-account', icon: UserPlus, adminOnly: false },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck, adminOnly: true },
    { name: 'Admin Panel', path: '/admin/', icon: ShieldCheck, adminOnly: true },
    { name: 'Login', path: '/login', icon: ShieldCheck, hideIfAuth: true }
  ];

  return (
    <motion.div 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="w-[280px] h-screen fixed left-0 top-0 bg-[#020617]/80 backdrop-blur-3xl border-r border-white/5 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col pt-8 pb-8 overflow-y-auto"
    >
      {/* Brand area */}
      <div className="flex items-center gap-4 px-8 mb-12 relative group cursor-default">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:shadow-[0_0_30px_rgba(56,189,248,0.6)] transition-all overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8L3N2Zz4=')] opacity-50 mix-blend-overlay" />
          <ShieldCheck className="text-white relative z-10" size={22} />
        </div>
        <div className="relative">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400 tracking-tight">
            Monitor
          </h2>
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col px-4 relative z-10">
        <p className="px-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-4">Operations Menu</p>
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'Admin') return null;
          if (item.hideIfAuth && user) return null;
          return <NavigationLink key={item.path} item={item} />;
        })}
      </nav>

      {/* User profile area */}
      <div className="px-6 mt-auto relative z-10">
        {user ? (
          <div className="p-4 rounded-3xl bg-slate-900 border border-white/5 shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-0.5 shadow-lg group-hover:border-blue-500/50 transition-colors">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-blue-400 font-black text-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                <p className="text-[10px] font-semibold tracking-widest text-emerald-400 uppercase flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                  {user?.role}
                </p>
              </div>
            </div>

            <button 
              onClick={logout}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all cursor-pointer font-semibold text-xs tracking-wider uppercase relative z-10"
            >
              <LogOut size={16} />
              <span>Disconnect</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-slate-900 border border-white/5 shadow-inner flex flex-col gap-3">
             <p className="text-xs text-slate-400 font-bold text-center">Guest Session Active</p>
             <NavLink to="/login" className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest text-center transition-all">
                Login
             </NavLink>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Universal Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-[280px] w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -translate-x-1/3 translate-y-1/3" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <Sidebar />
      
      <main className="flex-1 h-screen overflow-y-auto ml-[280px] relative z-10 custom-scrollbar">
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto min-h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                
                <Route path="/create-account" element={
                  <CreateAccount />
                } />
                
                <Route path="/elections" element={
                  <ProtectedRoute>
                    <ElectionsHub />
                  </ProtectedRoute>
                } />
                
                <Route path="/candidates" element={
                  <ProtectedRoute>
                    <CandidateRoster />
                  </ProtectedRoute>
                } />
                
                <Route path="/alerts" element={
                  <ProtectedRoute>
                    <AlertsList />
                  </ProtectedRoute>
                } />
                
                <Route path="/alerts/investigate/:id" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AlertInvestigation />
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsCenter />
                  </ProtectedRoute>
                } />
                
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <ReportsHub />
                  </ProtectedRoute>
                } />

                <Route path="/audit-logs" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AuditLogs />
                  </ProtectedRoute>
                } />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
