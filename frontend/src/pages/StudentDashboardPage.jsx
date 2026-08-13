import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import {
  BookOpen,
  CheckCircle2,
  Award,
  Play,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const StudentDashboardPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(getApiUrl('/api/enrollments/my-courses'), {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch(getApiUrl('/api/certificates/my-certificates'), {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([enrData, certData]) => {
        if (enrData.success) setEnrolledCourses(enrData.data);
        if (certData.success) setCertificates(certData.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 mt-4">Loading student dashboard...</p>
      </div>
    );
  }

  const activeCourses = enrolledCourses.filter((c) => c.progressPercentage < 100);
  const completedCourses = enrolledCourses.filter((c) => c.progressPercentage >= 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-brand-950/40 to-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/50 shadow-xl"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Continue your learning journey and achieve your professional engineering goals.</p>
          </div>
        </div>

        <Link
          to="/courses"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition-all"
        >
          Explore Catalog
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-brand-400">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-500">Enrolled</span>
          </div>
          <p className="text-2xl font-bold text-white">{enrolledCourses.length}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
          </div>
          <p className="text-2xl font-bold text-white">{activeCourses.length}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-white">{completedCourses.length}</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <Award className="w-5 h-5" />
            <span className="text-xs font-semibold text-slate-500">Certificates</span>
          </div>
          <p className="text-2xl font-bold text-white">{certificates.length}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Currently Learning</h2>
        {activeCourses.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 space-y-3">
            <p className="text-sm font-semibold text-white">No active courses in progress</p>
            <Link to="/courses" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCourses.map((item) => (
              <div key={item.enrollmentId} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="flex space-x-4">
                  <img
                    src={item.course.thumbnail}
                    alt={item.course.title}
                    className="w-24 h-20 rounded-xl object-cover border border-slate-700"
                  />
                  <div className="space-y-1 flex-1">
                    <h3 className="font-bold text-white text-sm line-clamp-1">{item.course.title}</h3>
                    <p className="text-xs text-slate-400">{item.totalLessons} Lessons Total</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Course Progress</span>
                    <span className="text-brand-300 font-bold">{item.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.progressPercentage}%` }}
                    />
                  </div>
                </div>

                <Link
                  to={`/player/${item.course._id}`}
                  className="w-full py-2.5 rounded-xl bg-brand-600/20 text-brand-300 border border-brand-500/30 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-brand-300" /> Resume Learning
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
