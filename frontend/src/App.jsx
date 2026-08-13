import React from 'react';
import { BrowserRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { CourseCatalogPage } from './pages/CourseCatalogPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { CoursePlayerPage } from './pages/CoursePlayerPage';
import { CertificateVerifyPage } from './pages/CertificateVerifyPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminCourseManagement } from './pages/admin/AdminCourseManagement';
import { AdminUserManagement } from './pages/admin/AdminUserManagement';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Main Layout Wrapper for Student Web App
const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// 404 Not Found Page
const NotFoundPage = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center space-y-4">
    <h1 className="text-6xl font-extrabold text-brand-500">404</h1>
    <h2 className="text-xl font-bold text-white">Page Not Found</h2>
    <p className="text-xs text-slate-400">The requested page does not exist or has been moved.</p>
    <Link to="/" className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
      Return Home
    </Link>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Learner Marketplace & LMS Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="courses" element={<CourseCatalogPage />} />
            <Route path="courses/:slug" element={<CourseDetailPage />} />
            <Route path="dashboard" element={<StudentDashboardPage />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            <Route path="certificate/verify/:certificateId" element={<CertificateVerifyPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Standalone LMS Course Player */}
          <Route path="/player/:courseId" element={<CoursePlayerPage />} />

          {/* Separate Admin Application Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCourseManagement />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
