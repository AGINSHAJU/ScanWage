import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanEntry from './pages/ScanEntry';
import EmployeeManagement from './pages/EmployeeManagement';
import Layout from './components/Layout';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <Router>
      <div key={user?.id || 'guest'}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
          
          <Route element={user ? <Layout user={user} setUser={setUser} /> : <Navigate to="/login" />}>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/scans" element={<ScanEntry user={user} />} />
            <Route path="/employees" element={<EmployeeManagement user={user} />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
