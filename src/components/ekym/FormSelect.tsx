import React from 'react';

interface Option {
  value: string;
  labelEn: string;
  labelNp?: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  labelNp?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  labelNp,
  required,
  error,
  helperText,
  options,
  placeholder = '-- Select --',
  icon,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || `select-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className="w-full text-left">
      <label htmlFor={selectId} className="block text-xs font-bold text-slate-800 mb-1">
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
        <select
          id={selectId}
          required={required}
          className={`w-full text-xs font-medium text-slate-900 bg-white rounded-lg border transition-colors ${
            icon ? 'pl-9' : 'pl-3'
          } pr-8 py-2.5 appearance-none ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : 'border-slate-300 focus:border-[#0981ae] focus:ring-1 focus:ring-[#0981ae]'
          } disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelEn} {opt.labelNp ? `(${opt.labelNp})` : ''}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2.5 pointer-events-none text-slate-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
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
