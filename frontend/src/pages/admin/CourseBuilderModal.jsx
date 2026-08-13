import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Plus, Trash2 } from 'lucide-react';

export const CourseBuilderModal = ({ course, onClose, onSuccess }) => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);

  const [title, setTitle] = useState(course?.title || '');
  const [summary, setSummary] = useState(course?.summary || '');
  const [description, setDescription] = useState(course?.description || '');
  const [thumbnail, setThumbnail] = useState(course?.thumbnail || '');
  const [category, setCategory] = useState(course?.category?._id || course?.category || '');
  const [level, setLevel] = useState(course?.level || 'BEGINNER');
  const [price, setPrice] = useState(course?.price !== undefined ? course?.price : 49.99);
  const [isPublished, setIsPublished] = useState(course?.isPublished || false);

  const [sections, setSections] = useState(course?.sections || [
    {
      title: 'Section 1: Introduction & Fundamentals',
      orderIndex: 1,
      lessons: [
        {
          title: 'Lesson 1.1: Architecture Overview',
          contentType: 'VIDEO',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          videoDurationSeconds: 600,
          textContent: 'Welcome to this lesson!',
          isFreePreview: true,
          orderIndex: 1,
          resources: [],
        },
      ],
      quizzes: [],
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/courses/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
          if (!category && data.data.length > 0) {
            setCategory(data.data[0]._id);
          }
        }
      });
  }, []);

  const addSection = () => {
    setSections([
      ...sections,
      {
        title: `Section ${sections.length + 1}: New Module`,
        orderIndex: sections.length + 1,
        lessons: [],
        quizzes: [],
      },
    ]);
  };

  const removeSection = (sIdx) => {
    setSections(sections.filter((_, idx) => idx !== sIdx));
  };

  const addLesson = (sIdx) => {
    const updated = [...sections];
    updated[sIdx].lessons.push({
      title: `Lesson ${updated[sIdx].lessons.length + 1}: New Topic`,
      contentType: 'VIDEO',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      videoDurationSeconds: 300,
      textContent: '',
      isFreePreview: false,
      orderIndex: updated[sIdx].lessons.length + 1,
      resources: [],
    });
    setSections(updated);
  };

  const removeLesson = (sIdx, lIdx) => {
    const updated = [...sections];
    updated[sIdx].lessons.splice(lIdx, 1);
    setSections(updated);
  };

  const addQuiz = (sIdx) => {
    const updated = [...sections];
    updated[sIdx].quizzes.push({
      title: `Module ${sIdx + 1} Quiz`,
      passingScore: 70,
      attemptLimit: 3,
      timeLimitMinutes: 15,
      questions: [
        {
          questionText: 'Sample assessment question?',
          explanation: 'Helpful explanation of the correct choice.',
          options: [
            { text: 'Option A (Correct)', isCorrect: true },
            { text: 'Option B', isCorrect: false },
          ],
          orderIndex: 1,
        },
      ],
    });
    setSections(updated);
  };

  const removeQuiz = (sIdx, qIdx) => {
    const updated = [...sections];
    updated[sIdx].quizzes.splice(qIdx, 1);
    setSections(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !summary || !description || !thumbnail || !category) {
      setError('Please fill in all required course information fields.');
      return;
    }

    setSaving(true);
    const payload = {
      title,
      summary,
      description,
      thumbnail,
      category,
      level,
      price: Number(price),
      isPublished,
      sections,
    };

    try {
      const url = course ? `/api/admin/courses/${course._id}` : '/api/admin/courses';
      const method = course ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.error?.message || 'Failed to save course.');
      }
    } catch (err) {
      setError('Network error saving course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <h2 className="text-base font-extrabold text-white">
            {course ? 'Edit Course & Curriculum' : 'Course Builder Wizard'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-8 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">1. General Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
                >
                  <option value="BEGINNER">BEGINNER</option>
                  <option value="INTERMEDIATE">INTERMEDIATE</option>
                  <option value="ADVANCED">ADVANCED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="pub"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
                <label htmlFor="pub" className="text-xs font-bold text-emerald-400 cursor-pointer">
                  Publish Immediately
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Thumbnail Image URL *</label>
              <input
                type="text"
                required
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Summary *</label>
              <input
                type="text"
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description *</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3.5 py-2.5 outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">2. Modules, Lessons & Quizzes Builder</h3>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 border border-purple-500/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add Section Module
              </button>
            </div>

            <div className="space-y-6">
              {sections.map((sec, sIdx) => (
                <div key={sIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => {
                        const updated = [...sections];
                        updated[sIdx].title = e.target.value;
                        setSections(updated);
                      }}
                      className="bg-slate-900 border border-slate-800 text-xs font-bold text-purple-300 rounded-lg px-3 py-1.5 outline-none flex-1 max-w-md"
                    />

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => addLesson(sIdx)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30"
                      >
                        + Add Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => addQuiz(sIdx)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      >
                        + Add Quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSection(sIdx)}
                        className="text-rose-400 p-1 hover:bg-rose-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                    {sec.lessons.map((les, lIdx) => (
                      <div key={lIdx} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={les.title}
                            onChange={(e) => {
                              const updated = [...sections];
                              updated[sIdx].lessons[lIdx].title = e.target.value;
                              setSections(updated);
                            }}
                            className="bg-slate-950 border border-slate-800 text-xs text-white rounded px-2.5 py-1 flex-1 max-w-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeLesson(sIdx, lIdx)}
                            className="text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all"
            >
              {saving ? 'Saving Course...' : 'Save Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
