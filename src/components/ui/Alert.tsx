import React, { ReactNode } from 'react';
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string | ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const typeStyles = {
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    error: 'bg-red-100 border-red-400 text-red-700',
  };

  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  }[type];

  return (
    <div
      className={`flex items-center p-4 border rounded-md ${typeStyles[type]} ${className}`}
      role="alert"
    >
      <Icon className="flex-shrink-0 w-5 h-5 mr-3" />
      <div>
        {typeof message === 'string' ? <p className="text-sm">{message}</p> : message}
      </div>
    </div>
  );
};
