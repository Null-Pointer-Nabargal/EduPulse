import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import {
  Search,
  Star,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export const CourseCatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  useEffect(() => {
    fetch(getApiUrl('/api/courses/categories'))
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch(() => {});
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (selectedCategory) query.set('category', selectedCategory);
    if (selectedLevel) query.set('level', selectedLevel);
    query.set('sort', sortBy);
    query.set('page', page.toString());
    query.set('limit', '9');

    fetch(getApiUrl(`/api/courses?${query.toString()}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourses(data.data.courses);
          setPagination(data.data.pagination);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [search, selectedCategory, selectedLevel, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSortBy('popular');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Explore Course Catalog</h1>
        <p className="text-sm text-slate-400">Discover hand-crafted courses designed for software engineers, product designers, and AI specialists.</p>
      </div>

      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, keywords, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-brand-500 text-sm text-slate-100 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-500"
            >
              <option value="popular">Sort: Most Popular</option>
              <option value="newest">Sort: Newest First</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
            </select>

            {(search || selectedCategory || selectedLevel) && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </form>

        <div className="flex items-center space-x-2 overflow-x-auto pt-2 scrollbar-none">
          <button
            onClick={() => { setSelectedCategory(''); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === ''
                ? 'bg-brand-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4 pt-1 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Level:</span>
          {['', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => { setSelectedLevel(lvl); setPage(1); }}
              className={`capitalize hover:text-white transition-colors ${
                selectedLevel === lvl ? 'text-brand-400 font-bold underline underline-offset-4' : ''
              }`}
            >
              {lvl === '' ? 'All Levels' : lvl.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-4">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No courses match your filter criteria</h3>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
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
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs text-slate-400 font-semibold">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
