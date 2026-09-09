import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { useToast } from '../common/Toast';

export const NoticesManager = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('normal');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotices(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('notices').insert({
        title: title.trim(),
        type,
        body: body.trim()
      });

      if (error) throw error;
      showToast('Announcement published!', 'success');
      setTitle('');
      setBody('');
      setType('normal');
      loadNotices();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      showToast('Announcement removed', 'success');
      loadNotices();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeIn pb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
          <Icons.Bell className="text-yellow-400" /> Announcements & Notices
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Publish announcements to the student portal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Notice Form */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl border-t-4 border-yellow-400 shadow-xl bg-black/40 h-fit">
          <h3 className="font-bold text-lg text-white mb-4">Create Announcement</h3>
          <form onSubmit={handleCreateNotice} className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                Topic Headline
              </label>
              <input
                type="text"
                placeholder="e.g. 2024 Exam Registration Deadline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-yellow-400 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                Notice Type / Priority
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-yellow-400 text-sm"
              >
                <option value="normal">General Announcement (Blue)</option>
                <option value="important">Urgent Notice (Red)</option>
                <option value="opportunity">Good News / Opportunity (Green)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                Message Content
              </label>
              <textarea
                rows={5}
                placeholder="Type the full announcement message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-yellow-400 text-sm resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold shadow-lg shadow-yellow-500/20 transition-all text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </form>
        </div>

        {/* Existing Notices List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 bg-black/40">
          <h3 className="font-bold text-lg text-white mb-4">
            Published Announcements ({notices.length})
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {notices.map((n) => {
              const borderColors = {
                important: 'border-l-4 border-red-500 bg-red-950/10',
                opportunity: 'border-l-4 border-emerald-500 bg-emerald-950/10',
                normal: 'border-l-4 border-blue-500 bg-blue-950/10'
              }[n.type] || 'border-l-4 border-gray-500';

              return (
                <div
                  key={n.id}
                  className={`p-5 rounded-2xl bg-white/5 border border-white/5 ${borderColors} transition-all relative group`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-base leading-snug">{n.title}</h4>
                      <p className="text-sm text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">
                        {n.body}
                      </p>
                      <span className="text-[10px] text-gray-500 mt-3 block font-mono">
                        {moment(n.created_at).fromNow()} • {moment(n.created_at).format('LL')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition shrink-0"
                      title="Delete Notice"
                    >
                      <Icons.Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
            {notices.length === 0 && (
              <div className="text-center text-gray-500 py-16">
                No announcements published yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticesManager;
