import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/api';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { CourseBuilderModal } from './CourseBuilderModal';

export const AdminCourseManagement = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchCourses = () => {
    setLoading(true);
    fetch(getApiUrl('/api/admin/courses'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCourses(data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(getApiUrl(`/api/admin/courses/${id}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        fetchCourses();
      } else {
        alert(data.error?.message || 'Delete failed.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePublish = async (course) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/courses/${course._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCourses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Course Builder & Catalog Management</h1>
          <p className="text-xs text-slate-400">Design course modules, lessons, video content, resource files, and quizzes.</p>
        </div>

        <button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Course</span>
        </button>
      </div>

      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading course catalog...</div>
      ) : filteredCourses.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
          No courses found. Click "Create New Course" to build your first course.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => {
            let totalLessons = 0;
            let totalQuizzes = 0;
            course.sections?.forEach((s) => {
              totalLessons += s.lessons?.length || 0;
              totalQuizzes += s.quizzes?.length || 0;
            });

            return (
              <div key={course._id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4 flex-1">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-20 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {course.category?.name || 'Category'}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        course.isPublished
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm">{course.title}</h3>
                    <p className="text-xs text-slate-400">
                      {course.sections?.length || 0} Sections • {totalLessons} Lessons • {totalQuizzes} Quizzes • Price: ${course.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      course.isPublished
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(course._id, course.title)}
                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <CourseBuilderModal
          course={editingCourse}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCourses();
          }}
        />
      )}
    </div>
  );
};
