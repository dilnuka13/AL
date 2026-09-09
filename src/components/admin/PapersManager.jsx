import React, { useState, useEffect } from 'react';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { useToast } from '../common/Toast';

export const PapersManager = () => {
  const [papers, setPapers] = useState([]);
  const [definedSubjects, setDefinedSubjects] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);

  // Upload Form State
  const [formStreams, setFormStreams] = useState([]);
  const [selectedSubjectJson, setSelectedSubjectJson] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formPaperLink, setFormPaperLink] = useState('');
  const [formMarkingLink, setFormMarkingLink] = useState('');

  // Filters
  const [searchText, setSearchText] = useState('');
  const [filterStream, setFilterStream] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  const { showToast } = useToast();

  useEffect(() => {
    loadPapers();
    loadSubjects();
  }, []);

  const loadPapers = async () => {
    try {
      const { data, error } = await supabase
        .from('past_papers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPapers(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const loadSubjects = async () => {
    try {
      const { data, error } = await supabase.from('subjects').select('*').order('name');
      if (error) throw error;
      setDefinedSubjects(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStreamCheckboxChange = (stream) => {
    setFormStreams((prev) =>
      prev.includes(stream) ? prev.filter((s) => s !== stream) : [...prev, stream]
    );
  };

  const filteredUploadSubjects = definedSubjects.filter((sub) =>
    formStreams.length === 0
      ? true
      : formStreams.every((st) => sub.streams?.includes(st) || sub.stream === st)
  );

  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (formStreams.length === 0) {
      return showToast('Please select at least one target stream', 'error');
    }
    if (!selectedSubjectJson) {
      return showToast('Please select a subject', 'error');
    }
    if (!formYear) {
      return showToast('Please enter examination year', 'error');
    }

    try {
      const subjectObj = JSON.parse(selectedSubjectJson);
      const inserts = formStreams.map((st) => ({
        subject_name: subjectObj.name,
        subject_code: subjectObj.code || '',
        year: parseInt(formYear, 10),
        stream: st,
        paper_link: formPaperLink.trim(),
        marking_scheme_link: formMarkingLink.trim()
      }));

      const { error } = await supabase.from('past_papers').insert(inserts);
      if (error) throw error;

      showToast('Resources uploaded successfully!', 'success');
      setIsFormOpen(false);
      setFormStreams([]);
      setSelectedSubjectJson('');
      setFormYear('');
      setFormPaperLink('');
      setFormMarkingLink('');
      loadPapers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Permanently delete this paper from the database?')) return;
    try {
      const { error } = await supabase.from('past_papers').delete().eq('id', id);
      if (error) throw error;
      showToast('Resource deleted', 'success');
      loadPapers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingPaper) return;

    try {
      const { error } = await supabase
        .from('past_papers')
        .update({
          subject_name: editingPaper.subject_name,
          year: parseInt(editingPaper.year, 10),
          paper_link: editingPaper.paper_link,
          marking_scheme_link: editingPaper.marking_scheme_link
        })
        .eq('id', editingPaper.id);

      if (error) throw error;
      showToast('Resource updated successfully', 'success');
      setEditingPaper(null);
      loadPapers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtered List
  const displayedPapers = papers.filter((p) => {
    const sTerm = searchText.toLowerCase();
    const matchesSearch =
      p.subject_name?.toLowerCase().includes(sTerm) ||
      p.subject_code?.toLowerCase().includes(sTerm) ||
      p.year?.toString().includes(sTerm);

    const matchesStream = filterStream === 'all' || p.stream === filterStream;
    const matchesSubject = filterSubject === 'all' || p.subject_name === filterSubject;
    const matchesYear = filterYear === 'all' || p.year?.toString() === filterYear;

    return matchesSearch && matchesStream && matchesSubject && matchesYear;
  });

  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <div className="space-y-6 animate__animated animate__fadeIn">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
            Resource Library
          </h1>
          <p className="text-gray-400 text-sm">
            Manage A/L past papers, marking schemes, and exam materials.
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          <Icons.Upload size={16} />
          <span>{isFormOpen ? 'Close Form' : 'Upload New Resource'}</span>
        </button>
      </div>

      {/* Upload Form (Collapsible) */}
      {isFormOpen && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl relative animate__animated animate__fadeInDown bg-black/50">
          <button
            onClick={() => setIsFormOpen(false)}
            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <Icons.X size={16} />
          </button>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <Icons.Upload className="text-emerald-400" /> Upload New Past Paper
          </h3>

          <form onSubmit={handleCreatePaper} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Target Streams */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 block">
                  1. Target Streams
                </label>
                <div className="space-y-2">
                  {['science', 'commerce', 'arts', 'technology'].map((st) => (
                    <label
                      key={st}
                      className="cursor-pointer flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition capitalize text-sm text-gray-300 font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={formStreams.includes(st)}
                        onChange={() => handleStreamCheckboxChange(st)}
                        className="accent-emerald-500 w-4 h-4 rounded"
                      />
                      <span>{st}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject & Year */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    2. Select Subject
                  </label>
                  <select
                    value={selectedSubjectJson}
                    onChange={(e) => setSelectedSubjectJson(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:border-emerald-500 outline-none"
                    required
                  >
                    <option value="">-- Choose Subject --</option>
                    {filteredUploadSubjects.map((s) => (
                      <option
                        key={s.id}
                        value={JSON.stringify({ name: s.name, code: s.code })}
                      >
                        {s.name} {s.code ? `(${s.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                    3. Examination Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Paper PDF Link (Direct URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formPaperLink}
                      onChange={(e) => setFormPaperLink(e.target.value)}
                      className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Marking Scheme Link (Direct URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formMarkingLink}
                      onChange={(e) => setFormMarkingLink(e.target.value)}
                      className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/10 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
              >
                Add Resource to Database
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-panel p-3 md:p-4 rounded-2xl border border-white/10 bg-black/40">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-3.5 text-gray-500"></i>
            <input
              type="text"
              placeholder="Search by subject, code, or year..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-emerald-500 outline-none transition-all text-white text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={filterStream}
              onChange={(e) => setFilterStream(e.target.value)}
              className="p-3 rounded-xl bg-black/50 border border-white/10 text-sm text-gray-300 outline-none focus:border-emerald-500"
            >
              <option value="all">All Streams</option>
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
              <option value="arts">Arts</option>
              <option value="technology">Technology</option>
            </select>

            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="p-3 rounded-xl bg-black/50 border border-white/10 text-sm text-gray-300 outline-none focus:border-emerald-500 max-w-[160px]"
            >
              <option value="all">All Subjects</option>
              {[...new Set(papers.map((p) => p.subject_name))]
                .sort()
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="p-3 rounded-xl bg-black/50 border border-white/10 text-sm text-gray-300 outline-none focus:border-emerald-500"
            >
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                loadPapers();
                showToast('Resource list refreshed', 'success');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition flex items-center justify-center"
              title="Refresh list"
            >
              <Icons.Sync size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
        {displayedPapers.map((p) => {
          const streamColors = {
            science: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            commerce: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
            arts: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
            technology: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
          }[p.stream] || 'bg-white/10 text-gray-300 border-white/10';

          return (
            <div
              key={p.id}
              className="glass p-5 rounded-3xl border border-white/10 shadow-sm hover:-translate-y-1 transition-all duration-300 relative group bg-black/40"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${streamColors}`}
                >
                  {p.stream}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setEditingPaper({ ...p })}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                    title="Edit Resource"
                  >
                    <Icons.Pen size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePaper(p.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Delete Resource"
                  >
                    <Icons.Trash2 size={14} />
                  </button>
                </div>
              </div>

              <h4 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-2">
                {p.subject_name}
              </h4>
              <p className="text-xs text-gray-400 mb-4 font-mono font-bold">
                {p.year} • {p.subject_code || 'N/A'}
              </p>

              <div className="grid grid-cols-2 gap-2">
                {p.paper_link ? (
                  <a
                    href={p.paper_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold hover:bg-blue-600 hover:text-white transition"
                  >
                    <Icons.FileText size={14} /> Paper
                  </a>
                ) : (
                  <span className="flex items-center justify-center py-2 rounded-xl bg-white/5 text-gray-600 text-xs font-bold cursor-not-allowed">
                    No Paper
                  </span>
                )}
                {p.marking_scheme_link ? (
                  <a
                    href={p.marking_scheme_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-600 hover:text-white transition"
                  >
                    <Icons.Shield size={14} /> Scheme
                  </a>
                ) : (
                  <span className="flex items-center justify-center py-2 rounded-xl bg-white/5 text-gray-600 text-xs font-bold cursor-not-allowed">
                    No Scheme
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {displayedPapers.length === 0 && (
          <div className="col-span-full text-center py-16 glass rounded-3xl border-dashed border border-white/10">
            <Icons.FileText size={40} className="mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No resources found matching the criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Paper Modal */}
      {editingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate__animated animate__fadeIn">
          <div className="glass-panel w-full max-w-xl p-8 rounded-3xl relative shadow-2xl bg-[#0c101a] border border-white/10 animate__animated animate__zoomIn">
            <button
              onClick={() => setEditingPaper(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
            >
              <Icons.X size={16} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
              Edit Resource: <span className="text-emerald-400">{editingPaper.subject_name}</span>
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                    Subject Name
                  </label>
                  <input
                    type="text"
                    value={editingPaper.subject_name}
                    onChange={(e) =>
                      setEditingPaper({ ...editingPaper, subject_name: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={editingPaper.year}
                    onChange={(e) =>
                      setEditingPaper({ ...editingPaper, year: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                  Paper PDF Link
                </label>
                <input
                  type="url"
                  value={editingPaper.paper_link || ''}
                  onChange={(e) =>
                    setEditingPaper({ ...editingPaper, paper_link: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
                  Marking Scheme Link
                </label>
                <input
                  type="url"
                  value={editingPaper.marking_scheme_link || ''}
                  onChange={(e) =>
                    setEditingPaper({ ...editingPaper, marking_scheme_link: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPaper(null)}
                  className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PapersManager;
