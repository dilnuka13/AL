import React, { useState, useEffect } from 'react';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { useToast } from '../common/Toast';

export const SettingsManager = ({ onPolicyChange }) => {
  // Authentication Policy
  const [authPolicy, setAuthPolicy] = useState('choice');

  // Maintenance Settings
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceEnd, setMaintenanceEnd] = useState('');

  // Global Alert Settings
  const [alertActive, setAlertActive] = useState(false);
  const [alertDate, setAlertDate] = useState('');
  const [alertMsg, setAlertMsg] = useState('');

  // App Version Control
  const [apps, setApps] = useState([]);
  const [appPlatform, setAppPlatform] = useState('android');
  const [appVersion, setAppVersion] = useState('');
  const [appLink, setAppLink] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadAllSettings();
    loadApps();
  }, []);

  const loadAllSettings = async () => {
    try {
      // 1. Auth Policy
      const { data: policyData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'login_policy')
        .maybeSingle();
      if (policyData?.value?.method) {
        setAuthPolicy(policyData.value.method);
      }

      // 2. Maintenance
      const { data: maintData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'maintenance')
        .maybeSingle();
      if (maintData?.value) {
        setIsMaintenance(!!maintData.value.isActive);
        setMaintenanceEnd(maintData.value.endTime || '');
      }

      // 3. Global Alert
      const { data: alertData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'system_update')
        .maybeSingle();
      if (alertData?.value) {
        setAlertActive(!!alertData.value.active);
        setAlertDate(alertData.value.date || '');
        setAlertMsg(alertData.value.message || '');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadApps = async () => {
    try {
      const { data, error } = await supabase
        .from('app_downloads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setApps(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAuthPolicy = async () => {
    try {
      const { error } = await supabase.from('system_settings').upsert({
        key: 'login_policy',
        value: { method: authPolicy }
      });
      if (error) throw error;
      showToast('Authentication policy updated!', 'success');
      if (onPolicyChange) onPolicyChange(authPolicy);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveMaintenance = async () => {
    try {
      const { error } = await supabase.from('system_settings').upsert({
        key: 'maintenance',
        value: { isActive: isMaintenance, endTime: maintenanceEnd }
      });
      if (error) throw error;
      showToast(
        isMaintenance ? 'System locked in Maintenance mode' : 'Maintenance mode deactivated',
        isMaintenance ? 'error' : 'success'
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveAlert = async () => {
    try {
      const { error } = await supabase.from('system_settings').upsert({
        key: 'system_update',
        value: { active: alertActive, date: alertDate, message: alertMsg.trim() }
      });
      if (error) throw error;
      showToast('Homepage alert updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    if (!appVersion.trim() || !appLink.trim()) return;

    try {
      const { error } = await supabase.from('app_downloads').insert({
        platform: appPlatform,
        version: appVersion.trim(),
        download_link: appLink.trim()
      });
      if (error) throw error;
      showToast('App version link published!', 'success');
      setAppVersion('');
      setAppLink('');
      loadApps();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteApp = async (id) => {
    if (!window.confirm('Delete this download link?')) return;
    try {
      const { error } = await supabase.from('app_downloads').delete().eq('id', id);
      if (error) throw error;
      showToast('Download link removed', 'success');
      loadApps();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8 animate__animated animate__fadeIn pb-20">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
          <Icons.Settings className="text-blue-400" /> System Configuration
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage authentication security, maintenance locks, global banner alerts, and downloadable applications.
        </p>
      </div>

      {/* 1. Authentication Policy */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border-t-4 border-blue-500 shadow-xl bg-black/40">
        <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
          <Icons.Shield className="text-blue-400" /> Authentication Security Policy
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Specify how administrators are required to authenticate into this portal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'face', title: 'Face ID Only', icon: 'fa-id-card', desc: 'Strictest security. Camera biometric verification required.' },
            { id: 'password', title: 'Password Only', icon: 'fa-key', desc: 'Traditional email and password verification.' },
            { id: 'choice', title: 'User Choice', icon: 'fa-fingerprint', desc: 'Flexible access via password or facial recognition.' },
          ].map((policy) => (
            <label
              key={policy.id}
              className={`relative flex flex-col p-5 rounded-2xl border cursor-pointer transition-all ${
                authPolicy === policy.id
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                  : 'border-white/10 bg-black/40 hover:bg-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <i className={`fas ${policy.icon} text-2xl text-blue-400`}></i>
                <input
                  type="radio"
                  name="auth_policy"
                  value={policy.id}
                  checked={authPolicy === policy.id}
                  onChange={(e) => setAuthPolicy(e.target.value)}
                  className="accent-blue-500 w-5 h-5"
                />
              </div>
              <span className="font-bold text-sm text-white">{policy.title}</span>
              <span className="text-xs text-gray-400 mt-1">{policy.desc}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handleSaveAuthPolicy}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
          >
            Update Security Policy
          </button>
        </div>
      </div>

      {/* 2. Maintenance & Global Alert Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border-t-4 border-red-500 shadow-xl bg-black/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Icons.AlertTriangle className="text-red-500" /> Maintenance Mode Lock
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isMaintenance}
                onChange={(e) => setIsMaintenance(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            When enabled, student visitors are redirected to the countdown screen. Administrators retain full access to /admin.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">
                Estimated Completion Time
              </label>
              <input
                type="datetime-local"
                value={maintenanceEnd}
                onChange={(e) => setMaintenanceEnd(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={handleSaveMaintenance}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 rounded-xl font-bold text-sm transition-all"
            >
              Apply Maintenance Status
            </button>
          </div>
        </div>

        {/* Global Homepage Alert Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border-t-4 border-yellow-500 shadow-xl bg-black/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Icons.Bell className="text-yellow-400" /> Global Homepage Alert
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alertActive}
                onChange={(e) => setAlertActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-500"></div>
            </label>
          </div>
          <p className="text-xs text-gray-400 mb-6">
            Broadcast a prominent amber alert card at the top of the student home screen.
          </p>

          <div className="space-y-4">
            <input
              type="date"
              value={alertDate}
              onChange={(e) => setAlertDate(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-yellow-400"
            />
            <textarea
              rows={2}
              value={alertMsg}
              onChange={(e) => setAlertMsg(e.target.value)}
              placeholder="Announcement text to display on student homepage..."
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-yellow-400 resize-none"
            />
            <button
              onClick={handleSaveAlert}
              className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black border border-yellow-500/40 rounded-xl font-bold text-sm transition-all"
            >
              Update Global Alert
            </button>
          </div>
        </div>
      </div>

      {/* 3. App Version Control */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border-t-4 border-emerald-500 shadow-xl bg-black/40">
        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
          <Icons.Apps className="text-emerald-400" /> App Version Control & Links
        </h3>

        <form onSubmit={handleCreateApp} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
              Platform
            </label>
            <select
              value={appPlatform}
              onChange={(e) => setAppPlatform(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-emerald-500"
            >
              <option value="android">Android (APK)</option>
              <option value="pc">Windows (PC EXE)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
              Version Label
            </label>
            <input
              type="text"
              placeholder="v1.2.0"
              value={appVersion}
              onChange={(e) => setAppVersion(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
              Download Link
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={appLink}
              onChange={(e) => setAppLink(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Icons.Upload size={16} /> Publish App Link
            </button>
          </div>
        </form>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Active Download Links ({apps.length})
          </h4>
          {apps.map((app) => (
            <div
              key={app.id}
              className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    app.platform === 'android'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  <i className={`fab ${app.platform === 'android' ? 'fa-android' : 'fa-windows'}`}></i>
                </div>
                <div>
                  <h5 className="font-bold text-white capitalize text-sm">{app.platform} App</h5>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs bg-black/50 border border-white/10 px-2 py-0.5 rounded text-emerald-400 font-mono">
                      {app.version}
                    </span>
                    <a
                      href={app.download_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-400 hover:text-white truncate max-w-xs underline"
                    >
                      {app.download_link}
                    </a>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDeleteApp(app.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <Icons.Trash2 size={16} />
              </button>
            </div>
          ))}
          {apps.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-6">No app links added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
