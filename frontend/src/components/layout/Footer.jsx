import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Globe } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Edu<span className="text-brand-400">Pulse</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              EduPulse is a premier global online learning ecosystem providing certified software development, artificial intelligence, product design, and cloud architecture education.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified EdTech SaaS Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Explore Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/courses" className="hover:text-brand-400 transition-colors">Course Marketplace</Link></li>
              <li><Link to="/courses?category=web-development" className="hover:text-brand-400 transition-colors">Web Development</Link></li>
              <li><Link to="/courses?category=data-science-ai" className="hover:text-brand-400 transition-colors">Data Science & AI</Link></li>
              <li><Link to="/courses?category=ui-ux-design" className="hover:text-brand-400 transition-colors">UI/UX Design Systems</Link></li>
            </ul>
          </div>

          {/* Student Hub */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Learner Hub</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/dashboard" className="hover:text-brand-400 transition-colors">Student Dashboard</Link></li>
              <li><Link to="/certificate/verify/EDUPULSE-DEMO-CERT-2026" className="hover:text-brand-400 transition-colors">Certificate Verification</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Account Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-400 transition-colors">Student Registration</Link></li>
            </ul>
          </div>

          {/* Admin & Security */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Administration</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/admin" className="hover:text-brand-400 transition-colors text-purple-400">Admin Control Dashboard</Link></li>
              <li><span className="text-slate-500">Security Audit Logs (Admin)</span></li>
              <li><span className="text-slate-500">API Health: Online</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} EduPulse Inc. All rights reserved. Production SaaS Edition.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> English (US)
            </span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
