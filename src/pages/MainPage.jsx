import React, { useState, useEffect } from 'react';
import Header from '../components/main/Header';
import Footer from '../components/main/Footer';
import HomeTab from '../components/main/HomeTab';
import PapersTab from '../components/main/PapersTab';
import ResultsTab from '../components/main/ResultsTab';
import TimetablesTab from '../components/main/TimetablesTab';
import NoticesTab from '../components/main/NoticesTab';
import AppsTab from '../components/main/AppsTab';
import BackgroundEffects from '../components/common/BackgroundEffects';
import supabase from '../lib/supabase';

export const MainPage = ({ tab = 'home' }) => {
  const [notices, setNotices] = useState([]);
  const [examDates, setExamDates] = useState([]);
  const [sysUpdateMsg, setSysUpdateMsg] = useState(null);
  const [timetablePdf, setTimetablePdf] = useState(null);
  const [appLinks, setAppLinks] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // 1. Announcements
      const { data: updateData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'system_update')
        .maybeSingle();
      if (updateData?.value?.active) setSysUpdateMsg(updateData.value);

      // 2. Timetable PDF
      const { data: ttData } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'timetable_pdf')
        .maybeSingle();
      if (ttData?.value) setTimetablePdf(ttData.value);

      // 3. Notices
      const { data: noticesData } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (noticesData) setNotices(noticesData);

      // 4. Exam Dates
      const { data: datesData } = await supabase
        .from('exam_dates')
        .select('*')
        .order('date', { ascending: true });
      if (datesData) setExamDates(datesData);

      // 5. Apps
      const { data: appsData } = await supabase
        .from('app_downloads')
        .select('*')
        .order('created_at', { ascending: false });
      if (appsData) setAppLinks(appsData);
    } catch (e) {
      console.error('Failed to load initial data:', e);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen font-sans relative transition-colors duration-300"
      style={{
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-main)'
      }}
    >
      <div className="no-print">
        <BackgroundEffects />
        <Header />
      </div>

      <main className="flex-grow pt-28 md:pt-36 pb-20 container mx-auto px-4 md:px-6 z-10 relative">
        <div key={tab} className="section-animate">
          {tab === 'home' && <HomeTab sysUpdateMsg={sysUpdateMsg} />}
          {tab === 'papers' && <PapersTab />}
          {tab === 'results' && <ResultsTab />}
          {tab === 'timetables' && (
            <TimetablesTab timetablePdf={timetablePdf} examDates={examDates} />
          )}
          {tab === 'notices' && <NoticesTab notices={notices} />}
          {tab === 'apps' && <AppsTab appLinks={appLinks} />}
        </div>
      </main>

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

export default MainPage;
