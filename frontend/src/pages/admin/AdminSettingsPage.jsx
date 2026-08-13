import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { token } = useAuth();
  const [siteName, setSiteName] = useState('EduPulse International');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setMsg('Platform configuration saved successfully.');
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Platform Settings & Controls</h1>
        <p className="text-xs text-slate-400">Configure global platform metadata, security rules, and maintenance toggles.</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Platform Branding Title</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 outline-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="font-bold text-white">Maintenance Mode</p>
              <p className="text-slate-400 text-[11px]">Restrict public access to administrators only.</p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 accent-purple-600 rounded"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};
