import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
  BarChart,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 mt-4">Loading executive analytics...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-extrabold text-white">Platform Analytics & Performance</h1>
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <p className="text-xs text-slate-400">Live platform telemetry, enrollments, user activity, and completion metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <Users className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Users</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{kpis.totalUsers || 0}</p>
          <p className="text-[10px] text-slate-400">{kpis.activeUsers || 0} Active Accounts</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-brand-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Courses</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{kpis.totalCourses || 0}</p>
          <p className="text-[10px] text-slate-400">{kpis.publishedCourses || 0} Published Online</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Enrollments</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{kpis.totalEnrollments || 0}</p>
          <p className="text-[10px] text-slate-400">Total Student Seats</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <Award className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold text-slate-500">Completion</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{kpis.completionRate || 0}%</p>
          <p className="text-[10px] text-slate-400">{kpis.totalCertificates || 0} Certificates Issued</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Course Offering Distribution by Field</h2>
            <BarChart className="w-4 h-4 text-purple-400" />
          </div>

          <div className="space-y-3 pt-2">
            {data?.categoryStats?.map((cat, idx) => {
              const maxVal = Math.max(...data.categoryStats.map((c) => c.count), 1);
              const percentage = Math.round((cat.count / maxVal) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{cat.name}</span>
                    <span className="font-mono text-purple-300 font-bold">{cat.count} Courses</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2">System Health & Security</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              All backend endpoints, authorization RBAC guards, MongoDB connections, and rate-limiters are operating in production mode.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-semibold text-emerald-400">MongoDB Mongoose</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
              <span className="text-slate-400">Server Authentication:</span>
              <span className="font-semibold text-purple-400">JWT Signed + HTTP Guard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white">Recent Student Enrollments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 rounded-l-lg">Student</th>
                <th className="p-3">Course</th>
                <th className="p-3">Progress</th>
                <th className="p-3 rounded-r-lg">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.recentEnrollments?.map((enr) => (
                <tr key={enr._id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-semibold text-white flex items-center space-x-2">
                    <img
                      src={enr.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80'}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span>{enr.user?.name || 'Student'}</span>
                  </td>
                  <td className="p-3 text-slate-300">{enr.course?.title || 'Course'}</td>
                  <td className="p-3 font-bold text-brand-400">{enr.overallProgressPercentage}%</td>
                  <td className="p-3 text-slate-500">{new Date(enr.enrolledAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
