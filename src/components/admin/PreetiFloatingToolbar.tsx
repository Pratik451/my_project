import React, { useState } from 'react';
import { Keyboard, ArrowRightLeft, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { usePreetiTyping } from '../../context/PreetiTypingContext';

export const PreetiFloatingToolbar: React.FC = () => {
  const { isPreetiMode, togglePreetiMode, openKeyboardGuide, openConverter } = usePreetiTyping();
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40 select-none animate-fadeIn">
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
            isPreetiMode
              ? 'bg-emerald-700 text-white border-emerald-500 hover:bg-emerald-600'
              : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
          }`}
          title="प्रिती टाइपिङ टुलबार खोल्नुहोस् (Open Preeti Typing Bar)"
        >
          <Keyboard className="w-4 h-4 text-emerald-300" />
          <span>{isPreetiMode ? 'प्रिती टाइपिङ (ON)' : 'English (A)'}</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="bg-slate-900/95 text-white p-2.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center gap-2">
          {/* Main Toggle Button */}
          <button
            onClick={togglePreetiMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPreetiMode
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
            title="क्लिक गरी वा Ctrl + M थिचेर प्रिती र अंग्रेजी टाइपिङ फेर्नुहोस्"
          >
            <Keyboard className={`w-4 h-4 ${isPreetiMode ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`} />
            <span>{isPreetiMode ? 'प्रिती (Preeti) सक्रिय' : 'English (अङ्ग्रेजी)'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30 font-mono text-slate-300">
              Ctrl+M
            </span>
          </button>

          {/* Keyboard Guide Button */}
          <button
            onClick={openKeyboardGuide}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="प्रिती किबोर्ड लेआउट गाइड (Preeti Key Guide)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[11px]">गाइड</span>
          </button>

          {/* Preeti ⇄ Unicode Converter Button */}
          <button
            onClick={openConverter}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 border border-slate-700 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="प्रिती ⇄ युनिकोड कन्भर्टर (Preeti ⇄ Unicode Converter)"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-[11px]">कन्भर्टर</span>
          </button>

          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="लुकाउनुहोस् (Minimize)"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
