import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import { GraduationCap, Lock, Mail, ShieldAlert } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        login(data.data.token, data.data.user);
        if (data.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(redirect);
        }
      } else {
        setError(data.error?.message || 'Login failed.');
      }
    } catch (err) {
      setError('Network error. Failed to reach auth server.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestAccount = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-brand-500/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Log in to EduPulse</h1>
        <p className="text-xs text-slate-400">Access your courses, quizzes, and certificates</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="student@edupulse.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">Quick Dev Test Credentials</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillTestAccount('student@edupulse.com', 'Student123!')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-brand-300 font-semibold"
            >
              🎓 Student Demo
            </button>
            <button
              onClick={() => fillTestAccount('admin@edupulse.com', 'Admin123!')}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-purple-300 font-semibold"
            >
              👑 Admin Demo
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 font-semibold hover:underline">
          Register now
        </Link>
      </div>
    </div>
  );
};
