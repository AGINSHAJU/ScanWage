import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Search, Edit2, Trash2, X, Check, Shield } from 'lucide-react';
import api from '../api';

const EmployeeManagement = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    employee_id: '',
    role: 'Employee',
    status: 'Active',
    base_salary: 800
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees/');
      setEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingId(emp.id);
      setForm({
        name: emp.name,
        employee_id: emp.employee_id,
        role: emp.role,
        status: emp.status,
        base_salary: emp.base_salary
      });
    } else {
      setEditingId(null);
      setForm({
        name: '',
        employee_id: '',
        role: 'Employee',
        status: 'Active',
        base_salary: 800
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}/`, form);
      } else {
        await api.post('/employees/', form);
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert('Failed to save employee data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}/`);
      fetchEmployees();
    } catch (err) {
      alert('Failed to delete employee.');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 animate-pulse">Loading...</div>;

  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Employee Management</h1>
          <p className="text-gray-400 mt-1">Manage staff profiles and access roles.</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Employee</span>
          </button>
        )}
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass p-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-bold text-white">{filteredEmployees.length}</span> Total Employees
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <motion.div 
            layout
            key={emp.id}
            className="glass-card p-6 flex flex-col gap-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-xl text-gray-300">
                  {emp.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{emp.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{emp.employee_id}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                emp.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              }`}>
                {emp.role}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm py-4 border-y border-white/5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                <span className="text-gray-400">{emp.status}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Base Salary</p>
                <p className="font-bold">₹{emp.base_salary}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {isAdmin ? (
                <>
                  <button 
                    onClick={() => handleOpenModal(emp)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                    title="Edit Employee"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Delete Employee"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> View Only
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg glass p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white">
                  <X />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500/50"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Employee ID</label>
                    <input
                      type="text"
                      value={form.employee_id}
                      onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500/50"
                      placeholder="EMP-001"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Base Salary</label>
                    <input
                      type="number"
                      value={form.base_salary}
                      onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500/50"
                      placeholder="800"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500/50"
                    >
                      <option value="Employee" className="bg-[#0b0e14]">Employee</option>
                      <option value="Manager" className="bg-[#0b0e14]">Manager</option>
                      <option value="Admin" className="bg-[#0b0e14]">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500 uppercase font-bold ml-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500/50"
                    >
                      <option value="Active" className="bg-[#0b0e14]">Active</option>
                      <option value="Inactive" className="bg-[#0b0e14]">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
                  >
                    {editingId ? 'Update Profile' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeManagement;
