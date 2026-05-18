import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Calendar, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return (
    <div className="p-8 animate-pulse space-y-8">
      <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white/5 rounded-2xl"></div>)}
      </div>
    </div>
  );

  const isAdmin = stats?.is_admin ?? (user?.role === 'Admin' || user?.role === 'admin');

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400">Welcome,</p>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-md text-sm font-bold border border-blue-500/20">
              {stats?.authenticated_username || user?.username}
            </span>
          </div>
        </div>
        <div className="px-4 py-2 glass border border-white/10 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">{stats?.current_month}</span>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(140px,auto)]">
        
        {/* KPI Card: Personal Scans */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="lg:col-span-1 glass-card p-6 flex flex-col justify-between border-blue-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-400 font-black uppercase tracking-tighter">Your Scans</span>
          </div>
          <div>
            <h3 className="text-3xl font-black mt-4 text-white">{stats?.individual_scans?.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Personal Total this month</p>
          </div>
        </motion.div>

        {/* KPI Card: Personal Salary */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="lg:col-span-2 glass-card p-6 border-emerald-500/30 bg-gradient-to-br from-emerald-600/10 to-transparent flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-400 font-black uppercase tracking-widest">Your Personal Earnings</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-4xl font-black mt-4 text-white">&#8377;{stats?.personal_salary_estimate?.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-400/60 mt-1 uppercase font-bold italic">Calculated from your scans only</p>
            </div>
            <div className="hidden md:block text-right">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-[10px] font-bold uppercase">Private</span>
            </div>
          </div>
        </motion.div>
        {isAdmin && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="lg:col-span-1 glass-card p-6 flex flex-col justify-between border-white/5 opacity-60"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-gray-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Team Share</span>
            </div>
            <div>
              <h3 className="text-xl font-bold mt-4 text-gray-300">&#8377;{stats?.shared_salary_estimate?.toLocaleString()}</h3>
              <p className="text-[10px] text-gray-500 mt-1 uppercase">Collective Team Payout</p>
            </div>
          </motion.div>
        )}

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
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-purple-500 to-emerald-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
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
                <p className="text-lg font-bold text-blue-400">{stats?.target_scans?.toLocaleString()}</p>
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
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                <p className="text-xs text-blue-300 font-bold mb-2">ADMIN ACTION</p>
                <p className="text-sm">You have 2 pending employee approvals.</p>
                <button className="mt-3 text-xs font-bold text-white bg-blue-500 px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors">Review Now</button>
              </div>
            )}
          </div>
        </div>
        
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

