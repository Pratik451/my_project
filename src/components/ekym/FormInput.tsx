import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  labelNp?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  labelNp,
  required,
  error,
  helperText,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="w-full text-left">
      <label htmlFor={inputId} className="block text-xs font-bold text-slate-800 mb-1">
        <span>{label}</span>
        {labelNp && <span className="text-slate-500 font-normal ml-1">({labelNp})</span>}
        {required && <span className="text-red-500 font-bold ml-1" title="Mandatory field">*</span>}
      </label>

      <div className="relative rounded-lg shadow-xs">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          className={`w-full text-xs font-medium text-slate-900 bg-white rounded-lg border transition-colors ${
            icon ? 'pl-9' : 'pl-3'
          } pr-3 py-2.5 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-slate-300 focus:border-[#0981ae] focus:ring-1 focus:ring-[#0981ae]'
          } disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="mt-1 text-[11px] font-medium text-red-600 flex items-center gap-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
