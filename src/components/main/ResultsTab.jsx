import React, { useState, useEffect, useRef } from 'react';
import Icons from '../common/Icons';
import usePageTitle from '../../hooks/usePageTitle';
import { useToast } from '../common/Toast';
import { fetchActiveExamDetails, queryExaminationResult } from '../../services/resultsService';

export const ResultsTab = () => {
  usePageTitle('Official Examination Results Verification | DE Education.lk');
  const { showToast } = useToast();

  // Mode: 'native' (DE Custom Result Slip) | 'live' (Embedded Doenets Portal)
  const [viewMode, setViewMode] = useState('native');

  // Form States
  const [examType, setExamType] = useState('al'); // 'al' | 'ol' | 'gv'
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchType, setSearchType] = useState('index'); // 'index' | 'nic'
  const [inputValue, setInputValue] = useState('');
  
  // Real hCaptcha Integration State
  const [hcaptchaToken, setHcaptchaToken] = useState('');
  const hcaptchaRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Result & Processing States
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [activeExams, setActiveExams] = useState(null);

  const printRef = useRef(null);

  useEffect(() => {
    loadExamReleases();

    // Initialize official hCaptcha widget with Doenets sitekey
    const setupHcaptcha = () => {
      if (window.hcaptcha && hcaptchaRef.current && widgetIdRef.current === null) {
        try {
          widgetIdRef.current = window.hcaptcha.render(hcaptchaRef.current, {
            sitekey: '883479e0-e276-482c-915f-00b65eaa4356',
            theme: 'dark',
            callback: (token) => {
              setHcaptchaToken(token);
              setErrorMessage(null);
            },
            'expired-callback': () => {
              setHcaptchaToken('');
            }
          });
        } catch (err) {
          console.warn('hCaptcha initialization error:', err);
        }
      }
    };

    if (window.hcaptcha) {
      setupHcaptcha();
    } else {
      const interval = setInterval(() => {
        if (window.hcaptcha) {
          clearInterval(interval);
          setupHcaptcha();
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  const loadExamReleases = async () => {
    const data = await fetchActiveExamDetails();
    setActiveExams(data);
    if (data?.al?.year) {
      setSelectedYear(data.al.year);
    }
  };

  // Switch year default when exam type changes
  const handleExamTypeChange = (type) => {
    setExamType(type);
    if (activeExams) {
      if (type === 'al' && activeExams.al?.year) setSelectedYear(activeExams.al.year);
      if (type === 'ol' && activeExams.ol?.year) setSelectedYear(activeExams.ol.year);
      if (type === 'gv' && activeExams.scholarship?.year) setSelectedYear(activeExams.scholarship.year);
    }
    setResultData(null);
    setErrorMessage(null);
  };

  // Form submission handler (Query real Doenets records without fake/mock fallback)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const val = inputValue.trim();
    if (!val) {
      return showToast(
        searchType === 'index' ? 'Please enter candidate index number' : 'Please enter NIC number',
        'error'
      );
    }

    // Input format validation
    if (searchType === 'index' && !/^[0-9]{6,8}$/.test(val)) {
      return showToast('Index number should be a 6 to 8 digit number.', 'error');
    }

    if (searchType === 'nic' && !/^([0-9]{12}|[0-9]{9}[vVxX])$/.test(val)) {
      return showToast('Invalid NIC format. Enter 9 digits with V/X or 12 digits.', 'error');
    }

    setIsLoading(true);
    try {
      const result = await queryExaminationResult({
        examType,
        searchType,
        queryValue: val,
        captchaToken: hcaptchaToken
      });

      if (result.success) {
        setResultData(result);
        showToast('Official result record retrieved successfully!', 'success');
      } else {
        setResultData(null);
        const err = result.error || '';
        if (err.toLowerCase().includes('sitekey') || err.toLowerCase().includes('captcha')) {
          setErrorMessage(
            'විභාග දෙපාර්තමේන්තුවේ ආරක්ෂණ ප්‍රතිපත්තිය (hCaptcha Domain Security) අනුව මෙම විමසුම සෘජුවම නිල පද්ධතියෙන් සත්‍යාපනය විය යුතුය. සජීවී නිල ප්‍රතිඵලය බැලීමට පහත Live Portal View එකට මාරු වන්න.'
          );
        } else {
          setErrorMessage(err || 'විභාග දෙපාර්තමේන්තු දත්ත ගබඩාවේ මෙම අංකයට අදාළ ප්‍රතිඵලයක් හමු නොවීය.');
        }
        showToast(result.error || 'Record not found', 'error');
      }
    } catch (err) {
      console.error(err);
      setResultData(null);
      setErrorMessage(
        'විභාග දෙපාර්තමේන්තු සර්වරයට සම්බන්ධ වීමේ දෝෂයකි. කරුණාකර Live Portal View එක භාවිතා කරන්න.'
      );
      showToast('Error connecting to examination server', 'error');
    } finally {
      setIsLoading(false);
      if (window.hcaptcha && widgetIdRef.current !== null) {
        try {
          window.hcaptcha.reset(widgetIdRef.current);
          setHcaptchaToken('');
        } catch {}
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyResult = () => {
    if (!resultData) return;
    const text = `=== G.C.E. A/L RESULT VERIFICATION ===\nName: ${resultData.name}\nIndex: ${resultData.indexNo}\nZ-Score: ${resultData.zScore || 'N/A'}\nIsland Rank: ${resultData.islandRank || 'N/A'}\nDistrict Rank: ${resultData.districtRank || 'N/A'}\nStream: ${resultData.stream || 'N/A'}\nVerified via DE Education.lk`;
    navigator.clipboard.writeText(text);
    showToast('Result summary copied to clipboard!', 'success');
  };

  const getGradeBadge = (grade) => {
    const g = (grade || '').trim().toUpperCase();
    if (g === 'A') {
      return (
        <span className="grade-badge px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm print:border-emerald-800 print:bg-emerald-50 print:text-emerald-900">
          A - Distinction
        </span>
      );
    }
    if (g === 'B') {
      return (
        <span className="grade-badge px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm print:border-blue-800 print:bg-blue-50 print:text-blue-900">
          B - Very Good
        </span>
      );
    }
    if (g === 'C') {
      return (
        <span className="grade-badge px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm print:border-amber-800 print:bg-amber-50 print:text-amber-900">
          C - Credit
        </span>
      );
    }
    if (g === 'S') {
      return (
        <span className="grade-badge px-3 py-1 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-sm print:border-purple-800 print:bg-purple-50 print:text-purple-900">
          S - Simple Pass
        </span>
      );
    }
    if (g === 'F') {
      return (
        <span className="grade-badge px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-400 border border-red-500/30 shadow-sm print:border-red-800 print:bg-red-50 print:text-red-900">
          F - Fail
        </span>
      );
    }
    return (
      <span className="grade-badge px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-gray-200 border border-white/10 print:border-slate-800 print:text-slate-900">
        {grade || 'PASS'}
      </span>
    );
  };

  const getGradeTitle = (grade) => {
    const g = (grade || '').trim().toUpperCase();
    if (g === 'A') return 'Distinction (විශිෂ්ට සාමාර්ථ)';
    if (g === 'B') return 'Very Good (අතිසාමාර්ථ)';
    if (g === 'C') return 'Credit (සම්මාන සාමාර්ථ)';
    if (g === 'S') return 'Simple Pass (සාමාන්‍ය සාමාර්ථ)';
    if (g === 'F') return 'Fail (අසමත්)';
    return 'Pass (සාමාර්ථ)';
  };

  const yearsList = ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 animate__animated animate__fadeIn">
      {/* Top Header & Mode Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b no-print print:hidden" style={{ borderColor: 'var(--border-color)' }}>
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Icons.Shield size={13} /> Official Examination Verification
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight" style={{ color: 'var(--text-main)' }}>
            Examination Results Portal
          </h1>
          <p className="text-xs sm:text-sm mt-1 font-light" style={{ color: 'var(--text-muted)' }}>
            Department of Examinations Sri Lanka (Doenets) Official Verification Service
          </p>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center p-1 rounded-2xl border backdrop-blur-md" style={{ backgroundColor: 'var(--card-glass)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setViewMode('native')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'native'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.FileText size={13} />
            <span>DE Result Slip</span>
          </button>
          <button
            onClick={() => setViewMode('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'live'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icons.Globe size={13} />
            <span>Live Portal View</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: NATIVE DE RESULT SLIP UI */}
      {viewMode === 'native' && (
        <div className="space-y-8">
          {/* SEARCH & VERIFICATION FORM CARD */}
          {!resultData && (
            <div
              className="p-6 sm:p-8 md:p-10 rounded-3xl border glass transition-all shadow-xl max-w-3xl mx-auto no-print print:hidden"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)'
              }}
            >
              <form onSubmit={handleSearchSubmit} className="space-y-6">
                {/* 1. Exam Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-main)' }}>
                    1. Select Examination (විභාගය තෝරන්න)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleExamTypeChange('al')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        examType === 'al'
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10 font-bold'
                          : 'border-white/10 hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <span className="text-xs font-bold block">G.C.E. (A/L) Exam</span>
                      <span className="text-[10px] opacity-75 mt-1 block">උසස් පෙළ විභාගය</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExamTypeChange('ol')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        examType === 'ol'
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10 font-bold'
                          : 'border-white/10 hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <span className="text-xs font-bold block">G.C.E. (O/L) Exam</span>
                      <span className="text-[10px] opacity-75 mt-1 block">සාමාන්‍ය පෙළ විභාගය</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExamTypeChange('gv')}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        examType === 'gv'
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400 shadow-md shadow-emerald-500/10 font-bold'
                          : 'border-white/10 hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      <span className="text-xs font-bold block">Grade 5 Scholarship</span>
                      <span className="text-[10px] opacity-75 mt-1 block">5 ශ්‍රේණිය ශිෂ්‍යත්වය</span>
                    </button>
                  </div>
                </div>

                {/* 2. Year & Search Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-main)' }}>
                      2. Examination Year (වර්ෂය)
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border bg-black/40 text-sm font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                      style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--input-bg)'
                      }}
                    >
                      {yearsList.map((yr) => (
                        <option key={yr} value={yr} className="bg-slate-900 text-white">
                          {yr} Examination
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-main)' }}>
                      3. Search Identifier Type
                    </label>
                    <div className="flex items-center p-1 rounded-xl border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--input-bg)' }}>
                      <button
                        type="button"
                        onClick={() => setSearchType('index')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          searchType === 'index'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Index No
                      </button>
                      <button
                        type="button"
                        onClick={() => setSearchType('nic')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                          searchType === 'nic'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        NIC Number
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Input Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-main)' }}>
                    {searchType === 'index'
                      ? '4. Candidate Index Number (විභාග අංකය)'
                      : '4. Candidate NIC Number (ජාතික හැඳුනුම්පත් අංකය)'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-500">
                      <Icons.Search size={18} />
                    </div>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={
                        searchType === 'index'
                          ? 'Enter 7-digit Index Number (e.g. 1000039)'
                          : 'Enter NIC Number (e.g. 200506161234 or 951234567V)'
                      }
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm font-mono tracking-wide focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
                      style={{
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--input-bg)'
                      }}
                      required
                    />
                    {inputValue && (
                      <button
                        type="button"
                        onClick={() => setInputValue('')}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white"
                      >
                        <Icons.X size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1.5 font-light">
                    <i className="fas fa-info-circle text-emerald-500"></i>
                    {searchType === 'index'
                      ? 'Official 6 to 8 digit examination admission index number.'
                      : 'Old NIC format (9 digits + V) or New NIC format (12 digits).'}
                  </p>
                </div>

                {/* 4. Security Verification (Official Doenets hCaptcha) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-main)' }}>
                    4. Security Verification (ආරක්ෂණ තහවුරු කිරීම)
                  </label>
                  <div className="p-4 rounded-2xl border bg-white/5 flex flex-col items-center justify-center min-h-[90px]" style={{ borderColor: 'var(--border-color)' }}>
                    <div ref={hcaptchaRef} id="hcaptcha-widget" className="scale-95 sm:scale-100"></div>
                    <p className="text-[10px] text-gray-500 font-mono mt-2">
                      Department of Examinations (Doenets) Cloud Security Verification
                    </p>
                  </div>
                </div>

                {/* Error Notice Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate__animated animate__fadeIn">
                    <div className="flex items-start gap-3">
                      <Icons.AlertTriangle size={18} className="shrink-0 text-amber-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold">Notice from Examination Service</p>
                        <p className="mt-1 leading-relaxed opacity-90">{errorMessage}</p>
                        <button
                          type="button"
                          onClick={() => setViewMode('live')}
                          className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 text-xs transition-all shadow-md active:scale-95"
                        >
                          <Icons.Globe size={13} />
                          <span>Live Doenets Portal එකට මාරු වන්න (සෘජු සත්‍යාපනය)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 transition-all hover:shadow-xl hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span>Verifying with Examination Database...</span>
                    </>
                  ) : (
                    <>
                      <Icons.Search size={16} />
                      <span>Check Examination Results (ප්‍රතිඵල පරීක්ෂා කරන්න)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* OFFICIAL RESULT SLIP UI (DISPLAYED UPON SUCCESSFUL QUERY) */}
          {resultData && (
            <div className="animate__animated animate__zoomIn">
              {/* Action Toolbar (Hidden during print) */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print print:hidden">
                <button
                  onClick={() => {
                    setResultData(null);
                    setErrorMessage(null);
                    setInputValue('');
                  }}
                  className="px-4 py-2.5 rounded-xl border hover:bg-white/10 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                  style={{
                    backgroundColor: 'var(--card-glass)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)'
                  }}
                >
                  <Icons.ArrowLeft size={14} />
                  <span>Search Another Candidate</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleCopyResult}
                    className="px-4 py-2.5 rounded-xl border hover:bg-white/10 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
                    style={{
                      backgroundColor: 'var(--card-glass)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)'
                    }}
                  >
                    <Icons.Copy size={14} />
                    <span>Copy Summary</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-95"
                  >
                    <Icons.Printer size={15} />
                    <span>Print Result Sheet (ප්‍රතිඵල පත්‍රය මුද්‍රණය)</span>
                  </button>
                </div>
              </div>

              {/* Printable Result Slip Card - Authentic Sri Lanka Examination Certificate */}
              <div
                id="official-print-result-sheet"
                ref={printRef}
                className="official-result-sheet p-6 sm:p-10 md:p-12 rounded-[2.5rem] border glass relative overflow-hidden shadow-2xl transition-colors print:rounded-none print:shadow-none print:border-solid print:p-6"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)'
                }}
              >
                {/* Certificate Background Watermark (Screen only) */}
                <div className="absolute -right-16 -bottom-16 opacity-[0.025] pointer-events-none no-print">
                  <i className="fas fa-award text-[28rem]"></i>
                </div>

                {/* Top Header with National Emblem of Sri Lanka & Trilingual Dept Titles */}
                <div className="text-center pb-6 border-b relative z-10 print:border-slate-600 print:pb-4" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src="/emblem-sri-lanka.svg"
                      alt="ශ්‍රී ලංකා රාජ්‍ය ලාංඡනය"
                      className="w-16 h-20 sm:w-20 sm:h-24 object-contain mb-3 drop-shadow-sm print:w-16 print:h-20 mx-auto"
                    />
                    <h2 className="text-base sm:text-lg md:text-xl font-bold font-heading tracking-wide leading-tight" style={{ color: 'var(--text-main)' }}>
                      ශ්‍රී ලංකා විභාග දෙපාර්තමේන්තුව
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold tracking-wider opacity-90 font-heading leading-tight mt-0.5">
                      இலங்கை பரீட்சைத் திணைக்களம்
                    </p>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold font-heading tracking-widest uppercase mt-0.5" style={{ color: 'var(--text-main)' }}>
                      DEPARTMENT OF EXAMINATIONS, SRI LANKA
                    </h3>

                    <div className="my-3 w-36 h-[2px] bg-gradient-to-r from-transparent via-emerald-600 to-transparent print:bg-slate-700"></div>

                    <div className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 print:border-slate-700 print:bg-slate-100 text-[11px] sm:text-xs font-black tracking-wider uppercase text-emerald-400 print:text-slate-900">
                      විභාග ප්‍රතිඵල ලේඛනය • பரீட்சைப் பெறுபேற்று ஆவணம் • STATEMENT OF RESULTS
                    </div>

                    <p className="text-sm sm:text-base md:text-lg font-black tracking-wide uppercase mt-2.5 text-emerald-500 print:text-slate-900">
                      {resultData.examination || 'G.C.E. (ADVANCED LEVEL) EXAMINATION'} — {resultData.year}
                    </p>
                    <span className="text-[10px] font-mono text-gray-500 print:text-slate-600 mt-0.5 block">
                      Official Performance Verification Certificate • DE Education Sri Lanka
                    </span>
                  </div>
                </div>

                {/* Candidate Particulars Box */}
                <div
                  className="info-box rounded-2xl border p-4 sm:p-5 my-5 text-xs sm:text-sm print:my-4 print:p-3.5 print:bg-slate-50 print:border-slate-400"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--card-glass)'
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="font-bold text-gray-500 print:text-slate-700 min-w-[155px] text-[11px] sm:text-xs uppercase">
                        අපේක්ෂකයාගේ නම / Name:
                      </span>
                      <span className="font-black text-sm tracking-wide uppercase" style={{ color: 'var(--text-main)' }}>
                        {resultData.name}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="font-bold text-gray-500 print:text-slate-700 min-w-[155px] text-[11px] sm:text-xs uppercase">
                        විභාග අංකය / Index No:
                      </span>
                      <span className="font-mono font-black text-sm text-emerald-400 print:text-slate-900">
                        {resultData.indexNo}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="font-bold text-gray-500 print:text-slate-700 min-w-[155px] text-[11px] sm:text-xs uppercase">
                        ජා.හැ. අංකය / NIC No:
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm" style={{ color: 'var(--text-main)' }}>
                        {resultData.nic || 'Verified Record'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="font-bold text-gray-500 print:text-slate-700 min-w-[155px] text-[11px] sm:text-xs uppercase">
                        විෂය ධාරාව / Stream:
                      </span>
                      <span className="font-bold text-xs sm:text-sm text-teal-400 print:text-slate-900 uppercase">
                        {resultData.stream || 'GENERAL STREAM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overall Performance Summary (Z-Score & Ranks) */}
                {resultData.zScore && (
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 my-5 print:my-3">
                    <div className="metric-card p-3 sm:p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center print:bg-slate-50 print:border-slate-400">
                      <span className="text-[10px] sm:text-xs font-bold text-emerald-500 print:text-slate-700 uppercase tracking-widest block">
                        Z - අගය / Final Z-Score
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono block mt-1 print:text-slate-900">
                        {resultData.zScore}
                      </span>
                    </div>

                    <div className="metric-card p-3 sm:p-4 rounded-2xl bg-white/5 border text-center print:bg-slate-50 print:border-slate-400" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 print:text-slate-700 uppercase tracking-widest block">
                        දිවයිනේ කුසලතාව / Island Rank
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono block mt-1" style={{ color: 'var(--text-main)' }}>
                        {resultData.islandRank || '—'}
                      </span>
                    </div>

                    <div className="metric-card p-3 sm:p-4 rounded-2xl bg-white/5 border text-center print:bg-slate-50 print:border-slate-400" style={{ borderColor: 'var(--border-color)' }}>
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 print:text-slate-700 uppercase tracking-widest block">
                        දිස්ත්‍රික් කුසලතාව / District Rank
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono block mt-1" style={{ color: 'var(--text-main)' }}>
                        {resultData.districtRank || '—'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Subject Performance Breakdown Table */}
                <div className="my-5 print:my-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                    <Icons.FileText size={14} className="text-emerald-500" />
                    <span>විෂයය අනුව කාර්යසාධන වාර්තාව / Subject Performance Breakdown</span>
                  </h4>

                  <div className="overflow-x-auto rounded-2xl border print:rounded-none print:border-slate-400" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-glass)' }}>
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b bg-white/5 text-gray-400 uppercase text-[10px] sm:text-xs tracking-wider print:bg-slate-100 print:text-slate-900" style={{ borderColor: 'var(--border-color)' }}>
                          <th className="py-2.5 px-3 sm:px-4 w-12 text-center font-bold">#</th>
                          <th className="py-2.5 px-3 sm:px-4 font-bold">විෂයය / Subject Name</th>
                          <th className="py-2.5 px-3 sm:px-4 text-center w-28 sm:w-36 font-bold">ප්‍රතිඵලය / Grade</th>
                          <th className="py-2.5 px-3 sm:px-4 text-right font-bold hidden sm:table-cell">කාර්යසාධනය / Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y print:divide-slate-300" style={{ borderColor: 'var(--border-color)' }}>
                        {resultData.subjectResults && resultData.subjectResults.length > 0 ? (
                          resultData.subjectResults.map((sub, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors print:bg-white">
                              <td className="py-2.5 px-3 sm:px-4 text-center font-mono text-gray-500 print:text-slate-700 font-bold">
                                {i + 1}
                              </td>
                              <td className="py-2.5 px-3 sm:px-4 font-bold tracking-wide" style={{ color: 'var(--text-main)' }}>
                                {sub.subjectName}
                              </td>
                              <td className="py-2.5 px-3 sm:px-4 text-center">
                                {getGradeBadge(sub.subjectResult)}
                              </td>
                              <td className="py-2.5 px-3 sm:px-4 text-right text-xs text-gray-400 print:text-slate-700 hidden sm:table-cell font-medium">
                                {getGradeTitle(sub.subjectResult)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-6 text-center text-gray-500 italic">
                              No individual subjects recorded.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Official Authentication, Digital Seal & Signatures Block */}
                <div className="pt-5 border-t print:border-slate-400 print:pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center" style={{ borderColor: 'var(--border-color)' }}>
                  {/* Left: Security Verification QR Code */}
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-emerald-500/30 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm print:border-slate-700">
                      <i className="fas fa-qrcode text-2xl sm:text-3xl text-slate-900"></i>
                    </div>
                    <div className="text-[10px] leading-snug text-gray-500 print:text-slate-700">
                      <span className="font-black text-emerald-500 print:text-slate-900 block">DIGITALLY VERIFIED</span>
                      <span className="font-mono block mt-0.5 font-bold">REF: DOENETS-{resultData.year}-{resultData.indexNo}</span>
                      <span className="block opacity-80 mt-0.5">Official Examination Record</span>
                    </div>
                  </div>

                  {/* Center: Department Seal Stamp */}
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-dashed border-emerald-500/40 print:border-slate-700 flex items-center justify-center p-1 shadow-sm">
                      <div className="w-full h-full rounded-full border border-emerald-500/30 print:border-slate-600 flex flex-col items-center justify-center text-[7px] font-black uppercase text-emerald-500 print:text-slate-900 leading-tight">
                        <span>EXAM DEPT</span>
                        <i className="fas fa-stamp text-[10px] my-0.5"></i>
                        <span>SRI LANKA</span>
                      </div>
                    </div>
                    <span className="text-[8px] font-bold text-gray-500 print:text-slate-600 uppercase mt-1">Official Digital Stamp</span>
                  </div>

                  {/* Right: Commissioner General Signature Representation */}
                  <div className="flex flex-col items-center sm:items-end justify-center text-center sm:text-right">
                    <div className="h-8 w-44 flex items-center justify-center sm:justify-end border-b border-gray-500/40 print:border-slate-700 mb-1">
                      <span className="font-serif italic text-base text-emerald-400 print:text-slate-900 font-bold tracking-wider">
                        H.J.M.C. Amith Jayasundara
                      </span>
                    </div>
                    <span className="text-[10px] font-bold block" style={{ color: 'var(--text-main)' }}>
                      විභාග කොමසාරිස් ජනරාල්
                    </span>
                    <span className="text-[9px] text-gray-500 print:text-slate-700 uppercase block">
                      Commissioner General of Examinations
                    </span>
                  </div>
                </div>

                {/* Bottom Legal Notice & Disclaimer */}
                <div className="mt-4 pt-3 border-t text-[10px] text-gray-500 print:text-slate-600 text-center leading-relaxed print:border-slate-400" style={{ borderColor: 'var(--border-color)' }}>
                  <p>
                    සටහන: මෙම ප්‍රතිඵල ලේඛනය ප්‍රතිඵල දැනගැනීම සඳහා පමණක් නිකුත් කෙරෙන අතර මෙය නිල සහතිකයක් නොවේ. විශ්වවිද්‍යාල ප්‍රවේශය හෝ ආයතනික කටයුතු සඳහා විභාග දෙපාර්තමේන්තුව විසින් නිකුත් කරන ලද නිල සහතික පත්‍රය ඉදිරිපත් කළ යුතුය.
                  </p>
                  <p className="mt-0.5 opacity-80">
                    This statement of results is computer-generated for verification purposes only. Issued on {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: EMBEDDED LIVE PORTAL VIEW (NO REDIRECTS) - Hidden on Print */}
      {viewMode === 'live' && (
        <div className="space-y-4 animate__animated animate__fadeIn no-print print:hidden">
          <div className="p-4 rounded-2xl bg-white/5 border text-xs flex items-center justify-between gap-4" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Icons.Globe size={16} />
              </div>
              <div>
                <p className="font-bold" style={{ color: 'var(--text-main)' }}>Live Doenets Verification Window</p>
                <p className="text-[11px] text-gray-400">Direct Department of Examinations verification frame with full interactive hCaptcha support.</p>
              </div>
            </div>

            <a
              href="https://doenets.lk/examresults"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Open in New Window</span>
              <Icons.ExternalLink size={12} />
            </a>
          </div>

          <div
            className="w-full h-[750px] rounded-3xl border overflow-hidden shadow-2xl relative glass"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <iframe
              src="https://doenets.lk/examresults"
              title="Department of Examinations Live Portal"
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsTab;
