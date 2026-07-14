import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, History, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import api from '../api';

const ScanEntry = ({ user }) => {
  const [scans, setScans] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    employee: '',
    scan_count: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scansRes, employeesRes] = await Promise.all([
        api.get('/scans/'),
        api.get('/employees/')
      ]);
      setScans(scansRes.data);
      setEmployees(employeesRes.data);
      
      // Default to the current logged in employee if available
      const currentEmp = employeesRes.data.find(e => e.user === user.id);
      if (currentEmp) {
        setForm(f => ({ ...f, employee: currentEmp.id }));
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/scans/', form);
      setMessage({ type: 'success', text: 'Scan entry recorded successfully!' });
      setForm({ ...form, scan_count: '' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to record scan entry.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.delete(`/scans/${id}/`);
      fetchData();
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  if (loading) return <div className="p-8 animate-pulse">Loading...</div>;

  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-white">Daily Scan Log</h1>
        <p className="text-gray-400 mt-1">Record and manage daily scan counts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 glass p-6 h-fit"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold">New Entry</h2>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isAdmin ? (
              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase font-bold ml-1">Employee</label>
                <select
                  value={form.employee}
                  onChange={(e) => setForm({ ...form, employee: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-emerald-500/50"
                  required
                >
                  <option value="" disabled className="bg-[#0b0e14]">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id} className="bg-[#0b0e14]">
                      {emp.name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-4">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Logging for</p>
                <p className="font-bold">{user.username}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase font-bold ml-1">Scan Count</label>
              <input
                type="number"
                value={form.scan_count}
                onChange={(e) => setForm({ ...form, scan_count: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-emerald-500/50"
                placeholder="e.g. 2250"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase font-bold ml-1">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-3 outline-none focus:border-emerald-500/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl font-bold transition-all disabled:opacity-50 mt-4"
            >
              {submitting ? 'Saving...' : 'Submit Entry'}
            </button>
          </form>
        </motion.div>

        {/* History Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 glass p-6 overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <History className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold">Recent History</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase">
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold">Employee</th>
                  <th className="pb-3 font-bold text-right">Scans</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {scans.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500 italic">No entries found.</td>
                  </tr>
                ) : (
                  scans.map((scan) => {
                    const empName = employees.find(e => e.id === scan.employee)?.name || 'Unknown';
                    return (
                      <tr key={scan.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                        <td className="py-4 text-gray-300">{scan.date}</td>
                        <td className="py-4">
                          <span className="font-medium text-white">{empName}</span>
                        </td>
                        <td className="py-4 text-right font-mono text-emerald-400 font-bold">{scan.scan_count.toLocaleString()}</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleDelete(scan.id)}
                            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ScanEntry;
