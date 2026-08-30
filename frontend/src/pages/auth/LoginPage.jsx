import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  GraduationCap,
  Users,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@campusledger.edu');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.success) {
        // Redirect to role dashboard
        navigate(`/${data.user.role}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const data = await login(demoEmail, demoPassword);
      if (data.success) {
        navigate(`/${data.user.role}/dashboard`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/25 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            CampusLedger Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Academic & Student Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-7 rounded-2xl border border-slate-800 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusledger.edu"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Switchers */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant 1-Click Role Testing</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@campusledger.edu', 'Admin123!')}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 group-hover:text-rose-300">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Full Control & Audit</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('dr.sharma@campusledger.edu', 'Teacher123!')}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Teacher</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Attendance & Grades</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.morgan@campusledger.edu', 'Student123!')}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">CGPA & Razorpay Fee</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('parent.morgan@campusledger.edu', 'Parent123!')}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>Parent</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">Multi-Child Portal</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-slate-500 text-xs mt-6">
          CampusLedger Academic Operating System • v1.0.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
