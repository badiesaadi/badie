import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, error, className = '', ...props }) => {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent';
  const errorStyles = 'border-red-500 focus:ring-red-500';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <input
        type="datetime-local"
        className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
