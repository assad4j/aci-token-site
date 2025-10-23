// src/components/AlertBanner.jsx
import React from 'react';
import {
  FiCheckCircle,
  FiInfo,
  FiAlertOctagon,
  FiAlertTriangle,
} from 'react-icons/fi';

const variantMap = {
  success: {
    Icon: FiCheckCircle,
    classes: 'border-green-500/40 bg-green-900/60 text-green-100',
  },
  info: {
    Icon: FiInfo,
    classes: 'border-blue-500/40 bg-blue-900/60 text-blue-100',
  },
  warning: {
    Icon: FiAlertTriangle,
    classes: 'border-amber-500/40 bg-amber-900/60 text-amber-100',
  },
  error: {
    Icon: FiAlertOctagon,
    classes: 'border-red-500/40 bg-red-900/60 text-red-100',
  },
};

export default function AlertBanner({
  type = 'info',
  title,
  message,
  children,
  className = '',
}) {
  const variant = variantMap[type] || variantMap.info;
  const Icon = variant.Icon;
  const content = message ?? children;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/20 backdrop-blur ${variant.classes} ${className}`}
    >
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
      <div className="flex flex-col gap-1 leading-relaxed">
        {title && (
          <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
            {title}
          </span>
        )}
        {typeof content === 'string' ? <span>{content}</span> : content}
      </div>
    </div>
  );
}
