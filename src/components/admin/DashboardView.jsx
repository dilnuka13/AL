import React, { useState, useEffect } from 'react';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { useToast } from '../common/Toast';

export const DashboardView = () => {
  const [stats, setStats] = useState({
    papers: 0,
    downloads: 0,
    notices: 0,
    users: 0
  });
  const [downloadRows, setDownloadRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      // 1. Papers Count
      const { count: pCount } = await supabase
        .from('past_papers')
        .select('*', { count: 'exact', head: true });

      // 2. Notices Count
      const { count: nCount } = await supabase
        .from('notices')
        .select('*', { count: 'exact', head: true });

      // 3. Users Count
      const { count: uCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 4. Download Stats
      const { data: dlData } = await supabase
        .from('subject_download_stats')
        .select('*')
        .order('paper_downloads', { ascending: false });

      const totalDl = dlData?.reduce(
        (acc, curr) => acc + (curr.paper_downloads || 0) + (curr.marking_downloads || 0),
        0
      ) || 0;

      setStats({
        papers: pCount || 0,
        downloads: totalDl,
        notices: nCount || 0,
        users: uCount || 0
      });
      setDownloadRows(dlData || []);
    } catch (e) {
      console.error(e);
      showToast('Error loading stats: ' + e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const [isPinging, setIsPinging] = useState(false);
  const [pulseStatus, setPulseStatus] = useState(null);

  const handleSendPulse = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key')
        .limit(1);
      const latency = Math.round(performance.now() - start);
      if (error) throw error;
      setPulseStatus({
        success: true,
        latency,
        time: new Date().toLocaleTimeString(),
        message: 'Heartbeat signal acknowledged! Supabase 7-day timer reset.'
      });
      showToast(`Signal delivered! (${latency}ms) - Inactivity timer reset`, 'success');
    } catch (err) {
      const latency = Math.round(performance.now() - start);
      setPulseStatus({
        success: false,
        latency,
        time: new Date().toLocaleTimeString(),
        message: err.message || 'Signal transmission failed'
      });
      showToast('Heartbeat signal failed: ' + err.message, 'error');
    } finally {
      setIsPinging(false);
    }
  };

  const statCards = [
    { label: 'Total Papers', val: stats.papers, color: 'emerald', icon: Icons.FileText },
    { label: 'Total Downloads', val: stats.downloads, color: 'blue', icon: Icons.Download },
    { label: 'Active Notices', val: stats.notices, color: 'yellow', icon: Icons.Bell },
    { label: 'Admin Users', val: stats.users, color: 'purple', icon: Icons.Users }
  ];

  return (
    <div className="space-y-8 animate__animated animate__fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
            <Icons.LayoutDashboard /> Dashboard Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            System performance, download analytics, and repository status.
          </p>
        </div>
        <button
          onClick={() => {
            loadDashboard();
            showToast('Dashboard Refreshed', 'success');
          }}
          className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl transition shadow-sm text-sm font-bold flex items-center gap-2"
        >
          <Icons.Sync className={`text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((item, idx) => (
          <div
            key={idx}
            className="glass p-6 rounded-3xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-white/5 bg-black/40"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-white/5 text-emerald-400 group-hover:scale-110 transition-transform">
                <item.icon size={24} />
              </div>
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                {item.label}
              </span>
            </div>
            <span className="text-4xl font-extrabold text-white">
              {item.val.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Supabase 7-Day Auto-Pause Prevention Signal Shield */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-black/50 to-blue-950/20 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                24/7 Supabase Keep-Alive Shield
              </span>
              <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
                Auto-Pause Preventer
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <Icons.Shield className="text-emerald-400" /> Supabase 7-Day Push / Sleep Prevention System
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Supabase Free Tier projects auto-pause if inactive for 7 days. This automated system sends scheduled pulse queries every 3 days via GitHub Actions (cron: <code className="text-emerald-300 bg-black/40 px-2 py-0.5 rounded font-mono text-xs">0 4 */3 * *</code>), permanently resetting the 7-day inactivity timer so your database never sleeps.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
                <span className="text-emerald-400">●</span> Target: hppojrbfhzttzvlvovre
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 font-mono">
                <span className="text-blue-400">●</span> Schedule: Every 3 Days (Cloud Automated)
              </div>
              {pulseStatus && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono ${pulseStatus.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
                  <span>{pulseStatus.success ? '✓' : '✗'}</span> Last Ping: {pulseStatus.time} ({pulseStatus.latency}ms) - {pulseStatus.success ? 'Timer Reset' : 'Failed'}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={handleSendPulse}
              disabled={isPinging}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold px-5 py-3 rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 text-sm active:scale-95"
            >
              <Icons.Send className={isPinging ? 'animate-bounce' : ''} />
              <span>{isPinging ? 'Transmitting Signal...' : 'Send Signal Now'}</span>
            </button>
            <a
              href="https://github.com/dilnuka13/AL/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/10 text-white font-medium px-4 py-2.5 rounded-2xl transition border border-white/10 flex items-center justify-center gap-2 text-xs"
            >
              <Icons.ExternalLink />
              <span>View GitHub Actions</span>
            </a>
          </div>
        </div>
      </div>

      {/* Downloads Breakdown Table */}
      <div className="glass p-6 md:p-8 rounded-3xl border border-white/5 bg-black/40">
        <h3 className="font-heading font-bold text-lg text-white mb-6 flex items-center gap-2">
          <i className="fas fa-chart-pie text-emerald-400 mr-2"></i> Subject Download Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white">
            <thead className="bg-white/5 text-xs uppercase text-gray-400 font-bold tracking-wider">
              <tr>
                <th className="p-4 rounded-l-xl">Subject Name</th>
                <th className="p-4 text-right">Paper Downloads</th>
                <th className="p-4 text-right rounded-r-xl">Marking Scheme Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {downloadRows.length > 0 ? (
                downloadRows.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-gray-200">{r.subject_name}</td>
                    <td className="p-4 text-right">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold font-mono">
                        {(r.paper_downloads || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold font-mono">
                        {(r.marking_downloads || 0).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    No download logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
