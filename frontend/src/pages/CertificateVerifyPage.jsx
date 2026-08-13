import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import { ShieldCheck, Download, GraduationCap, XCircle } from 'lucide-react';

export const CertificateVerifyPage = () => {
  const { certificateId } = useParams();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(getApiUrl(`/api/certificates/verify/${certificateId}`))
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCertData(data.data);
        } else {
          setCertData(null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [certificateId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400 mt-4">Verifying certificate credentials...</p>
      </div>
    );
  }

  if (!certData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Unverified Certificate Code</h2>
        <Link to="/" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Platform Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 gap-4">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-emerald-300">Verified Authentic EduPulse Certificate</h2>
            <p className="text-xs text-emerald-400/80">Issued by {certData.issuer}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-emerald-300 bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-500/40">
          ID: {certData.certificateCode}
        </span>
      </div>

      <div className="glass-panel p-8 sm:p-14 rounded-3xl border-2 border-brand-500/30 shadow-2xl relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-center space-y-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/30">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold text-brand-400">Certificate of Completion</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">EduPulse Learning Academy</h1>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-brand-300 border-b border-slate-800 pb-4 inline-block px-8">
          {certData.studentName}
        </h2>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 max-w-xl mx-auto">
          <p className="font-extrabold text-white text-base sm:text-lg">{certData.courseTitle}</p>
          <p className="text-xs text-slate-400 mt-1">Difficulty: {certData.courseLevel} • Instructor: {certData.instructorName}</p>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg transition-all"
        >
          <Download className="w-4 h-4" /> Download / Print Certificate PDF
        </button>
      </div>
    </div>
  );
};
