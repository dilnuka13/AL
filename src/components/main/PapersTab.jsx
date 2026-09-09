import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { slugify } from '../../lib/slugify';
import { useToast } from '../common/Toast';

export const PapersTab = () => {
  const { stream, subjectSlug, year } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Data states
  const [allPapersSummary, setAllPapersSummary] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // Filter & View states
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const streamConfigs = [
    {
      id: 'science',
      label: 'Physical Science',
      icon: 'microscope',
      desc: 'Combined Maths, Physics, Chemistry, ICT and more',
      color: 'emerald'
    },
    {
      id: 'commerce',
      label: 'Commerce',
      icon: 'chart-line',
      desc: 'Accounting, Business Studies, Economics, and Statistics',
      color: 'blue'
    },
    {
      id: 'arts',
      label: 'Arts',
      icon: 'palette',
      desc: 'Languages, Political Science, History, Logic, and Media',
      color: 'amber'
    },
    {
      id: 'technology',
      label: 'Technology',
      icon: 'microchip',
      desc: 'Engineering Tech, Bio-systems Tech, and Science for Tech',
      color: 'violet'
    }
  ];

  const activeStreamConfig = streamConfigs.find((s) => s.id === stream);

  // 1. Initial Load: Fetch summary of all papers to determine active streams and subjects
  useEffect(() => {
    const fetchAllPapersSummary = async () => {
      try {
        const { data, error } = await supabase
          .from('past_papers')
          .select('stream, subject_name');
        if (error) throw error;
        setAllPapersSummary(data || []);
      } catch (e) {
        console.error('Failed to load papers summary:', e);
      } finally {
        setSummaryLoaded(true);
      }
    };

    fetchAllPapersSummary();
  }, []);

  // 2. Dynamic Title Bar Update based on current section/stream/subject/year
  useEffect(() => {
    if (!stream) {
      document.title = 'Past Papers Archive | DE Education.lk';
    } else if (stream && !subjectSlug) {
      const streamName = activeStreamConfig?.label || stream.toUpperCase();
      document.title = `${streamName} Past Papers | DE Education.lk`;
    } else if (stream && subjectSlug && (!year || year === 'all')) {
      const subjectName = currentSubject?.name || 'Subject';
      document.title = `${subjectName} Past Papers | DE Education.lk`;
    } else if (stream && subjectSlug && year && year !== 'all') {
      const subjectName = currentSubject?.name || 'Subject';
      document.title = `${subjectName} ${year} Past Paper | DE Education.lk`;
    }
  }, [stream, subjectSlug, year, activeStreamConfig, currentSubject]);

  // 3. Fetch subjects when stream changes
  useEffect(() => {
    if (!stream) {
      setSubjects([]);
      setCurrentSubject(null);
      setPapers([]);
      return;
    }

    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('subjects').select('*').order('name');
        if (error) throw error;
        const filtered = (data || []).filter(
          (s) => s.streams && (s.streams.includes(stream) || s.stream === stream)
        );
        setSubjects(filtered);
      } catch (e) {
        console.error('Failed to load subjects:', e);
        showToast('Error loading subjects for ' + stream, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [stream]);

  // 4. Match subject and fetch papers when subjectSlug or subjects change
  useEffect(() => {
    if (!stream || !subjectSlug) {
      setCurrentSubject(null);
      setPapers([]);
      return;
    }

    const fetchPapers = async () => {
      setLoading(true);
      try {
        let target = subjects.find(
          (s) =>
            slugify(s.name) === subjectSlug ||
            (s.code && s.code.toLowerCase() === subjectSlug.toLowerCase())
        );

        if (!target) {
          const { data } = await supabase.from('subjects').select('*');
          if (data) {
            target = data.find(
              (s) =>
                slugify(s.name) === subjectSlug ||
                (s.code && s.code.toLowerCase() === subjectSlug.toLowerCase())
            );
          }
        }

        if (target) {
          setCurrentSubject(target);
          const { data: paperData, error } = await supabase
            .from('past_papers')
            .select('*')
            .eq('stream', stream)
            .eq('subject_name', target.name)
            .order('year', { ascending: false });

          if (error) throw error;
          setPapers(paperData || []);
        } else {
          // Fallback: search directly in past_papers table
          const { data: fallbackPapers } = await supabase
            .from('past_papers')
            .select('*')
            .eq('stream', stream)
            .order('year', { ascending: false });

          const matchingFallback = (fallbackPapers || []).filter(
            (p) => slugify(p.subject_name) === subjectSlug
          );

          if (matchingFallback.length > 0) {
            setCurrentSubject({ name: matchingFallback[0].subject_name });
            setPapers(matchingFallback);
          } else {
            setCurrentSubject(null);
            setPapers([]);
          }
        }
      } catch (e) {
        console.error('Failed to load papers:', e);
        showToast('Error loading papers', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [stream, subjectSlug, subjects.length]);

  const handleDownload = async (paperId, type, subjectName) => {
    try {
      const countColumn = type === 'paper' ? 'paper_downloads' : 'marking_downloads';
      const { data: existing } = await supabase
        .from('subject_download_stats')
        .select('*')
        .eq('subject_name', subjectName)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('subject_download_stats')
          .update({ [countColumn]: (existing[countColumn] || 0) + 1 })
          .eq('subject_name', subjectName);
      } else {
        await supabase.from('subject_download_stats').insert({
          subject_name: subjectName,
          [countColumn]: 1,
          [type === 'paper' ? 'marking_downloads' : 'paper_downloads']: 0
        });
      }
    } catch (e) {
      console.error('Download stat update error:', e);
    }
  };

  const copyCurrentUrl = (customUrl, label = 'Direct link') => {
    const targetUrl = customUrl || window.location.href;
    navigator.clipboard.writeText(targetUrl).then(
      () => {
        showToast(`${label} copied! Share with friends or students.`, 'success');
      },
      () => {
        showToast('Failed to copy link', 'error');
      }
    );
  };

  // --- STRICT AVAILABILITY FILTERING (Hide streams/subjects with 0 papers) ---
  // 1. Streams with at least 1 paper
  const streamPaperCounts = allPapersSummary.reduce((acc, p) => {
    const s = (p.stream || '').trim().toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const visibleStreams = summaryLoaded
    ? streamConfigs.filter((st) => (streamPaperCounts[st.id.toLowerCase()] || 0) > 0)
    : streamConfigs;

  // 2. Subjects with at least 1 paper in current stream
  const subjectPaperCountsInStream = allPapersSummary.reduce((acc, p) => {
    if ((p.stream || '').trim().toLowerCase() === (stream || '').trim().toLowerCase()) {
      const subNameKey = (p.subject_name || '').trim().toLowerCase();
      acc[subNameKey] = (acc[subNameKey] || 0) + 1;
    }
    return acc;
  }, {});

  const visibleSubjects = subjects.filter((sub) => {
    const count = subjectPaperCountsInStream[(sub.name || '').trim().toLowerCase()] || 0;
    return count > 0;
  });

  // Filtered papers based on search and year parameter
  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      searchQuery === '' ||
      p.year.toString().includes(searchQuery) ||
      (p.subject_name && p.subject_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.subject_code && p.subject_code.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesYear = !year || year === 'all' || p.year.toString() === year;
    return matchesSearch && matchesYear;
  });

  const availableYears = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a);

  const handleYearChange = (newYear) => {
    if (newYear === 'all') {
      navigate(`/papers/${stream}/${subjectSlug}`);
    } else {
      navigate(`/papers/${stream}/${subjectSlug}/${newYear}`);
    }
  };

  return (
    <div className="animate__animated animate__fadeIn pb-16">
      {/* Dynamic Breadcrumbs Navigation with Shareable Link */}
      <div className="max-w-7xl mx-auto mb-8">
        <div
          className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border backdrop-blur-md transition-colors"
          style={{
            backgroundColor: 'var(--card-glass)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)'
          }}
        >
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold">
            <Link
              to="/"
              className="hover:text-emerald-500 transition-colors flex items-center gap-1.5"
            >
              <Icons.Home size={14} />
              <span>Home</span>
            </Link>

            <span className="opacity-40">/</span>

            <Link
              to="/papers"
              className={`hover:text-emerald-500 transition-colors ${
                !stream ? 'text-emerald-500 font-extrabold' : ''
              }`}
            >
              Past Papers
            </Link>

            {stream && (
              <>
                <span className="opacity-40">/</span>
                <Link
                  to={`/papers/${stream}`}
                  className={`hover:text-emerald-500 transition-colors capitalize ${
                    !subjectSlug ? 'text-emerald-500 font-extrabold' : ''
                  }`}
                >
                  {activeStreamConfig?.label || stream}
                </Link>
              </>
            )}

            {currentSubject && (
              <>
                <span className="opacity-40">/</span>
                <Link
                  to={`/papers/${stream}/${subjectSlug}`}
                  className={`hover:text-emerald-500 transition-colors ${
                    !year ? 'text-emerald-500 font-extrabold' : ''
                  }`}
                >
                  {currentSubject.name}
                </Link>
              </>
            )}

            {year && year !== 'all' && (
              <>
                <span className="opacity-40">/</span>
                <span className="text-emerald-500 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {year} Paper
                </span>
              </>
            )}
          </div>

          {/* Direct Share Link Button */}
          <button
            onClick={() => copyCurrentUrl()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm hover:scale-105 active:scale-95 text-emerald-500"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--border-color)'
            }}
            title="Copy bookmarkable URL to clipboard"
          >
            <Icons.Share2 size={13} />
            <span>Copy Page URL</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SELECT STREAM (Folder Level - Only shows streams with papers) */}
      {!stream && (
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate__animated animate__fadeInDown">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest mb-4">
              <Icons.Folder size={13} /> A/L Subject Streams
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold mb-3 font-heading"
              style={{ color: 'var(--text-main)' }}
            >
              Select Your Stream
            </h2>
            <p
              className="text-sm md:text-base max-w-xl mx-auto font-light"
              style={{ color: 'var(--text-muted)' }}
            >
              Browse our organized library of G.C.E. Advanced Level past papers and marking schemes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleStreams.map((st, index) => {
              const paperCount = streamPaperCounts[st.id.toLowerCase()] || 0;
              return (
                <div
                  key={st.id}
                  onClick={() => navigate(`/papers/${st.id}`)}
                  style={{
                    animationDelay: `${index * 80}ms`,
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)'
                  }}
                  className="glass p-7 md:p-8 rounded-3xl cursor-pointer group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border animate__animated animate__fadeInUp flex flex-col justify-between"
                >
                  <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-15 transition-all duration-500 transform group-hover:scale-125 group-hover:rotate-12">
                    <i className={`fas fa-${st.icon} text-9xl`}></i>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-md border"
                        style={{
                          backgroundColor: 'var(--card-glass)',
                          borderColor: 'var(--border-color)'
                        }}
                      >
                        <i className={`fas fa-${st.icon} text-2xl`}></i>
                      </div>

                      <span
                        className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      >
                        {paperCount} {paperCount === 1 ? 'Paper' : 'Papers'}
                      </span>
                    </div>

                    <h3
                      className="text-xl font-bold mb-2 font-heading group-hover:text-emerald-500 transition-colors"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {st.label}
                    </h3>

                    <p
                      className="text-xs font-light mb-6 line-clamp-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {st.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 group-hover:translate-x-1 transition-transform pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <span>Browse Subjects</span>
                    <Icons.ArrowRight size={13} />
                  </div>
                </div>
              );
            })}

            {visibleStreams.length === 0 && summaryLoaded && (
              <div
                className="col-span-full py-20 text-center rounded-3xl border border-dashed"
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-muted)'
                }}
              >
                <Icons.Folder size={40} className="mx-auto mb-3 opacity-40" />
                <p className="text-lg font-bold">No past papers have been uploaded yet</p>
                <p className="text-xs mt-1">Please check back soon.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SELECT SUBJECT (Subject Level - Only shows subjects with papers) */}
      {stream && !subjectSlug && (
        <div className="max-w-7xl mx-auto animate__animated animate__fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <button
              onClick={() => navigate('/papers')}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all hover:scale-105 active:scale-95 w-fit text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              <Icons.ArrowLeft size={14} />
              <span>All Streams</span>
            </button>

            <div className="text-left sm:text-right">
              <h2
                className="text-2xl md:text-3xl font-extrabold font-heading"
                style={{ color: 'var(--text-main)' }}
              >
                {activeStreamConfig?.label || stream}
              </h2>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider mt-0.5">
                {visibleSubjects.length} Active Subjects Available
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-36 rounded-3xl animate-pulse border"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)'
                  }}
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleSubjects.map((sub, idx) => {
                const subSlug = slugify(sub.name);
                const count = subjectPaperCountsInStream[(sub.name || '').trim().toLowerCase()] || 0;

                return (
                  <div
                    key={sub.id || idx}
                    onClick={() => navigate(`/papers/${stream}/${subSlug}`)}
                    style={{
                      animationDelay: `${idx * 40}ms`,
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)'
                    }}
                    className="group relative p-6 glass rounded-3xl cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl overflow-hidden border animate__animated animate__fadeInUp flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform text-emerald-500"
                          style={{
                            backgroundColor: 'var(--card-glass)',
                            borderColor: 'var(--border-color)'
                          }}
                        >
                          <Icons.BookOpen size={20} />
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        >
                          {count} {count === 1 ? 'Paper' : 'Papers'}
                        </span>
                      </div>

                      <h3
                        className="text-base md:text-lg font-bold mb-2 line-clamp-2 leading-snug group-hover:text-emerald-500 transition-colors font-heading"
                        style={{ color: 'var(--text-main)' }}
                      >
                        {sub.name}
                      </h3>
                      {sub.code && (
                        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          SUBJECT CODE: {sub.code}
                        </p>
                      )}
                    </div>

                    <div
                      className="mt-6 pt-3.5 border-t flex items-center justify-between"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <span className="text-xs font-semibold text-emerald-500">
                        View Resources
                      </span>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:translate-x-1 text-emerald-500">
                        <Icons.ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {visibleSubjects.length === 0 && !loading && (
                <div
                  className="col-span-full py-20 text-center rounded-3xl border border-dashed"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Icons.BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-bold">No active subjects with papers found in this stream</p>
                  <p className="text-xs mt-1">Check back soon as new papers are uploaded.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SUBJECT PAPERS ARCHIVE (Unique URL per Subject and Paper Year) */}
      {stream && subjectSlug && (
        <div className="max-w-7xl mx-auto animate__animated animate__fadeIn">
          {/* Controls Sticky Header */}
          <div
            className="sticky top-20 md:top-24 z-30 p-4 md:p-5 mb-8 rounded-2xl md:rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 justify-between md:items-center border backdrop-blur-xl transition-colors"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/papers/${stream}`)}
                className="w-10 h-10 flex items-center justify-center rounded-full border transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-main)'
                }}
                title="Back to Stream Subjects"
                aria-label="Back to Subjects"
              >
                <Icons.ArrowLeft size={16} />
              </button>

              <div>
                <h2
                  className="text-xl md:text-2xl font-extrabold font-heading"
                  style={{ color: 'var(--text-main)' }}
                >
                  {currentSubject ? currentSubject.name : 'Past Papers'}
                </h2>
                <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider">
                  {filteredPapers.length} Papers Available
                </p>
              </div>
            </div>

            {/* Filter & View Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Year Filter Dropdown */}
              <div className="relative">
                <select
                  value={year || 'all'}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="pl-4 pr-9 py-2.5 rounded-xl text-xs font-bold border appearance-none cursor-pointer outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                  aria-label="Filter by Year"
                >
                  <option value="all">All Examination Years</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y} Examination
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
                  <Icons.ChevronDown size={14} />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div
                className="flex p-1 rounded-xl border"
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'hover:text-emerald-500'
                  }`}
                  style={{
                    color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)'
                  }}
                  aria-label="Grid view"
                >
                  <Icons.Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'hover:text-emerald-500'
                  }`}
                  style={{
                    color: viewMode === 'list' ? '#ffffff' : 'var(--text-muted)'
                  }}
                  aria-label="List view"
                >
                  <Icons.List size={16} />
                </button>
              </div>

              {/* Reset Year if Selected */}
              {year && year !== 'all' && (
                <button
                  onClick={() => navigate(`/papers/${stream}/${subjectSlug}`)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <Icons.X size={13} />
                  <span>Clear Year</span>
                </button>
              )}
            </div>
          </div>

          {/* Targeted Year Highlight Banner if URL has :year */}
          {year && year !== 'all' && (
            <div
              className="mb-8 p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate__animated animate__fadeInDown shadow-md"
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--accent)',
                color: 'var(--text-main)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold font-mono">
                  {year}
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    Targeted Examination Year: G.C.E. A/L {year}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Viewing resources for {currentSubject?.name || 'this subject'}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyCurrentUrl(window.location.href, `${year} Paper Link`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Icons.Share2 size={12} />
                  <span>Share {year} Paper</span>
                </button>
                <button
                  onClick={() => navigate(`/papers/${stream}/${subjectSlug}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                >
                  Show All Years
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-52 rounded-3xl animate-pulse border"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)'
                  }}
                ></div>
              ))}
            </div>
          ) : (
            /* Papers Cards Display */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {filteredPapers.map((p, idx) => {
                const isTargetYear = year && p.year.toString() === year;
                const paperDirectUrl = `${window.location.origin}/papers/${stream}/${subjectSlug}/${p.year}`;

                return (
                  <div
                    key={p.id || idx}
                    style={{
                      animationDelay: `${idx * 50}ms`,
                      backgroundColor: 'var(--card-bg)',
                      borderColor: isTargetYear ? 'var(--accent)' : 'var(--border-color)'
                    }}
                    className={`glass rounded-3xl transition-all duration-300 group border animate__animated animate__fadeInUp relative overflow-hidden ${
                      isTargetYear ? 'ring-2 ring-emerald-500/50 shadow-xl' : 'hover:shadow-xl'
                    } ${
                      viewMode === 'grid'
                        ? 'p-7 flex flex-col justify-between hover:-translate-y-1.5'
                        : 'p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'
                    }`}
                  >
                    <div className={viewMode === 'grid' ? 'mb-6' : 'flex items-center gap-5'}>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl border shadow-inner"
                          style={{
                            backgroundColor: 'var(--card-glass)',
                            borderColor: 'var(--border-color)'
                          }}
                        >
                          <span
                            className="text-xl font-bold font-mono"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {p.year}
                          </span>
                          <span className="text-[9px] text-emerald-500 uppercase font-bold tracking-widest">
                            A/L
                          </span>
                        </div>

                        {/* Direct URL Share Icon for this individual paper */}
                        <button
                          onClick={() => copyCurrentUrl(paperDirectUrl, `${p.year} Paper URL`)}
                          className="p-2 rounded-xl border transition-all hover:scale-110 active:scale-95 text-emerald-500"
                          style={{
                            backgroundColor: 'var(--card-glass)',
                            borderColor: 'var(--border-color)'
                          }}
                          title={`Copy direct link for ${p.year} paper`}
                        >
                          <Icons.Share2 size={14} />
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className="font-bold text-base md:text-lg font-heading"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {p.subject_name || currentSubject?.name}
                          </h4>
                          {isTargetYear && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white uppercase tracking-wider shadow-sm">
                              Focused
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          General Examination Archive • Year {p.year}
                        </p>
                      </div>
                    </div>

                    {/* Download Action Buttons */}
                    <div
                      className={`flex flex-wrap gap-2.5 ${
                        viewMode === 'grid' ? 'pt-4 border-t' : ''
                      }`}
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      {p.paper_link ? (
                        <a
                          href={p.paper_link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleDownload(p.id, 'paper', p.subject_name)}
                          className={`flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                            viewMode === 'grid'
                              ? 'flex-1 py-3 bg-blue-600/15 text-blue-500 border-blue-500/30 hover:bg-blue-600 hover:text-white hover:scale-[1.02]'
                              : 'px-4 py-2.5 bg-blue-600/15 text-blue-500 border-blue-500/30 hover:bg-blue-600 hover:text-white'
                          }`}
                        >
                          <Icons.FileText size={15} />
                          <span>Paper PDF</span>
                        </a>
                      ) : null}

                      {p.marking_scheme_link ? (
                        <a
                          href={p.marking_scheme_link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => handleDownload(p.id, 'marking', p.subject_name)}
                          className={`flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                            viewMode === 'grid'
                              ? 'flex-1 py-3 bg-emerald-600/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-600 hover:text-white hover:scale-[1.02]'
                              : 'px-4 py-2.5 bg-emerald-600/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          <Icons.Shield size={15} />
                          <span>Marking Scheme</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {filteredPapers.length === 0 && (
                <div
                  className="col-span-full py-20 text-center rounded-3xl border border-dashed"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Icons.FileText size={44} className="mx-auto mb-3 opacity-40" />
                  <p className="text-xl font-bold">No papers found</p>
                  <p className="text-xs mt-1">
                    {year && year !== 'all'
                      ? `No paper uploaded for ${year}. Try viewing all years.`
                      : 'Try adjusting your search terms.'}
                  </p>
                  {year && year !== 'all' && (
                    <button
                      onClick={() => navigate(`/papers/${stream}/${subjectSlug}`)}
                      className="mt-5 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-md"
                    >
                      View All Available Years
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Search Floating Bar */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40">
            <div
              className="p-2 rounded-full border shadow-2xl backdrop-blur-2xl flex items-center transition-all ring-1 ring-emerald-500/30"
              style={{
                backgroundColor: 'var(--modal-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="pl-4 text-emerald-500">
                <Icons.Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by year or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs sm:text-sm w-full px-3 py-2 outline-none font-medium"
                style={{ color: 'var(--text-main)' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-full mr-1 opacity-70 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                  aria-label="Clear search"
                >
                  <Icons.X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PapersTab;
