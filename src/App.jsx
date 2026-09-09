import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage';
import AdminPage from './pages/AdminPage';
import MaintenancePage from './pages/MaintenancePage';
import ToastProvider from './components/common/Toast';
import { ThemeProvider } from './context/ThemeContext';
import supabase from './lib/supabase';

const MaintenanceGuard = ({ children }) => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'maintenance')
          .maybeSingle();

        setIsMaintenance(!!data?.value?.isActive);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    checkMaintenance();
  }, [location.pathname]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center font-mono text-sm"
        style={{ backgroundColor: 'var(--bg-color)', color: 'var(--accent)' }}
      >
        <i className="fas fa-circle-notch fa-spin text-2xl mr-3"></i>
        Loading DE Education...
      </div>
    );
  }

  // If maintenance is on and not accessing /admin, redirect to /maintenance
  if (isMaintenance && !location.pathname.startsWith('/admin')) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
};

export const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Routes>
          {/* Admin Routes - Strictly accessed at /admin without public navigation */}
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/admin" element={<AdminPage />} />

          {/* Maintenance Screen */}
          <Route path="/maintenance" element={<MaintenancePage />} />

          {/* Public Routes with Unique Bookmarkable URLs */}
          <Route
            path="/"
            element={
              <MaintenanceGuard>
                <MainPage tab="home" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/papers"
            element={
              <MaintenanceGuard>
                <MainPage tab="papers" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/papers/:stream"
            element={
              <MaintenanceGuard>
                <MainPage tab="papers" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/papers/:stream/:subjectSlug"
            element={
              <MaintenanceGuard>
                <MainPage tab="papers" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/papers/:stream/:subjectSlug/:year"
            element={
              <MaintenanceGuard>
                <MainPage tab="papers" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/results"
            element={
              <MaintenanceGuard>
                <MainPage tab="results" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/timetables"
            element={
              <MaintenanceGuard>
                <MainPage tab="timetables" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/notices"
            element={
              <MaintenanceGuard>
                <MainPage tab="notices" />
              </MaintenanceGuard>
            }
          />
          <Route
            path="/apps"
            element={
              <MaintenanceGuard>
                <MainPage tab="apps" />
              </MaintenanceGuard>
            }
          />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
