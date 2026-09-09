import moment from 'moment';

export const SRI_LANKAN_HOLIDAYS_MAP = {
  '2025-01-13': { name: 'Duruthu Full Moon Poya', type: 'poya' },
  '2025-01-14': { name: 'Tamil Thai Pongal', type: 'public' },
  '2025-02-04': { name: 'Independence Day', type: 'public' },
  '2025-02-12': { name: 'Navam Full Moon Poya', type: 'poya' },
  '2025-02-26': { name: 'Mahasivarathri Day', type: 'public' },
  '2025-03-13': { name: 'Madin Full Moon Poya', type: 'poya' },
  '2025-04-11': { name: 'Sinhala & Tamil New Year Eve', type: 'public' },
  '2025-04-12': { name: 'Sinhala & Tamil New Year', type: 'public' },
  '2025-04-13': { name: 'Bak Full Moon Poya', type: 'poya' },
  '2025-05-01': { name: 'May Day', type: 'public' },
  '2025-05-12': { name: 'Vesak Full Moon Poya', type: 'poya' },
  '2025-05-13': { name: 'Day following Vesak', type: 'public' },
  '2025-06-10': { name: 'Poson Full Moon Poya', type: 'poya' },
  '2025-07-10': { name: 'Esala Full Moon Poya', type: 'poya' },
  '2025-08-08': { name: 'Nikini Full Moon Poya', type: 'poya' },
  '2025-09-07': { name: 'Binara Full Moon Poya', type: 'poya' },
  '2025-10-06': { name: 'Vap Full Moon Poya', type: 'poya' },
  '2025-11-05': { name: 'Il Full Moon Poya', type: 'poya' },
  '2025-12-04': { name: 'Unduvap Full Moon Poya', type: 'poya' },
  '2025-12-25': { name: 'Christmas Day', type: 'public' },

  // 2026 Support
  '2026-01-03': { name: 'Duruthu Full Moon Poya', type: 'poya' },
  '2026-01-14': { name: 'Tamil Thai Pongal', type: 'public' },
  '2026-02-01': { name: 'Navam Full Moon Poya', type: 'poya' },
  '2026-02-04': { name: 'Independence Day', type: 'public' },
  '2026-03-03': { name: 'Madin Full Moon Poya', type: 'poya' },
  '2026-04-02': { name: 'Bak Full Moon Poya', type: 'poya' },
  '2026-04-13': { name: 'Sinhala & Tamil New Year Eve', type: 'public' },
  '2026-04-14': { name: 'Sinhala & Tamil New Year', type: 'public' },
  '2026-05-01': { name: 'May Day & Vesak Poya', type: 'poya' },
  '2026-05-02': { name: 'Day following Vesak', type: 'public' },
  '2026-05-31': { name: 'Adhi Poson Poya', type: 'poya' },
  '2026-06-29': { name: 'Poson Full Moon Poya', type: 'poya' },
  '2026-07-29': { name: 'Esala Full Moon Poya', type: 'poya' },
  '2026-08-27': { name: 'Nikini Full Moon Poya', type: 'poya' },
  '2026-09-26': { name: 'Binara Full Moon Poya', type: 'poya' },
  '2026-10-25': { name: 'Vap Full Moon Poya', type: 'poya' },
  '2026-11-24': { name: 'Il Full Moon Poya', type: 'poya' },
  '2026-12-23': { name: 'Unduvap Full Moon Poya', type: 'poya' },
  '2026-12-25': { name: 'Christmas Day', type: 'public' },
};

export function getSriLankaHolidaysForYear(year) {
  const result = [];
  Object.entries(SRI_LANKAN_HOLIDAYS_MAP).forEach(([dateStr, item]) => {
    if (moment(dateStr).year() === year) {
      result.push({
        date: dateStr,
        title: item.name,
        type: item.type === 'poya' ? 'poya' : 'holiday'
      });
    }
  });
  return result;
}
