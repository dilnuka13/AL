import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { getSriLankaHolidaysForYear } from '../../lib/holidays';
import { useToast } from '../common/Toast';

export const CalendarManager = () => {
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // { date, event }
  const [modalType, setModalType] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase.from('calendar_events').select('*');
      if (error) throw error;
      setAllEvents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const changeMonth = (dir) => {
    setCurrentMonth((prev) => prev.clone().add(dir, 'months'));
  };

  const start = currentMonth.clone().startOf('month').startOf('week');
  const end = currentMonth.clone().endOf('month').endOf('week');
  const currentYear = currentMonth.year();

  // Combine Hardcoded SL holidays with Supabase Custom events
  const slHolidays = getSriLankaHolidaysForYear(currentYear);
  const mergedEvents = {};
  slHolidays.forEach((e) => (mergedEvents[e.date] = e));
  allEvents.forEach((e) => (mergedEvents[e.date] = e));

  const days = [];
  const dayIter = start.clone();
  const today = moment().startOf('day');

  while (dayIter.isBefore(end)) {
    days.push(dayIter.clone());
    dayIter.add(1, 'day');
  }

  const handleOpenEventModal = (dateStr, event) => {
    setSelectedEvent({ date: dateStr, event });
    setModalType(event?.type || '');
    setModalTitle(event?.title || '');
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const { date } = selectedEvent;

    try {
      if (!modalType) {
        // Delete event if set to empty
        await supabase.from('calendar_events').delete().eq('date', date);
        showToast('Event removed', 'success');
      } else {
        await supabase
          .from('calendar_events')
          .upsert({ date, type: modalType, title: modalTitle.trim() });
        showToast('Calendar event updated', 'success');
      }

      setSelectedEvent(null);
      loadEvents();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeIn pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
            <Icons.Calendar className="text-emerald-400" /> Smart Calendar
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Review and schedule Poya days, examination schedules, and holidays.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 shadow-sm">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 w-10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition"
          >
            <Icons.ChevronLeft size={16} />
          </button>
          <span className="px-4 font-bold text-sm text-white w-36 text-center">
            {currentMonth.format('MMMM YYYY')}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 w-10 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-black/40">
        <div className="grid grid-cols-7 gap-3 mb-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {days.map((d) => {
            const dateStr = d.format('YYYY-MM-DD');
            const isCurrentMonth = d.month() === currentMonth.month();
            const isToday = d.isSame(today, 'day');
            const event = mergedEvents[dateStr];

            let cellClass = 'bg-black/30 border-white/5';
            let dotClass = 'border-white/10 text-gray-300';
            let textColor = isCurrentMonth ? 'text-white' : 'text-gray-600';

            if (event) {
              if (event.type === 'holiday' || event.type === 'public') {
                cellClass = 'bg-red-500/10 border-red-500/30';
                textColor = 'text-red-400';
                dotClass = 'bg-red-500/20 text-red-300 border-red-500/30';
              } else if (event.type === 'poya') {
                cellClass = 'bg-yellow-500/10 border-yellow-500/30';
                textColor = 'text-yellow-400';
                dotClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
              } else if (event.type === 'bank') {
                cellClass = 'bg-blue-500/10 border-blue-500/30';
                textColor = 'text-blue-400';
                dotClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
              } else if (event.type === 'special') {
                cellClass = 'bg-emerald-500/10 border-emerald-500/30';
                textColor = 'text-emerald-400';
                dotClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
              }
            } else if (d.format('d') === '0' && isCurrentMonth) {
              textColor = 'text-red-400';
            }

            return (
              <div
                key={dateStr}
                onClick={() => handleOpenEventModal(dateStr, event)}
                className={`calendar-day-cell min-h-[75px] md:min-h-[85px] p-2 rounded-2xl border transition-all ${cellClass} ${
                  isToday ? 'today ring-2 ring-emerald-500' : ''
                } ${!isCurrentMonth ? 'opacity-40' : ''}`}
              >
                <span className={`text-base font-extrabold mb-1 ${textColor}`}>
                  {d.format('D')}
                </span>
                {event && (
                  <span
                    className={`text-[9px] w-full text-center px-1.5 py-1 rounded-lg border font-bold truncate leading-tight mt-auto ${dotClass}`}
                  >
                    {event.title}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Edit Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate__animated animate__fadeIn">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl bg-[#0c101a] border border-white/10 animate__animated animate__zoomIn">
            <h3 className="font-bold text-lg text-white mb-2">Edit Day Event</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">{selectedEvent.date}</p>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <select
                value={modalType}
                onChange={(e) => setModalType(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white outline-none text-sm"
              >
                <option value="">No Event (Clear)</option>
                <option value="holiday">Public Holiday (Red)</option>
                <option value="poya">Poya Day (Yellow)</option>
                <option value="bank">Bank Holiday (Blue)</option>
                <option value="special">Special Event (Green)</option>
              </select>

              {modalType && (
                <input
                  type="text"
                  placeholder="Event Headline / Description"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/60 border border-white/10 text-white outline-none text-sm"
                  required
                />
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManager;
