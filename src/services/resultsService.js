// --- EXAM RESULTS API SERVICE ---

const API_BASE = '/api/doenets';

/**
 * Fetch latest examination release metadata from Doenets
 */
export const fetchActiveExamDetails = async () => {
  try {
    const res = await fetch(`${API_BASE}/result/service/examDetails`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      return {
        al: {
          title: data.desAlResult || 'G.C.E. (A/L) EXAMINATION',
          year: data.yearAlResult || '2025'
        },
        ol: {
          title: data.desOlResult || 'G.C.E. (O/L) EXAMINATION',
          year: data.yearOlResult || '2025'
        },
        scholarship: {
          title: data.desGvResult || 'Grade 5 Scholarship Examination',
          year: data.yearGvResult || '2025'
        }
      };
    }
  } catch (err) {
    console.warn('Failed to fetch live exam details, using fallback:', err);
  }

  // Fallback defaults
  const currentYear = new Date().getFullYear();
  return {
    al: {
      title: 'G.C.E. (A/L) EXAMINATION',
      year: `${currentYear - 1}`
    },
    ol: {
      title: 'G.C.E. (O/L) EXAMINATION',
      year: `${currentYear - 1}`
    },
    scholarship: {
      title: 'Grade 5 Scholarship Examination',
      year: `${currentYear}`
    }
  };
};

/**
 * Query official examination result from Doenets
 * @param {Object} params
 * @param {'al' | 'ol' | 'gv'} params.examType
 * @param {'index' | 'nic'} params.searchType
 * @param {string} params.queryValue - Index number or NIC number
 * @param {string} params.captchaToken - Verification response
 */
export const queryExaminationResult = async ({
  examType = 'al',
  searchType = 'index',
  queryValue,
  captchaToken = ''
}) => {
  const cleanValue = queryValue.trim();
  let endpoint = '';

  if (examType === 'al') {
    endpoint =
      searchType === 'index'
        ? `${API_BASE}/result/service/AlResult?index=${encodeURIComponent(cleanValue)}&nic=&h-captcha-response=${encodeURIComponent(captchaToken)}`
        : `${API_BASE}/result/service/AlResult?index=&nic=${encodeURIComponent(cleanValue)}&h-captcha-response=${encodeURIComponent(captchaToken)}`;
  } else if (examType === 'ol') {
    endpoint =
      searchType === 'index'
        ? `${API_BASE}/result/service/OlResult?index=${encodeURIComponent(cleanValue)}&nic=&h-captcha-response=${encodeURIComponent(captchaToken)}`
        : `${API_BASE}/result/service/OlResult?index=&nic=${encodeURIComponent(cleanValue)}&h-captcha-response=${encodeURIComponent(captchaToken)}`;
  } else {
    endpoint = `${API_BASE}/result/service/GvResult?index=${encodeURIComponent(cleanValue)}&h-captcha-response=${encodeURIComponent(captchaToken)}`;
  }

  const res = await fetch(endpoint, {
    headers: {
      'Accept': 'application/json'
    }
  });

  const data = await res.json();
  return normalizeResultData(data, cleanValue, examType);
};

/**
 * Standardize result object across all exam types
 */
export const normalizeResultData = (data, queryValue, examType) => {
  if (!data) {
    throw new Error('No response received from examination server.');
  }

  if (data.errMsge) {
    return {
      success: false,
      error: data.errMsge,
      raw: data
    };
  }

  // Extract student details
  const name = data.name || data.studentInfo?.find((s) => s.param?.toLowerCase().includes('name'))?.value || 'CANDIDATE';
  const indexNo = data.indexNo || data.studentInfo?.find((s) => s.param?.toLowerCase().includes('index'))?.value || queryValue;
  const nic = data.nic || data.studentInfo?.find((s) => s.param?.toLowerCase().includes('nic'))?.value || '';
  const stream = data.stream || data.studentInfo?.find((s) => s.param?.toLowerCase().includes('stream'))?.value || '';
  const zScore = data.zScore || data.studentInfo?.find((s) => s.param?.toLowerCase().includes('z-score'))?.value || null;
  const districtRank = data.districtRank || data.studentInfo?.find((s) => s.param?.toLowerCase().includes('district'))?.value || null;
  const islandRank = data.islandRank || data.studentInfo?.find((s) => s.param?.toLowerCase().includes('island'))?.value || null;

  return {
    success: true,
    examination: data.examination || (examType === 'al' ? 'G.C.E. (A/L) EXAMINATION' : 'G.C.E. (O/L) EXAMINATION'),
    year: data.year || new Date().getFullYear().toString(),
    name,
    indexNo,
    nic,
    stream,
    zScore,
    districtRank,
    islandRank,
    subjectResults: data.subjectResults || [],
    studentInfo: data.studentInfo || [],
    raw: data
  };
};

export default {
  fetchActiveExamDetails,
  queryExaminationResult
};
