import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { transformPreetiKeypress } from '../utils/preetiConverter';
import { PreetiKeyboardModal } from '../components/admin/PreetiKeyboardModal';
import { PreetiConverterModal } from '../components/admin/PreetiConverterModal';

interface PreetiTypingContextType {
  isPreetiMode: boolean;
  togglePreetiMode: () => void;
  setPreetiMode: (enabled: boolean) => void;
  openKeyboardGuide: () => void;
  openConverter: () => void;
}

const PreetiTypingContext = createContext<PreetiTypingContextType | undefined>(undefined);

export const PreetiTypingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPreetiMode, setIsPreetiModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ankur_preeti_typing_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isConverterOpen, setIsConverterOpen] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  }, []);

  const setPreetiMode = useCallback(
    (enabled: boolean) => {
      setIsPreetiModeState(enabled);
      try {
        localStorage.setItem('ankur_preeti_typing_mode', enabled ? 'true' : 'false');
      } catch (e) {
        // ignore
      }
      showToast(
        enabled
          ? '⌨️ प्रिती टाइपिङ सक्रिय (Preeti Typing: ON) — Ctrl+M'
          : '⌨️ अंग्रेजी टाइपिङ सक्रिय (English Typing: ON)'
      );
    },
    [showToast]
  );

  const togglePreetiMode = useCallback(() => {
    setPreetiMode(!isPreetiMode);
  }, [isPreetiMode, setPreetiMode]);

  // Global Keydown Handler for Ctrl+M toggle & Preeti Character Translation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Hotkey toggle: Ctrl+M or Alt+P
      if (
        (e.ctrlKey && (e.key === 'm' || e.key === 'M')) ||
        (e.altKey && (e.key === 'p' || e.key === 'P'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        togglePreetiMode();
        return;
      }

      // If Preeti mode is disabled, do nothing (keep standard English typing)
      if (!isPreetiMode) return;

      // Check active element
      const activeEl = document.activeElement;
      if (!activeEl) return;

      const isInput = activeEl.tagName === 'INPUT';
      const isTextarea = activeEl.tagName === 'TEXTAREA';
      if (!isInput && !isTextarea) return;

      const target = activeEl as HTMLInputElement | HTMLTextAreaElement;

      // Exclude password, number, email, date, etc.
      if (isInput) {
        const inputType = (target.getAttribute('type') || 'text').toLowerCase();
        if (['password', 'number', 'email', 'date', 'datetime-local', 'file', 'checkbox', 'radio'].includes(inputType)) {
          return;
        }
      }

      // If user is holding Ctrl, Meta (Cmd), or Alt (except for normal typing combos)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // Check if it's a printable single-character key
      if (e.key.length !== 1) {
        return;
      }

      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const textBefore = target.value.substring(0, start);
      const textAfter = target.value.substring(end);

      const result = transformPreetiKeypress(textBefore, e.key);
      if (!result) return;

      // We have a Preeti conversion! Intercept native event
      e.preventDefault();
      e.stopPropagation();

      const deleteCount = result.deleteBackCount;
      const effectiveStart = Math.max(0, start - deleteCount);
      const newTextBefore = target.value.substring(0, effectiveStart) + result.replacement;
      const newFullValue = newTextBefore + textAfter;
      const newCursorPos = newTextBefore.length;

      // Select characters to be replaced so execCommand replaces them cleanly
      if (deleteCount > 0) {
        target.setSelectionRange(effectiveStart, end);
      }

      let execSuccess = false;
      try {
        execSuccess = document.execCommand('insertText', false, result.replacement);
      } catch (err) {
        execSuccess = false;
      }

      if (!execSuccess) {
        // Fallback for React synthetic events via prototype property descriptor
        const prototype = isInput ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
        if (descriptor && descriptor.set) {
          descriptor.set.call(target, newFullValue);
        } else {
          target.value = newFullValue;
        }
        target.setSelectionRange(newCursorPos, newCursorPos);
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isPreetiMode, togglePreetiMode]);

  return (
    <PreetiTypingContext.Provider
      value={{
        isPreetiMode,
        togglePreetiMode,
        setPreetiMode,
        openKeyboardGuide: () => setIsGuideOpen(true),
        openConverter: () => setIsConverterOpen(true),
      }}
    >
      {children}

      {/* Interactive Keyboard Modal */}
      <PreetiKeyboardModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onInsertChar={(char) => {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            const target = activeEl as HTMLInputElement | HTMLTextAreaElement;
            const start = target.selectionStart ?? target.value.length;
            const end = target.selectionEnd ?? target.value.length;
            const before = target.value.substring(0, start);
            const after = target.value.substring(end);
            const newVal = before + char + after;
            const newPos = start + char.length;
            try {
              document.execCommand('insertText', false, char);
            } catch {
              const proto = target.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
              const desc = Object.getOwnPropertyDescriptor(proto, 'value');
              if (desc?.set) desc.set.call(target, newVal);
              else target.value = newVal;
              target.setSelectionRange(newPos, newPos);
              target.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        }}
      />

      {/* Preeti ⇄ Unicode Converter Modal */}
      <PreetiConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        onInsertText={(text) => {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            const target = activeEl as HTMLInputElement | HTMLTextAreaElement;
            const start = target.selectionStart ?? target.value.length;
            const end = target.selectionEnd ?? target.value.length;
            const before = target.value.substring(0, start);
            const after = target.value.substring(end);
            const newVal = before + text + after;
            const newPos = start + text.length;
            try {
              document.execCommand('insertText', false, text);
            } catch {
              const proto = target.tagName === 'INPUT' ? HTMLInputElement.prototype : HTMLTextAreaElement.prototype;
              const desc = Object.getOwnPropertyDescriptor(proto, 'value');
              if (desc?.set) desc.set.call(target, newVal);
              else target.value = newVal;
              target.setSelectionRange(newPos, newPos);
              target.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
          setIsConverterOpen(false);
        }}
      />

      {/* Live Toast Notification on Toggle */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-slate-900/95 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center space-x-2 backdrop-blur-md">
          <span>{toastMessage}</span>
        </div>
      )}
    </PreetiTypingContext.Provider>
  );
};

export const usePreetiTyping = (): PreetiTypingContextType => {
  const context = useContext(PreetiTypingContext);
  if (!context) {
    throw new Error('usePreetiTyping must be used within a PreetiTypingProvider');
  }
  return context;
};
