import { GEMINI_API_KEY } from '../config/constants';

export async function askGemini(messages, userMessage, aiContext = '') {
  if (!GEMINI_API_KEY) {
    throw new Error("System Error: API Key is missing.");
  }

  const systemInstruction = `
You are 'DE education.lk', the official, intelligent, and motivating AI assistant of the DE Education platform in Sri Lanka.
Your primary mission is to help Sri Lankan A/L students with their studies, find past papers, and understand concepts.

Available Real-time Resources:
${aiContext}

Directives:
1. ALWAYS identify yourself as "DE education.lk".
2. Be polite, encouraging, and use a professional yet friendly tone suitable for students. You may reply in Sinhala or English depending on how the student asks.
3. If asked about papers/notices, strictly refer to the provided database. If not found, explain nicely.
4. Keep answers concise, clear, and informative.
`;

  const contents = [
    ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
    return result.candidates[0].content.parts[0].text;
  }
  throw new Error("No response returned from AI.");
}
