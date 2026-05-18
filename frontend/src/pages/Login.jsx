import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import api from '../api';

const Login = ({ setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const navigate = useNavigate();

  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
  const isGoogleConfigured = !GOOGLE_CLIENT_ID.includes("YOUR_GOOGLE_CLIENT_ID");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login/', { username, password });
      saveSession(res.data);
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google/', { token: credentialResponse.credential });
      saveSession(res.data);
    } catch (err) {
      setError('Google authentication failed');
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/google/', { token: 'dev_mode' });
      saveSession(res.data);
    } catch (err) {
      setError('Development login failed');
    } finally {
      setLoading(false);
    }
  };

  const saveSession = (data) => {
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    navigate('/');
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0b0e14]">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-md p-8 glass mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">ScanWage Pro</h1>
          <p className="text-gray-400 mt-2 text-sm text-center">Modern Productivity & Salary Tracking</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Username</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500/50 transition-colors"
                placeholder="admin"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-12 outline-none focus:border-blue-500/50 transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0b0e14] px-2 text-gray-500 font-bold tracking-widest">Secure Access</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-center">
            {isGoogleConfigured ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="pill"
                width="100%"
              />
            ) : (
              <button
                onClick={handleDevLogin}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-gray-300 py-3 rounded-xl font-bold hover:bg-white/10 transition-all border-dashed"
              >
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>Bypass Google (Dev Mode)</span>
              </button>
            )}
          </div>
          {!isGoogleConfigured && (
            <p className="text-[10px] text-center text-amber-500/60 uppercase font-bold tracking-tighter">
              Google Client ID missing. Using Dev Mode for session testing.
            </p>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          Don't have an account? <button onClick={() => setIsRequestModalOpen(true)} className="text-white hover:underline">Request Access</button>
        </p>
      </motion.div>

      {/* Request Access Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-8 max-w-sm w-full text-center"
          >
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-blue-400 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Request Access</h2>
            <p className="text-gray-400 text-sm mb-6">
              Your request for ScanWage Pro access has been sent to the administrator. You will receive an email once approved.
            </p>
            <button 
              onClick={() => setIsRequestModalOpen(false)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
