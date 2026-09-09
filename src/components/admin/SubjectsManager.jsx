import React, { useState, useEffect } from 'react';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { useToast } from '../common/Toast';

export const SubjectsManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [streams, setStreams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase.from('subjects').select('*').order('name');
      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStreamToggle = (val) => {
    setStreams((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showToast('Enter subject name', 'error');
    if (streams.length === 0) return showToast('Select at least one applicable stream', 'error');

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('subjects').insert({
        name: name.trim(),
        code: code.trim(),
        streams: streams
      });

      if (error) throw error;
      showToast('Subject created successfully!', 'success');
      setName('');
      setCode('');
      setStreams([]);
      loadSubjects();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will remove the subject definition (associated papers are preserved).')) {
      return;
    }
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      showToast('Subject deleted', 'success');
      loadSubjects();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
            <Icons.BookOpen className="text-purple-400" /> Subject Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure subjects and categorize them by educational streams.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Subject Form */}
        <div className="glass-panel p-6 rounded-3xl border-t-4 border-purple-500 shadow-xl bg-black/40 h-fit">
          <h3 className="font-bold text-lg text-white mb-4">Add New Subject</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="e.g. Combined Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-purple-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                Subject Code
              </label>
              <input
                type="text"
                placeholder="e.g. MATH-01"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-purple-500 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                Applicable Streams
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['science', 'commerce', 'arts', 'technology'].map((s) => (
                  <label
                    key={s}
                    className="cursor-pointer flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/5 hover:border-purple-500/40 transition capitalize text-xs text-gray-300 font-bold"
                  >
                    <input
                      type="checkbox"
                      checked={streams.includes(s)}
                      onChange={() => handleStreamToggle(s)}
                      className="accent-purple-500 w-4 h-4 rounded"
                    />
                    <span>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 transition-all text-sm mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Subject'}
            </button>
          </form>
        </div>

        {/* Existing Subjects Grid */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/10 bg-black/40">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center justify-between">
            <span>Existing Subjects ({subjects.length})</span>
            <button
              onClick={loadSubjects}
              className="text-gray-400 hover:text-white text-xs font-mono"
            >
              Reload
            </button>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm hover:border-purple-500/30 transition"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2 text-sm">
                    {s.name}
                    {s.code && (
                      <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded text-gray-400 font-mono border border-white/5">
                        {s.code}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {s.streams?.map((st) => (
                      <span
                        key={st}
                        className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition ml-2"
                  title="Delete Subject"
                >
                  <Icons.Trash2 size={14} />
                </button>
              </div>
            ))}
            {subjects.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                No subjects defined yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectsManager;
