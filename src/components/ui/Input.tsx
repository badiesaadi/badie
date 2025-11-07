import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
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
        className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, className = '', ...props }) => {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y';
  const errorStyles = 'border-red-500 focus:ring-red-500';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => {
  const baseStyles = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white';
  const errorStyles = 'border-red-500 focus:ring-red-500';

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <select
        className={`${baseStyles} ${error ? errorStyles : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
