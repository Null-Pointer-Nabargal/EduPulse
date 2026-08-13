import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Star,
  CheckCircle,
  Play,
  Clock,
  Search
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchKey, setSearchKey] = useState('');

  useEffect(() => {
    fetch('/api/courses?limit=3&sort=popular')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCourses(data.data.courses);
      })
      .catch(() => {});

    fetch('/api/courses/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchKey.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchKey.trim())}`);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Next-Gen SaaS Online Education Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Master In-Demand Skills With{' '}
              <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                World-Class Courses
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed font-normal">
              Accelerate your engineering, AI, and design career with hands-on projects, real-world LMS course players, interactive quizzes, and verified certificates.
            </p>

            <form onSubmit={handleHeroSearch} className="pt-4 max-w-xl mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="What do you want to learn today? (e.g. Full Stack, AI, Figma)"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 text-slate-100 placeholder-slate-500 text-sm rounded-2xl pl-12 pr-32 py-4 shadow-2xl transition-all outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Server-Side Progress Syncing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Verified Certificate ID System
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Embedded LMS Quiz Engine
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl glass-panel border border-slate-800">
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-white">50,000+</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Learners</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-brand-400">120+</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Expert Courses</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-purple-400">99.4%</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Satisfaction Rate</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-3xl font-extrabold text-emerald-400">15,000+</p>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Certificates Issued</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Top Learning Categories</h2>
            <p className="text-sm text-slate-400 mt-1">Explore specialized career paths tailored for today's Tech industry.</p>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/courses?category=${cat.slug}`}
              className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 group cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">{cat.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Production Courses</h2>
            <p className="text-sm text-slate-400 mt-1">Industry-proven courses built by principal tech leaders.</p>
          </div>
          <Link to="/courses" className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Browse Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course._id} className="glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
              <div className="relative aspect-video">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-brand-300 uppercase tracking-wider border border-slate-700">
                  {course.level}
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-950/90 text-xs font-bold text-white border border-slate-800">
                  ${course.price}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2">
                    <span className="text-brand-400 font-semibold">{course.category?.name}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating} ({course.totalRatingsCount})
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base line-clamp-2 hover:text-brand-300 transition-colors">
                    <Link to={`/courses/${course.slug}`}>{course.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{course.summary}</p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img
                      src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={course.instructor?.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs text-slate-300">{course.instructor?.name}</span>
                  </div>

                  <Link
                    to={`/courses/${course.slug}`}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-600/20 text-brand-300 hover:bg-brand-600/30 border border-brand-500/30 transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 border border-brand-500/30 p-8 sm:p-12 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-3xl font-extrabold text-white">Ready to elevate your engineering career?</h2>
            <p className="text-slate-300 text-sm">Join thousands of students building real-world projects today. Start learning with our production catalog.</p>
          </div>
          <Link
            to="/register"
            className="whitespace-nowrap px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 shadow-xl transition-all hover:scale-105"
          >
            Create Student Account
          </Link>
        </div>
      </section>

    </div>
  );
};
