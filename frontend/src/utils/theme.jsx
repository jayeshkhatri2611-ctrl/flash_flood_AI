import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export const RISK_LEVELS = {
  CRITICAL: {
    label: 'CRITICAL',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    text: '#EF4444',
    badgeClass: 'bg-red-950/60 text-red-400 border border-red-800/80',
    icon: AlertCircle
  },
  HIGH: {
    label: 'HIGH',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.4)',
    text: '#F97316',
    badgeClass: 'bg-orange-950/60 text-orange-400 border border-orange-800/80',
    icon: AlertTriangle
  },
  MODERATE: {
    label: 'MODERATE',
    color: '#FACC15',
    bg: 'rgba(250, 204, 21, 0.15)',
    border: 'rgba(250, 204, 21, 0.4)',
    text: '#FACC15',
    badgeClass: 'bg-amber-950/60 text-amber-300 border border-amber-800/80',
    icon: Info
  },
  LOW: {
    label: 'LOW',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#10B981',
    badgeClass: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80',
    icon: ShieldCheck
  }
};

export function getRiskMeta(level = 'LOW') {
  const norm = String(level).toUpperCase();
  return RISK_LEVELS[norm] || RISK_LEVELS.LOW;
}

/**
 * Renders a standardized WCAG-compliant severity badge with icon + label + color
 */
export function SeverityBadge({ level, size = 'sm', pulse = false }) {
  const meta = getRiskMeta(level);
  const Icon = meta.icon;

  const sizeClasses = size === 'xs' 
    ? 'px-1.5 py-0.5 text-[10px] gap-1' 
    : (size === 'lg' ? 'px-3 py-1 text-xs gap-1.5 font-bold' : 'px-2 py-0.5 text-[11px] gap-1.5 font-semibold');

  return (
    <span 
      className={`inline-flex items-center rounded font-mono uppercase tracking-wider ${sizeClasses} ${meta.badgeClass} ${pulse && (level === 'CRITICAL' || level === 'HIGH') ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: meta.bg, borderColor: meta.border, color: meta.text }}
      role="status"
      aria-label={`Risk Level: ${meta.label}`}
    >
      <Icon className={size === 'xs' ? 'w-3 h-3 flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}
