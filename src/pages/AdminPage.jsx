import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminAuthModal from '../components/admin/AdminAuthModal';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardView from '../components/admin/DashboardView';
import PapersManager from '../components/admin/PapersManager';
import SubjectsManager from '../components/admin/SubjectsManager';
import CalendarManager from '../components/admin/CalendarManager';
import TimetablesManager from '../components/admin/TimetablesManager';
import NoticesManager from '../components/admin/NoticesManager';
import SettingsManager from '../components/admin/SettingsManager';
import UsersManager from '../components/admin/UsersManager';
import BackgroundEffects from '../components/common/BackgroundEffects';
import Icons from '../components/common/Icons';
import supabase from '../lib/supabase';
import { SUPER_ADMIN_EMAILS } from '../config/constants';

export const AdminPage = () => {
  // Persistent admin session in localStorage & sessionStorage (never logs out on refresh)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('de_admin_user') || sessionStorage.getItem('de_admin_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
      console.error('Session parse error:', e);
      return null;
    }
  });

  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loginPolicy, setLoginPolicy] = useState('choice');

  // Keep storage continuously preserved
  useEffect(() => {
    if (currentUser) {
      try {
        const safeUser = { ...currentUser };
        delete safeUser.face_descriptors;
        const json = JSON.stringify(safeUser);
        localStorage.setItem('de_admin_user', json);
        sessionStorage.setItem('de_admin_user', json);
      } catch (e) {
        console.error('Session write error:', e);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      document.title = 'Admin Authorization | DE Education';
    } else {
      const sectionName = activeSection.charAt(0).toUpperCase() + activeSection.slice(1);
      document.title = `${sectionName} | DE Admin Portal`;
    }
  }, [currentUser, activeSection]);

  useEffect(() => {
    // Load current authentication policy
    const fetchPolicy = async () => {
      try {
        const { data } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'login_policy')
          .maybeSingle();
        if (data?.value?.method) {
          setLoginPolicy(data.value.method);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPolicy();
  }, []);

  const handleLoginSuccess = (user) => {
    const safeUser = { ...user };
    delete safeUser.face_descriptors;
    setCurrentUser(safeUser);
    try {
      const json = JSON.stringify(safeUser);
      localStorage.setItem('de_admin_user', json);
      sessionStorage.setItem('de_admin_user', json);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('de_admin_user');
      sessionStorage.removeItem('de_admin_user');
    } catch (e) {
      console.error(e);
    }
  };

  const isSuper = currentUser && SUPER_ADMIN_EMAILS.includes(currentUser.email?.toLowerCase());

  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col font-sans relative overflow-x-hidden">
      <BackgroundEffects />

      {/* If Not Logged In, Show Auth Modal */}
      {!currentUser ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <AdminAuthModal
            onLoginSuccess={handleLoginSuccess}
            loginPolicy={loginPolicy}
          />
          <Link
            to="/"
            className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all"
          >
            <Icons.ArrowLeft size={14} />
            <span>Back to DE Education Portal</span>
          </Link>
        </div>
      ) : (
        /* Logged In: Full Admin Workspace */
        <div className="flex h-screen overflow-hidden relative">
          <AdminSidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            currentUser={currentUser}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Main Dashboard Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative w-full h-full bg-black/60 custom-scrollbar">
            {/* Mobile Header Bar */}
            <div className="lg:hidden flex justify-between items-center px-6 py-4 bg-black/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/10 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-300 active:scale-95 transition-transform"
                  aria-label="Open Sidebar"
                >
                  <Icons.Menu size={20} />
                </button>
                <span className="font-heading font-bold text-lg text-white">DE Admin</span>
              </div>
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-glow">
                DE
              </div>
            </div>

            {/* Top Desktop Navigation Utilities */}
            <div className="hidden lg:flex justify-between items-center px-8 pt-6 pb-2 max-w-7xl mx-auto">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <Icons.Home size={12} /> Student Portal
                </Link>
                <span>/</span>
                <span className="text-white capitalize">{activeSection}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                  <i className="fas fa-shield-alt mr-1"></i>
                  {isSuper ? 'Super Admin Mode' : 'Editor Access'}
                </span>
                <Link
                  to="/"
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors flex items-center gap-1"
                >
                  <Icons.ExternalLink size={12} /> View Live Site
                </Link>
              </div>
            </div>

            {/* View Switching with unified section animation */}
            <div className="p-4 md:p-8 lg:p-8 max-w-7xl mx-auto">
              <div key={activeSection} className="section-animate">
                {activeSection === 'dashboard' && <DashboardView />}
                {activeSection === 'papers' && <PapersManager />}
                {activeSection === 'subjects' && isSuper && <SubjectsManager />}
                {activeSection === 'calendar' && <CalendarManager />}
                {activeSection === 'timetables' && <TimetablesManager />}
                {activeSection === 'notices' && <NoticesManager />}
                {activeSection === 'settings' && (
                  <SettingsManager onPolicyChange={setLoginPolicy} />
                )}
                {activeSection === 'users' && isSuper && <UsersManager />}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
