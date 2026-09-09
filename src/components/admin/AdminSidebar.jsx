import React, { useState } from 'react';
import Icons from '../common/Icons';
import { SUPER_ADMIN_EMAILS, SUPER_ADMIN_IMG } from '../../config/constants';

export const AdminSidebar = ({
  activeSection,
  setActiveSection,
  currentUser,
  onLogout,
  isOpen,
  onToggle
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const isSuperAdmin = currentUser && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard, group: 'overview' },
    { id: 'papers', label: 'Past Papers', icon: Icons.FolderOpen, group: 'management' },
    { id: 'subjects', label: 'Subjects', icon: Icons.BookOpen, group: 'management', superOnly: true },
    { id: 'calendar', label: 'Smart Calendar', icon: Icons.Calendar, group: 'management' },
    { id: 'timetables', label: 'Exam Schedules', icon: Icons.FileText, group: 'management' },
    { id: 'notices', label: 'Announcements', icon: Icons.Bell, group: 'management' },
    { id: 'settings', label: 'App Config', icon: Icons.Settings, group: 'settings' },
    { id: 'users', label: 'Team Access', icon: Icons.Users, group: 'settings', superOnly: true }
  ];

  const handleNav = (id) => {
    setActiveSection(id);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  const userAvatar = isSuperAdmin ? SUPER_ADMIN_IMG : null;
  const displayName = currentUser?.name || (isSuperAdmin ? 'Isara Dilnuka' : 'Administrator');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#0c101a] border-r lg:border border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl lg:shadow-xl lg:my-3 lg:ml-3 lg:rounded-3xl lg:h-[calc(100vh-1.5rem)] h-full overflow-hidden shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 pb-3.5 shrink-0 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20 border border-white/10">
                DE
              </div>
              <div>
                <h2 className="font-heading font-bold text-base text-white leading-tight">
                  DE Admin
                </h2>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide inline-block mt-0.5">
                  PRO CONTROL
                </span>
              </div>
            </div>

            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close Sidebar"
            >
              <Icons.X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Area (min-h-0 enables proper flex scrolling without pushing footer out) */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 py-3 space-y-4">
          {/* Overview Group */}
          <div>
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              Overview
            </p>
            <div className="space-y-1">
              {navItems
                .filter((i) => i.group === 'overview' && (!i.superOnly || isSuperAdmin))
                .map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={isActive ? 'text-emerald-400' : 'text-gray-400'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Management Group */}
          <div>
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              Management
            </p>
            <div className="space-y-1">
              {navItems
                .filter((i) => i.group === 'management' && (!i.superOnly || isSuperAdmin))
                .map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={isActive ? 'text-emerald-400' : 'text-gray-400'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* System Settings Group */}
          <div>
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              System Settings
            </p>
            <div className="space-y-1">
              {navItems
                .filter((i) => i.group === 'settings' && (!i.superOnly || isSuperAdmin))
                .map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                          : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className={isActive ? 'text-emerald-400' : 'text-gray-400'} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* User Profile Footer (Cleanly pinned at bottom with zero overflow) */}
        <div className="shrink-0 p-3 border-t border-white/10 bg-[#090d15]/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/5">
            <div className="relative shrink-0 w-9 h-9">
              {/* Always visible monogram fallback */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white font-bold flex items-center justify-center text-xs shadow-md border border-emerald-500/40 select-none">
                {initials || 'ID'}
              </div>
              {/* Image overlaid only if valid and not broken */}
              {userAvatar && !avatarError && (
                <img
                  src={userAvatar}
                  alt="Avatar"
                  className="absolute inset-0 w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shadow-sm"
                  onError={() => setAvatarError(true)}
                  style={{ display: avatarError ? 'none' : 'block' }}
                />
              )}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0c101a] rounded-full z-10"></span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate leading-snug">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <p className="text-[10px] text-emerald-400 font-semibold truncate">
                  {isSuperAdmin ? 'Super Admin' : 'Editor'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to sign out of the Admin Portal?')) {
                  onLogout();
                }
              }}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-red-500/15 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20 shrink-0"
              title="Sign Out of Admin"
              aria-label="Sign Out"
            >
              <Icons.LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
