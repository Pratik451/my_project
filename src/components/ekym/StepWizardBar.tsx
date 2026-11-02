import React from 'react';
import {
  User,
  MapPin,
  Building2,
  Wallet,
  ArrowLeftRight,
  Eye,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { Language } from '../../types';

export interface StepMeta {
  step: number;
  id: string;
  titleEn: string;
  titleNp: string;
  shortEn: string;
  shortNp: string;
  icon: React.ReactNode;
}

export const WIZARD_STEPS: StepMeta[] = [
  {
    step: 1,
    id: 'personal',
    titleEn: 'Personal Information',
    titleNp: 'व्यक्तिगत विवरण',
    shortEn: 'Personal',
    shortNp: 'व्यक्तिगत',
    icon: <User className="w-4 h-4" />,
  },
  {
    step: 2,
    id: 'address',
    titleEn: 'Address Information',
    titleNp: 'ठेगाना विवरण',
    shortEn: 'Address',
    shortNp: 'ठेगाना',
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    step: 3,
    id: 'business',
    titleEn: 'Corporate / Business',
    titleNp: 'संस्था वा व्यवसाय',
    shortEn: 'Business',
    shortNp: 'व्यवसाय',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    step: 4,
    id: 'income',
    titleEn: 'Income Information',
    titleNp: 'आम्दानी तथा आर्थिक विवरण',
    shortEn: 'Income',
    shortNp: 'आम्दानी',
    icon: <Wallet className="w-4 h-4" />,
  },
  {
    step: 5,
    id: 'transaction',
    titleEn: 'Transaction Information',
    titleNp: 'कारोबार तथा निक्षेप विवरण',
    shortEn: 'Transaction',
    shortNp: 'कारोबार',
    icon: <ArrowLeftRight className="w-4 h-4" />,
  },
  {
    step: 6,
    id: 'preview',
    titleEn: 'Review & Verification',
    titleNp: 'फाराम पूर्वावलोकन तथा प्रमाणीकरण',
    shortEn: 'Preview',
    shortNp: 'पूर्वावलोकन',
    icon: <Eye className="w-4 h-4" />,
  },
  {
    step: 7,
    id: 'submit',
    titleEn: 'Submit Confirmation',
    titleNp: 'आवेदन सम्पन्न तथा दर्ता प्रमाण',
    shortEn: 'Submit',
    shortNp: 'दर्ता पुष्टि',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

interface StepWizardBarProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick?: (step: number) => void;
  lang: Language;
}

export const StepWizardBar: React.FC<StepWizardBarProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  lang,
}) => {
  const currentMeta = WIZARD_STEPS.find((s) => s.step === currentStep) || WIZARD_STEPS[0];
  const progressPercent = Math.round(((currentStep - 1) / (WIZARD_STEPS.length - 1)) * 100);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-4 mb-6">
      {/* Mobile view progress summary */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0981ae] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0981ae] animate-ping"></span>
            {lang === 'np' ? `चरण ${currentStep} / ७` : `Step ${currentStep} of 7`}
          </span>
          <span className="text-xs font-mono font-bold text-slate-600">{progressPercent}% Completed</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0981ae] text-white flex items-center justify-center shrink-0 shadow-xs">
            {currentMeta.icon}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 truncate">
              {lang === 'np' ? currentMeta.titleNp : currentMeta.titleEn}
            </div>
            <div className="text-[11px] text-slate-500">
              {currentStep < 7
                ? lang === 'np'
                  ? 'आवश्यक विवरणहरू भरेर सुरक्षित गर्नुहोस्'
                  : 'Complete mandatory fields to continue'
                : lang === 'np'
                ? 'आवेदन सफलतापूर्वक दर्ता भयो'
                : 'Application submitted successfully'}
            </div>
          </div>
        </div>

        {/* Mini Step indicators for mobile */}
        <div className="grid grid-cols-7 gap-1 pt-1">
          {WIZARD_STEPS.map((s) => {
            const isCompleted = completedSteps.includes(s.step);
            const isCurrent = s.step === currentStep;
            const canClick = isCompleted || s.step < currentStep;

            return (
              <button
                key={s.step}
                type="button"
                disabled={!canClick && !isCurrent}
                onClick={() => canClick && onStepClick?.(s.step)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0981ae] h-2'
                    : isCompleted
                    ? 'bg-sky-400'
                    : 'bg-slate-200'
                }`}
                title={lang === 'np' ? s.titleNp : s.titleEn}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop / Tablet Stepper */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between">
          {/* Connecting Track Line */}
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-200 -z-0">
            <div
              className="h-full bg-[#0981ae] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {WIZARD_STEPS.map((s) => {
            const isCompleted = completedSteps.includes(s.step);
            const isCurrent = s.step === currentStep;
            const isUpcoming = s.step > currentStep && !isCompleted;
            const canNavigate = isCompleted || s.step < currentStep;

            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center group">
                <button
                  type="button"
                  disabled={!canNavigate && !isCurrent}
                  onClick={() => canNavigate && onStepClick?.(s.step)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 shadow-xs ${
                    isCurrent
                      ? 'bg-[#0981ae] text-white ring-4 ring-sky-100 scale-110'
                      : isCompleted
                      ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                      : 'bg-white border-2 border-slate-300 text-slate-400 cursor-not-allowed'
                  }`}
                  aria-label={`${s.shortEn} - Step ${s.step}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </button>

                <div className="mt-2 text-center max-w-[85px]">
                  <div
                    className={`text-[11px] font-bold leading-tight truncate ${
                      isCurrent
                        ? 'text-[#0981ae]'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {lang === 'np' ? s.shortNp : s.shortEn}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {isCurrent ? (
                      <span className="text-[#0981ae] font-semibold">Active</span>
                    ) : isCompleted ? (
                      <span className="text-sky-600 font-medium">Done</span>
                    ) : (
                      <span>Step {s.step}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
