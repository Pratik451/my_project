import React, { useState } from 'react';
import { X, Keyboard, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { PREETI_KEYBOARD_ROWS } from '../../utils/preetiConverter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertChar?: (char: string) => void;
}

export const PreetiKeyboardModal: React.FC<Props> = ({ isOpen, onClose, onInsertChar }) => {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyClick = (nepaliChar: string, keyLabel: string) => {
    if (onInsertChar) {
      onInsertChar(nepaliChar);
    }
    navigator.clipboard.writeText(nepaliChar);
    setCopiedKey(keyLabel);
    setTimeout(() => setCopiedKey(null), 1200);
  };

  const commonWords = [
    { word: 'अङ्कुर', preeti: "cª\\s'/" },
    { word: 'सहकारी', preeti: ';xsf/L' },
    { word: 'बचत', preeti: 'art' },
    { word: 'ऋण', preeti: 'C0f' },
    { word: 'सेयर', preeti: ';]o/' },
    { word: 'अध्यक्ष', preeti: 'cWoIf' },
    { word: 'प्रबन्धक', preeti: 'k|aGws' },
    { word: 'सदस्य', preeti: ';b:o' },
    { word: 'बैंकिङ', preeti: 'a}+lsª' },
    { word: 'सूचना', preeti: ';\"rgf' },
    { word: 'प्रतिवेदन', preeti: 'k|ltj]bg' },
    { word: 'बुटवल', preeti: "a'6jn" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Keyboard className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>परम्परागत प्रिती किबोर्ड लेआउट</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/40">
                  Preeti Keyboard Guide
                </span>
              </h2>
              <p className="text-xs text-sky-200/90">
                किबोर्डका बटनहरू थिचेर नेपाली युनिकोडमा सोझै टाइप गर्नुहोस् वा तलका किहरू हेर्नुहोस्। (Toggle: Ctrl + M)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsShiftActive(!isShiftActive)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                isShiftActive
                  ? 'bg-amber-400 text-slate-900 border-amber-300 shadow-sm'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              Shift Key {isShiftActive ? '(सक्रिय / ON)' : '(बन्द / OFF)'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Keyboard Visual Area */}
        <div className="p-6 overflow-y-auto space-y-5 bg-slate-50/70">
          {/* Quick Word Chips */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                सहकारीका मुख्य शब्दहरू (क्लिक गरी प्रतिलिपि वा इन्सर्ट गर्नुहोस्):
              </span>
              <span className="text-[11px] text-slate-500">प्रिती किस्ट्रोक कोष्ठकमा दिइएको छ</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {commonWords.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleKeyClick(item.word, item.word)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 text-slate-800 transition-all font-medium flex items-center gap-1.5 group cursor-pointer"
                  title={`Preeti Keystrokes: ${item.preeti}`}
                >
                  <span className="font-semibold">{item.word}</span>
                  <span className="text-[10px] text-slate-400 group-hover:text-sky-500 font-mono">({item.preeti})</span>
                  {copiedKey === item.word ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-300 group-hover:text-sky-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Keyboard Rows */}
          <div className="bg-slate-900 p-4 rounded-2xl shadow-inner border border-slate-800 space-y-2 select-none">
            {PREETI_KEYBOARD_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1.5">
                {row.map((k) => {
                  const activeChar = isShiftActive ? k.shiftNepali : k.nepali;
                  const romanKey = isShiftActive ? k.shiftChar : k.char;
                  return (
                    <button
                      key={k.code}
                      onClick={() => handleKeyClick(activeChar, k.char)}
                      className="group relative flex flex-col items-center justify-between w-12 h-14 p-1.5 rounded-lg bg-slate-800 hover:bg-sky-600 border border-slate-700 hover:border-sky-400 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                      title={`Key: ${romanKey} ➔ Nepali: ${activeChar}`}
                    >
                      <span className="text-[10px] text-slate-400 group-hover:text-sky-200 font-mono self-start leading-none">
                        {romanKey}
                      </span>
                      <span className="text-base font-bold text-amber-300 group-hover:text-white leading-none">
                        {activeChar}
                      </span>
                      <span className="text-[9px] text-slate-500 group-hover:text-sky-100/80 leading-none">
                        {isShiftActive ? k.nepali : k.shiftNepali}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Quick Preeti Typing Cheat Sheet */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-600" />
              प्रिती टाइपिङका विशेष नियमहरू (Special Preeti Key Combinations)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs text-slate-600">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sky-800 block">फ, क्र, क्त, ऊ, झ:</span>
                <span>k+m = फ, त्र+m = क्र, त्त+m = क्त, उ+m = ऊ, भ+m = झ</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sky-800 block">ह्रस्व 'ि' (Left Matra):</span>
                <span>पहिले 'l' थिच्ने अनि अक्षर (उदा. l+s = कि, l+v = खि, l+t = ति)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sky-800 block">रेफ 'र्' (Reph):</span>
                <span>अक्षरपछि Shift+[ (अर्थात् {'{'}) थिच्ने (उदा. wd+{'{'} = धर्म)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sky-800 block">आ, ओ, औ, ऐ:</span>
                <span>c+f = आ, c+f+] = ओ, c+f+{'}'} = औ, P+] = ऐ</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sky-800 block">हलन्त र आधा अक्षर:</span>
                <span>\ = ् (उदा. s+\+s = क्क), S = क्, T = त्, G = न्, D = म्</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-semibold text-sky-800 block">अंकहरू (Numerals):</span>
                <span>Shift+! = १, @ = २, # = ३, $ = ४, % = ५, ^ = ६, & = ७, * = ८, ( = ९, ) = ०</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            कुनै पनि इनपुटमा टाइप गर्दा <strong>Ctrl + M</strong> थिचेर प्रिती र अंग्रेजी मोड फेर्न सक्नुहुन्छ।
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors"
          >
            बन्द गर्नुहोस् (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
