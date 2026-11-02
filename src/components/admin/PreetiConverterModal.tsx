import React, { useState } from 'react';
import { X, ArrowRightLeft, Copy, Check, RefreshCw, Type, Sparkles } from 'lucide-react';
import { preetiToUnicode, unicodeToPreeti } from '../../utils/preetiConverter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertText?: (convertedText: string) => void;
}

export const PreetiConverterModal: React.FC<Props> = ({ isOpen, onClose, onInsertText }) => {
  const [direction, setDirection] = useState<'preetiToUnicode' | 'unicodeToPreeti'>('preetiToUnicode');
  const [inputText, setInputText] = useState('cª\\s\'/ art tyf C0f ;xsf/L ;+:yf ln= a\'6jn');
  const [copied, setCopied] = useState(false);
  const [showPreetiFontPreview, setShowPreetiFontPreview] = useState(true);

  if (!isOpen) return null;

  const convertedText =
    direction === 'preetiToUnicode' ? preetiToUnicode(inputText) : unicodeToPreeti(inputText);

  const handleCopy = () => {
    navigator.clipboard.writeText(convertedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    setDirection((prev) => (prev === 'preetiToUnicode' ? 'unicodeToPreeti' : 'preetiToUnicode'));
    setInputText(convertedText);
  };

  const samplePresets = [
    { label: 'सहकारी नाम (Coop Name)', val: "cª\\s' art tyf C0f ;xsf/L ;+:yf ln= a'6jn" },
    { label: 'अध्यक्ष सन्देश (Chairman Message)', val: 'cWoIfsf] dGtJoM ;Dk\"0f{ ;b:ox¿df xflb{s gd:sf/ .' },
    { label: 'बचत तथा ब्याज (Savings & Rates)', val: 'aRt vftf tyf Jofhb/ ;\"rgfM dfl;s lsl:tf tyf C0f .' },
    { label: 'निर्णय तथा परिपत्र (Decisions)', val: 'cfhsf] ;~rfns ;ldltsf] a}7ssf] lg0f{o tyf k|:tfjgf .' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ArrowRightLeft className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span>प्रिती ⇄ युनिकोड रूपान्तरण औजार</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  Preeti ⇄ Unicode Converter
                </span>
              </h2>
              <p className="text-xs text-emerald-200/90">
                Word वा अन्य कागजातबाट प्रिती फन्टको पाठ पेस्ट गरी तत्काल शुद्ध नेपाली युनिकोडमा बदल्नुहोस्।
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50/60">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">दिशा (Direction):</span>
              <button
                onClick={() => setDirection('preetiToUnicode')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  direction === 'preetiToUnicode'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                प्रिती ➔ युनिकोड (Preeti to Unicode)
              </button>
              <button
                onClick={() => setDirection('unicodeToPreeti')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  direction === 'unicodeToPreeti'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                युनिकोड ➔ प्रिती (Unicode to Preeti)
              </button>
              <button
                onClick={handleSwap}
                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors"
                title="Swap Direction"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreetiFontPreview(!showPreetiFontPreview)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-all ${
                  showPreetiFontPreview
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                प्रिती फन्ट प्रिभ्यु (True Preeti Font Preview)
              </button>
            </div>
          </div>

          {/* Sample Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              उदाहरणहरू (Sample Presets):
            </span>
            {samplePresets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection('preetiToUnicode');
                  setInputText(p.val);
                }}
                className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dual Textareas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Box */}
            <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  {direction === 'preetiToUnicode' ? 'मूल प्रिती पाठ (Source Preeti Text)' : 'मूल युनिकोड पाठ (Source Unicode Text)'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {inputText.length} अक्षर
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  direction === 'preetiToUnicode'
                    ? 'यहाँ प्रिती फन्टको पाठ पेस्ट गर्नुहोस् (उदा. ;xsf/L)...'
                    : 'यहाँ नेपाली युनिकोड पाठ लेख्नुहोस् (उदा. सहकारी)...'
                }
                rows={9}
                className={`w-full p-4 text-sm text-slate-800 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none font-mono ${
                  direction === 'preetiToUnicode' && showPreetiFontPreview ? 'font-preeti text-lg' : ''
                }`}
              />
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500">
                <span>Ctrl + V गरी सिधै पेस्ट गर्न सकिन्छ</span>
                {inputText && (
                  <button
                    onClick={() => setInputText('')}
                    className="text-rose-600 hover:underline cursor-pointer"
                  >
                    खाली गर्नुहोस् (Clear)
                  </button>
                )}
              </div>
            </div>

            {/* Output Box */}
            <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-4 py-2.5 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">
                  {direction === 'preetiToUnicode' ? 'रूपान्तरित नेपाली युनिकोड (Converted Unicode)' : 'रूपान्तरित प्रिती पाठ (Converted Preeti)'}
                </span>
                <span className="text-[11px] text-emerald-600 font-mono">
                  {convertedText.length} अक्षर
                </span>
              </div>
              <textarea
                readOnly
                value={convertedText}
                placeholder="रूपान्तरित पाठ यहाँ देखिनेछ..."
                rows={9}
                className="w-full p-4 text-sm text-slate-900 border-0 bg-slate-50/40 focus:outline-none resize-none font-medium leading-relaxed"
              />
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  वेबसाइट, मोबाइल र MySQL मा १००% सुरक्षित
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'प्रतिलिपि गरियो!' : 'प्रतिलिपि (Copy)'}
                  </button>
                  {onInsertText && (
                    <button
                      onClick={() => onInsertText(convertedText)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white transition-colors shadow-xs"
                    >
                      इन्सर्ट (Insert)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-100 border-t border-slate-200">
          <div className="text-xs text-slate-600">
            युनिकोडमा रूपान्तरण गरिएको पाठ वेबसाइट, गुगल खोजी, र मोबाइलमा बिना कुनै फन्ट स्वतः देखिन्छ।
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
