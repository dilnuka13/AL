import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { useToast } from '../common/Toast';

export const TimetablesManager = () => {
  const [ttYear, setTtYear] = useState('');
  const [ttLink, setTtLink] = useState('');
  const [examDates, setExamDates] = useState([]);

  // Add Date Form
  const [newDate, setNewDate] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newType, setNewType] = useState('Exam');

  const { showToast } = useToast();

  useEffect(() => {
    loadTimetables();
  }, []);

  const loadTimetables = async () => {
    try {
      // 1. PDF Settings
      const { data: setting } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'timetable_pdf')
        .maybeSingle();

      if (setting?.value) {
        setTtYear(setting.value.year || '');
        setTtLink(setting.value.link || '');
      }

      // 2. Dates
      const { data: dates } = await supabase
        .from('exam_dates')
        .select('*')
        .order('date', { ascending: true });

      setExamDates(dates || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePdf = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('system_settings').upsert({
        key: 'timetable_pdf',
        value: { year: ttYear.trim(), link: ttLink.trim() }
      });
      if (error) throw error;
      showToast('Timetable PDF details updated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddDate = async (e) => {
    e.preventDefault();
    if (!newDate || !newDetails.trim()) return;

    try {
      const { error } = await supabase.from('exam_dates').insert({
        date: newDate,
        details: newDetails.trim(),
        type: newType
      });
      if (error) throw error;

      showToast('Exam date added', 'success');
      setNewDate('');
      setNewDetails('');
      loadTimetables();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteDate = async (id) => {
    try {
      const { error } = await supabase.from('exam_dates').delete().eq('id', id);
      if (error) throw error;
      showToast('Date removed', 'success');
      loadTimetables();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeIn pb-16">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
          <Icons.FileText className="text-blue-400" /> Exam Schedules & Time Tables
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Publish official timetable documents and key examination schedule dates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timetable PDF Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-black/40 h-fit">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
            <i className="fas fa-file-pdf text-red-500"></i> Main Examination Time Table PDF
          </h3>
          <form onSubmit={handleSavePdf} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                Year / Description
              </label>
              <input
                type="text"
                placeholder="e.g. 2025/2026 A/L"
                value={ttYear}
                onChange={(e) => setTtYear(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-blue-500 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                Direct PDF URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={ttLink}
                onChange={(e) => setTtLink(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-blue-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all text-sm"
            >
              Update Timetable PDF
            </button>
          </form>
        </div>

        {/* Key Dates Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-black/40">
          <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
            <i className="fas fa-calendar-day text-emerald-400"></i> Important Exam Dates
          </h3>

          <form onSubmit={handleAddDate} className="space-y-3 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="p-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
                required
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="p-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
              >
                <option value="Exam">Exam</option>
                <option value="Holiday">Off / Holiday</option>
              </select>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-emerald-900/20"
              >
                <Icons.Check size={14} /> Add Date
              </button>
            </div>
            <input
              type="text"
              placeholder="Event headline (e.g. Physics Paper I & II)"
              value={newDetails}
              onChange={(e) => setNewDetails(e.target.value)}
              className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-emerald-500"
              required
            />
          </form>

          {/* List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {examDates.map((d) => (
              <div
                key={d.id}
                className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl font-bold text-[10px] leading-tight text-center ${
                      d.type === 'Exam'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    <span>{moment(d.date).format('MMM')}</span>
                    <span className="text-xs">{moment(d.date).format('DD')}</span>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium leading-tight">{d.details}</p>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {moment(d.date).format('YYYY')} • {d.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDate(d.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete date"
                >
                  <Icons.Trash2 size={14} />
                </button>
              </div>
            ))}
            {examDates.length === 0 && (
              <div className="text-center text-gray-500 py-8 text-xs">
                No key exam dates added yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetablesManager;
