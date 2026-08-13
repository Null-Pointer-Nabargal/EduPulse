import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart3,
  Users,
  BookOpen,
  ShieldCheck,
  Settings,
  LogOut,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Access Denied (403 Forbidden)</h1>
        <p className="text-xs text-slate-400 max-w-md">
          You do not have Administrator permissions. Admin routes are protected by server-side authorization guards.
        </p>
        <Link to="/" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Learner Site
        </Link>
      </div>
    );
  }

  const navItems = [
    { label: 'Analytics Dashboard', path: '/admin', icon: BarChart3 },
    { label: 'Course Management', path: '/admin/courses', icon: BookOpen },
    { label: 'User Administration', path: '/admin/users', icon: Users },
    { label: 'Security Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/90 flex flex-col justify-between shrink-0">
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" /> Back to Learner Portal
            </Link>

            <div className="flex items-center space-x-3 pt-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Admin Hub</h2>
                <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
                  SaaS Control
                </span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-purple-500/40"
              />
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-purple-300">Administrator</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};
