import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Wallet, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [selectedEmployeeIndex, setSelectedEmployeeIndex] = useState(0);
  const [showPersonWage, setShowPersonWage] = useState(false);

  const handleForceSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await api.post('/sheets/sync/');
      setSyncStatus({ type: 'success', message: res.data.message || 'Sync completed successfully!' });
      // Refresh stats to ensure any state is fresh
      const statsRes = await api.get(`/dashboard/?_t=${new Date().getTime()}`);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Manual sync failed', err);
      const errMsg = err.response?.data?.message || 'Synchronization failed. Please check backend logs.';
      setSyncStatus({ type: 'error', message: errMsg });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(`/dashboard/?_t=${new Date().getTime()}`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    const totalEmployees = stats?.employee_breakdown?.length || 0;
    if (totalEmployees === 0) {
      setSelectedEmployeeIndex(0);
      return;
    }

    setSelectedEmployeeIndex((currentIndex) => Math.min(currentIndex, totalEmployees - 1));
  }, [stats?.employee_breakdown?.length]);

  if (loading) return (
    <div className="p-8 animate-pulse space-y-8">
      <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>)}
      </div>
    </div>
  );

  const isAdmin = stats?.is_admin ?? (user?.role === 'Admin' || user?.role === 'admin');
  const employeeBreakdown = stats?.employee_breakdown || [];
  const selectedEmployee = employeeBreakdown[selectedEmployeeIndex];
  const employeeCount = employeeBreakdown.length;
  const teamWageAmount = isAdmin && employeeCount > 0
    ? employeeBreakdown.reduce((total, employee) => total + Number(employee.salary || 0), 0)
    : stats?.shared_salary_estimate;
  const activeWageAmount = showPersonWage
    ? (isAdmin && selectedEmployee ? selectedEmployee.salary : stats?.personal_salary_estimate)
    : teamWageAmount;
  const activeWageTitle = showPersonWage ? 'Person Wage' : 'Team Wage';
  const activeWageDescription = showPersonWage
    ? (isAdmin && selectedEmployee ? `${selectedEmployee.name} personal payout` : 'Your personal payout')
    : 'Total team payout';

  const showPreviousEmployee = () => {
    if (!employeeCount) return;
    setSelectedEmployeeIndex((currentIndex) => (currentIndex - 1 + employeeCount) % employeeCount);
  };

  const showNextEmployee = () => {
    if (!employeeCount) return;
    setSelectedEmployeeIndex((currentIndex) => (currentIndex + 1) % employeeCount);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400">Welcome,</p>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md text-sm font-bold border border-emerald-500/20">
              {stats?.authenticated_username || user?.username}
            </span>
          </div>
        </div>
        <div className="px-4 py-2 glass border border-white/10 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium">{stats?.current_month}</span>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(140px,auto)]">
        
        {/* KPI Card: Personal Scans */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="lg:col-span-1 glass-card p-6 flex flex-col justify-between border-emerald-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400 font-black uppercase tracking-tighter">Your Scans</span>
          </div>
          <div>
            <h3 className="text-3xl font-black mt-4 text-white">{stats?.individual_scans?.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Personal Total this month</p>
          </div>
        </motion.div>

        {/* KPI Card: Wage Switch */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="lg:col-span-3 glass-card p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-transparent flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-emerald-400 font-black uppercase tracking-widest">{activeWageTitle}</span>
              <p className="text-[10px] text-emerald-400/60 mt-1 uppercase font-bold italic">{activeWageDescription}</p>
            </div>
            <label className="cursor-pointer relative h-[3em] w-[6em] rounded-full bg-[hsl(0,0%,7%)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-gray-800 shrink-0 block text-[10px] sm:text-xs">
              <input
                type="checkbox"
                className="sr-only"
                checked={showPersonWage}
                onChange={(event) => setShowPersonWage(event.target.checked)}
                aria-label="Switch between team wage and person wage"
              />
              <div 
                className={`absolute top-[0.25em] flex h-[2.5em] w-[2.5em] items-center justify-center rounded-full shadow-md transition-all duration-300 pointer-events-none ${showPersonWage ? 'bg-emerald-400' : 'bg-gray-200'}`}
                style={{ left: showPersonWage ? '3.25em' : '0.25em' }}
              >
                 <div className="h-[1em] w-[1em] rounded-full bg-gray-900 flex items-center justify-center">
                    <div className="h-[2px] w-[0.4em] bg-gray-500 rounded-full"></div>
                 </div>
              </div>
            </label>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mt-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-black tracking-widest text-emerald-300 mb-3">
                Showing: {showPersonWage ? 'Person' : 'Team'}
              </div>
              <h3 className="text-4xl font-black text-white">&#8377;{activeWageAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              {isAdmin && showPersonWage && selectedEmployee && (
                <p className="text-sm text-gray-400 mt-2">
                  {selectedEmployee.scans.toLocaleString()} scans this month
                </p>
              )}
            </div>
            {isAdmin && showPersonWage && selectedEmployee ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={showPreviousEmployee}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Previous employee"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 text-center">
                  <p className="text-white font-bold truncate max-w-[180px]">{selectedEmployee.name}</p>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Person {selectedEmployeeIndex + 1} of {employeeCount}</p>
                </div>
                <button
                  type="button"
                  onClick={showNextEmployee}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Next employee"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="hidden md:block text-right">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-bold uppercase">
                  {showPersonWage ? 'Private' : 'Group'}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Big Performance Chart / Stats Widget */}
        <div className="md:col-span-2 lg:col-span-3 lg:row-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">{isAdmin ? 'Team Monthly Progress' : 'Your Monthly Progress'}</h3>
            <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium bg-emerald-400/10 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>+{stats?.progress_percentage}% Ahead of last month</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats?.progress_percentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
              ></motion.div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Target reached: <span className="text-white font-bold">{stats?.progress_percentage}%</span></span>
              <span className="text-gray-500">Remaining: <span className="text-white font-bold">{100 - stats?.progress_percentage}%</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Target Scans (Month)</p>
                <p className="text-lg font-bold text-emerald-400">{stats?.target_scans?.toLocaleString()}</p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Remaining Scans</p>
                <p className="text-lg font-bold text-amber-400">{stats?.remaining_scans?.toLocaleString()}</p>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-500 mb-1">Required per day</p>
                <p className="text-lg font-bold text-emerald-400">{stats?.required_scans_per_day?.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Side Info Card: Required Actions */}
        <div className="lg:col-span-1 glass-card p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold">Status</h3>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/10">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-200/70">Ensure all Sunday entries are verified manually.</p>
            </div>
            {isAdmin && (
              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
                <p className="text-xs text-emerald-300 font-bold mb-2">ADMIN ACTION</p>
                <p className="text-sm">You have 2 pending employee approvals.</p>
                <button className="mt-3 text-xs font-bold text-white bg-emerald-500 px-3 py-2 rounded-lg hover:bg-emerald-600 transition-colors">Review Now</button>
              </div>
            )}
          </div>
        </div>

        {/* Google Sheets Synchronization Card (Admins Only) */}
        {isAdmin && stats?.google_sheets_sync && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="lg:col-span-1 glass-card p-6 flex flex-col justify-between border-green-500/20"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Google Sheets
                </h3>
                {stats.google_sheets_sync.is_configured ? (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Linked
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    No Config
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                {stats.google_sheets_sync.is_configured 
                  ? "Real-time database mirroring is active. Local additions, updates, and deletes sync instantly."
                  : "Database mirroring is inactive. Set credentials and spreadsheet ID in the backend environment."}
              </p>

              {stats.google_sheets_sync.is_configured && stats.google_sheets_sync.sheet_url && (
                <a 
                  href={stats.google_sheets_sync.sheet_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold mb-4 transition-colors"
                >
                  View Connected Sheet
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            {stats.google_sheets_sync.is_configured && (
              <div>
                <button
                  onClick={handleForceSync}
                  disabled={syncing}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all ${
                    syncing 
                      ? 'bg-white/5 border border-white/10 cursor-not-allowed text-gray-500'
                      : 'bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] border border-green-500/20'
                  }`}
                >
                  <svg 
                    className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                  </svg>
                  {syncing ? 'Synchronizing...' : 'Force Full Sync'}
                </button>
                {syncStatus && (
                  <p className={`text-[10px] text-center mt-2 font-semibold ${
                    syncStatus.type === 'success' ? 'text-green-400' : 'text-rose-400'
                  }`}>
                    {syncStatus.message}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
        
        {/* Employee Breakdown List for Admins */}
        {isAdmin && stats?.employee_breakdown && (
          <div className="md:col-span-2 lg:col-span-4 glass-card p-6 mt-2">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" /> 
              Employee Earnings Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="pb-3 px-4 font-medium">Employee Name</th>
                    <th className="pb-3 px-4 font-medium">Monthly Scans</th>
                    <th className="pb-3 px-4 font-medium">Estimated Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.employee_breakdown.map((emp, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-white font-medium">{emp.name}</td>
                      <td className="py-4 px-4 text-gray-300">{emp.scans.toLocaleString()}</td>
                      <td className="py-4 px-4 text-emerald-400 font-bold">₹{emp.salary.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                  ))}
                  {stats.employee_breakdown.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-6 text-gray-500 text-sm">No employee data available for this month.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;