import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Play,
  FileText,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Menu,
  X,
  Award,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

export const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const videoRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [progressRecords, setProgressRecords] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('LESSON');
  const [activeQuiz, setActiveQuiz] = useState(null);

  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    Promise.all([
      fetch(`/api/courses/detail/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch(`/api/progress/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([courseRes, progressRes]) => {
        if (courseRes.success) {
          setCourse(courseRes.data.course);
        }
        if (progressRes.success) {
          const map = {};
          progressRes.data.progressRecords.forEach((pr) => {
            map[pr.lessonId] = pr;
          });
          setProgressRecords(map);
          setOverallProgress(progressRes.data.overallProgressPercentage || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [courseId, token, user, navigate]);

  const currentSection = course?.sections[currentSectionIdx];
  const currentLesson = currentSection?.lessons[currentLessonIdx];
  const currentLessonProgress = currentLesson ? progressRecords[currentLesson._id] : null;

  useEffect(() => {
    if (activeTab === 'LESSON' && currentLesson?.contentType === 'VIDEO' && videoRef.current && currentLessonProgress?.videoPositionSeconds) {
      videoRef.current.currentTime = currentLessonProgress.videoPositionSeconds;
    }
  }, [currentLesson, activeTab, currentLessonProgress]);

  const handleTimeUpdate = () => {
    if (videoRef.current && currentLesson) {
      const pos = Math.floor(videoRef.current.currentTime);
      if (pos % 5 === 0 && pos > 0) {
        fetch('/api/progress/video-position', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            courseId: course._id,
            lessonId: currentLesson._id,
            videoPositionSeconds: pos,
          }),
        }).catch(() => {});
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    const isCompleted = !(currentLessonProgress?.isCompleted);

    try {
      const res = await fetch('/api/progress/mark-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: course._id,
          lessonId: currentLesson._id,
          isCompleted,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProgressRecords((prev) => ({
          ...prev,
          [currentLesson._id]: {
            ...prev[currentLesson._id],
            isCompleted: data.data.isCompleted,
          },
        }));
        setOverallProgress(data.data.overallProgressPercentage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextLesson = () => {
    if (!currentSection) return;
    if (currentLessonIdx < currentSection.lessons.length - 1) {
      setCurrentLessonIdx(currentLessonIdx + 1);
      setActiveTab('LESSON');
    } else if (currentSectionIdx < course.sections.length - 1) {
      setCurrentSectionIdx(currentSectionIdx + 1);
      setCurrentLessonIdx(0);
      setActiveTab('LESSON');
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIdx > 0) {
      setCurrentLessonIdx(currentLessonIdx - 1);
      setActiveTab('LESSON');
    } else if (currentSectionIdx > 0) {
      const prevSec = course.sections[currentSectionIdx - 1];
      setCurrentSectionIdx(currentSectionIdx - 1);
      setCurrentLessonIdx(prevSec.lessons.length - 1);
      setActiveTab('LESSON');
    }
  };

  const loadQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setActiveTab('QUIZ');
    setQuizResult(null);
    setQuizAnswers({});

    fetch(`/api/quizzes/${course._id}/${quiz._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQuizData(data.data.quiz);
        }
      });
  };

  const handleQuizOptionSelect = (questionId, optionIdx) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    setSubmittingQuiz(true);
    const answersPayload = Object.keys(quizAnswers).map((qId) => ({
      questionId: qId,
      selectedOptionIndex: quizAnswers[qId],
    }));

    try {
      const res = await fetch(`/api/quizzes/${course._id}/${quizData._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers: answersPayload }),
      });
      const data = await res.json();
      if (data.success) {
        setQuizResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Link to="/dashboard" className="mt-4 px-4 py-2 bg-brand-600 rounded-xl text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between text-slate-200">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="border-l border-slate-800 pl-4">
            <h1 className="text-sm font-bold text-white line-clamp-1">{course.title}</h1>
            <p className="text-[11px] text-slate-400">
              Module {currentSectionIdx + 1}: {currentSection?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-3 text-xs">
            <span className="text-slate-400">Progress: <strong className="text-brand-400">{overallProgress}%</strong></span>
            <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {overallProgress >= 100 && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg"
            >
              <Award className="w-4 h-4" /> Certificate Ready
            </Link>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto">
          {activeTab === 'LESSON' && currentLesson ? (
            <div className="flex-1 flex flex-col">
              <div className="bg-black aspect-video max-h-[520px] relative flex items-center justify-center">
                {currentLesson.contentType === 'VIDEO' ? (
                  <video
                    ref={videoRef}
                    src={currentLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                    controls
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full p-8 bg-slate-900 flex flex-col justify-center max-w-3xl mx-auto space-y-4">
                    <FileText className="w-12 h-12 text-indigo-400" />
                    <h2 className="text-2xl font-bold text-white">{currentLesson.title}</h2>
                  </div>
                )}
              </div>

              <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                    <p className="text-xs text-slate-400 mt-1">Section {currentSectionIdx + 1} • Lesson {currentLessonIdx + 1}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleMarkComplete}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        currentLessonProgress?.isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${currentLessonProgress?.isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                      {currentLessonProgress?.isCompleted ? 'Completed' : 'Mark as Complete'}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handlePrevLesson}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNextLesson}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {currentLesson.textContent && (
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {currentLesson.textContent}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'QUIZ' && quizData ? (
            <div className="p-6 max-w-3xl mx-auto w-full space-y-6 py-10">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Module Quiz</span>
                    <h2 className="text-2xl font-extrabold text-white">{quizData.title}</h2>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Passing: {quizData.passingScore}%
                  </span>
                </div>

                {quizResult ? (
                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl border text-center space-y-2 ${
                      quizResult.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}>
                      <h3 className="text-xl font-bold">
                        {quizResult.passed ? '🎉 Congratulations! You Passed' : '❌ Quiz Not Passed'}
                      </h3>
                      <p className="text-3xl font-extrabold">{quizResult.score}% Score</p>
                    </div>

                    <button
                      onClick={() => setQuizResult(null)}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 text-white font-semibold rounded-xl text-xs"
                    >
                      <RotateCcw className="w-4 h-4" /> Retake Quiz
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {quizData.questions.map((q, qIdx) => (
                      <div key={q._id} className="space-y-3 pt-4 border-t border-slate-800/80 first:border-none first:pt-0">
                        <p className="text-sm font-semibold text-white">{qIdx + 1}. {q.questionText}</p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <label
                              key={optIdx}
                              className={`flex items-center space-x-3 p-3.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                                quizAnswers[q._id] === optIdx
                                  ? 'bg-brand-600/20 border-brand-500 text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q._id}`}
                                checked={quizAnswers[q._id] === optIdx}
                                onChange={() => handleQuizOptionSelect(q._id, optIdx)}
                                className="accent-brand-500"
                              />
                              <span>{opt.text}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <button
                      disabled={submittingQuiz}
                      onClick={handleSubmitQuiz}
                      className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                    >
                      {submittingQuiz ? 'Evaluating Results...' : 'Submit Answers'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-400">Select a lesson to begin.</div>
          )}
        </div>

        {sidebarOpen && (
          <aside className="w-80 border-l border-slate-800 bg-slate-900/90 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-slate-800 bg-slate-950 font-bold text-xs text-white uppercase tracking-wider">
              Course Content Outline
            </div>

            <div className="divide-y divide-slate-800/80">
              {course.sections.map((sec, sIdx) => (
                <div key={sec._id || sIdx} className="p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300">
                    Module {sIdx + 1}: {sec.title}
                  </h3>

                  <div className="space-y-1">
                    {sec.lessons.map((les, lIdx) => {
                      const isCompleted = progressRecords[les._id]?.isCompleted;
                      const isActive = activeTab === 'LESSON' && currentSectionIdx === sIdx && currentLessonIdx === lIdx;

                      return (
                        <button
                          key={les._id}
                          onClick={() => {
                            setCurrentSectionIdx(sIdx);
                            setCurrentLessonIdx(lIdx);
                            setActiveTab('LESSON');
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                            isActive
                              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : les.contentType === 'VIDEO' ? (
                              <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="truncate">{les.title}</span>
                          </div>
                        </button>
                      );
                    })}

                    {sec.quizzes?.map((quiz) => (
                      <button
                        key={quiz._id}
                        onClick={() => loadQuiz(quiz)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          activeTab === 'QUIZ' && activeQuiz?._id === quiz._id
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                            : 'text-amber-400/80 hover:text-amber-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">{quiz.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
