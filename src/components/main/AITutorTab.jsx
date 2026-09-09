import React, { useState, useRef, useEffect } from 'react';
import Icons from '../common/Icons';
import { askGemini } from '../../lib/gemini';

export const AITutorTab = ({ aiContext }) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isThinking]);

  const handleChatSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    setIsThinking(true);

    try {
      const reply = await askGemini(chatMessages, userMsg, aiContext);
      setChatMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: "I apologize, but I'm having trouble connecting to the DE servers right now. Please try again in a moment."
        }
      ]);
    } finally {
      setIsChatLoading(false);
      setIsThinking(false);
    }
  };

  const sampleQuestions = [
    "What A/L Physics past papers are available?",
    "Can you explain Newton's laws of motion?",
    "How should I prepare for the A/L examination?",
    "Where can I find Chemistry marking schemes?"
  ];

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-170px)] min-h-[550px] flex flex-col animate__animated animate__fadeIn pb-6">
      {/* Title */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-400 text-xs font-bold uppercase tracking-widest mb-2 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.2)] glass">
          <Icons.Sparkles size={12} className="animate-pulse" /> DE education.lk AI Tutor
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white text-glow">
          Your Personal Study Companion
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Powered by Google Gemini | Ask questions about past papers, concepts, or study strategies.
        </p>
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 glass rounded-[2.5rem] p-6 md:p-8 mb-4 overflow-y-auto custom-scrollbar flex flex-col gap-5 relative border border-white/10 bg-black/50 shadow-2xl">
        {chatMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-5 animate-pulse-slow border border-emerald-500/20">
              <Icons.Bot size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Hello! I'm <span className="text-emerald-400">DE education.lk</span>
            </h3>
            <p className="text-sm text-gray-400 max-w-md mb-8">
              I can assist you with your A/L studies, help you locate past papers & marking schemes, and explain challenging concepts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(q);
                  }}
                  className="p-3.5 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-xs text-gray-300 hover:text-white transition-all text-left flex items-center justify-between"
                >
                  <span className="line-clamp-1">{q}</span>
                  <Icons.ArrowRight size={12} className="text-emerald-400 ml-2 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            } gap-2 animate__animated animate__fadeInUp`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] p-5 rounded-3xl text-sm md:text-base leading-relaxed shadow-lg backdrop-blur-md border ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm border-white/10'
                  : 'glass bg-white/5 border-white/10 text-gray-200 rounded-tl-sm'
              }`}
            >
              {msg.role === 'model' && (
                <div className="text-[10px] text-emerald-400 font-bold uppercase mb-2 flex items-center gap-2 border-b border-white/10 pb-1.5 tracking-wider">
                  <Icons.Bot size={12} /> DE education.lk
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start animate__animated animate__fadeIn">
            <div className="glass bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-sm flex items-center gap-3 text-sm text-pink-400 backdrop-blur-md shadow-lg">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></div>
                <div
                  className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                DE AI Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleChatSubmit} className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask anything about A/L exams, past papers or theory..."
          className="relative w-full bg-black/80 border border-white/10 rounded-3xl py-4 md:py-5 pl-6 pr-16 text-white focus:border-emerald-500 focus:outline-none transition-all placeholder-gray-500 shadow-2xl glass text-sm md:text-base"
          disabled={isChatLoading || isThinking}
        />
        <button
          type="submit"
          disabled={!chatInput.trim() || isChatLoading || isThinking}
          className="absolute right-3 top-2.5 md:top-3 z-10 p-2.5 md:p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/30"
          aria-label="Send message"
        >
          <Icons.Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AITutorTab;
