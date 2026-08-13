import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import {
  Star,
  Clock,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Lock,
  Sparkles,
  X
} from 'lucide-react';

export const CourseDetailPage = () => {
  const { slug } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [totalLessonsCount, setTotalLessonsCount] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);

  useEffect(() => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(getApiUrl(`/api/courses/detail/${slug}`), { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCourse(data.data.course);
          setTotalLessonsCount(data.data.totalLessonsCount);
          setIsEnrolled(data.data.isEnrolled);

          const initialMap = {};
          data.data.course.sections.forEach((sec, idx) => {
            initialMap[idx] = true;
          });
          setOpenSections(initialMap);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug, token]);

  const toggleSection = (idx) => {
    setOpenSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login?redirect=/courses/' + slug);
      return;
    }

    try {
      setEnrolling(true);
      const res = await fetch(getApiUrl('/api/enrollments/enroll'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEnrolled(true);
        navigate(`/player/${course._id}`);
      } else {
        alert(data.error?.message || 'Enrollment failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 mt-4">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Course Not Found</h2>
        <Link to="/courses" className="inline-block px-4 py-2 bg-brand-600 text-white font-semibold rounded-xl text-xs">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <section className="bg-slate-900/80 border-b border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3 text-xs">
                <span className="px-3 py-1 rounded-md bg-brand-500/20 text-brand-300 font-semibold border border-brand-500/30">
                  {course.category?.name}
                </span>
                <span className="px-3 py-1 rounded-md bg-slate-800 text-slate-300 font-semibold uppercase">
                  {course.level}
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400" /> {course.rating} ({course.totalRatingsCount} ratings)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{course.title}</h1>
              <p className="text-slate-300 text-base leading-relaxed">{course.summary}</p>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <img
                    src={course.instructor?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
                    alt={course.instructor?.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span>Created by <strong className="text-white">{course.instructor?.name}</strong></span>
                </div>

                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" /> {Math.round((course.durationSeconds || 3600) / 3600)} Hours Content
                </span>

                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-emerald-400" /> Verified Certificate Included
                </span>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 shadow-2xl">
              <div className="relative aspect-video rounded-xl overflow-hidden group">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => setPreviewVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                  className="absolute inset-0 bg-slate-950/50 flex items-center justify-center group-hover:bg-slate-950/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </button>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-white">${course.price}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">Lifetime Access</span>
              </div>

              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/player/${course._id}`)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" /> Continue Learning
                </button>
              ) : (
                <button
                  disabled={enrolling}
                  onClick={handleEnroll}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Course Overview</h2>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {course.description}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Course Curriculum</h2>
              <span className="text-xs text-slate-400">{course.sections?.length || 0} Modules • {totalLessonsCount} Lessons</span>
            </div>

            <div className="space-y-3">
              {course.sections?.map((section, idx) => (
                <div key={section._id || idx} className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
                  <button
                    onClick={() => toggleSection(idx)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-slate-900/90 text-left hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="font-semibold text-white text-sm">
                      {section.title}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{section.lessons?.length || 0} Lessons</span>
                      {openSections[idx] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {openSections[idx] && (
                    <div className="divide-y divide-slate-800/60 bg-slate-950/40">
                      {section.lessons?.map((lesson) => (
                        <div key={lesson._id} className="px-5 py-3.5 flex items-center justify-between text-xs text-slate-300">
                          <div className="flex items-center space-x-3">
                            {lesson.contentType === 'VIDEO' ? (
                              <Play className="w-4 h-4 text-brand-400" />
                            ) : (
                              <FileText className="w-4 h-4 text-indigo-400" />
                            )}
                            <span className="font-medium text-slate-200">{lesson.title}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            {lesson.isFreePreview ? (
                              <button
                                onClick={() => setPreviewVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')}
                                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30"
                              >
                                Preview
                              </button>
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-slate-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
              <span className="text-sm font-semibold text-white">Sample Lesson Preview</span>
              <button onClick={() => setPreviewVideoUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <video src={previewVideoUrl} controls autoPlay className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
