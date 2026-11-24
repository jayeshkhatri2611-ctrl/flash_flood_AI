import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export const RISK_LEVELS = {
  CRITICAL: {
    label: 'Critical',
    code: 'CRITICAL',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    text: '#F87171',
    badgeClass: 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_12px_-3px_rgba(239,68,68,0.4)]',
    icon: AlertCircle
  },
  HIGH: {
    label: 'High',
    code: 'HIGH',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    text: '#FB923C',
    badgeClass: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    icon: AlertTriangle
  },
  MODERATE: {
    label: 'Moderate',
    code: 'MODERATE',
    color: '#FACC15',
    bg: 'rgba(250, 204, 21, 0.12)',
    border: 'rgba(250, 204, 21, 0.35)',
    text: '#FDE047',
    badgeClass: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    icon: Info
  },
  LOW: {
    label: 'Low',
    code: 'LOW',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.35)',
    text: '#34D399',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    icon: ShieldCheck
  }
};

export function getRiskMeta(level = 'LOW') {
  const norm = String(level).toUpperCase();
  return RISK_LEVELS[norm] || RISK_LEVELS.LOW;
}

/**
 * Standardized, accessible pill badge with icon, label, and risk color
 */
export function SeverityBadge({ level, size = 'sm', pulse = false }) {
  const meta = getRiskMeta(level);
  const Icon = meta.icon;

  const sizeClasses = size === 'xs' 
    ? 'px-2 py-0.5 text-[11px] gap-1 font-medium' 
    : (size === 'lg' ? 'px-3.5 py-1 text-xs gap-1.5 font-semibold' : 'px-2.5 py-0.5 text-xs gap-1.5 font-medium');

  return (
    <span 
      className={`inline-flex items-center rounded-full transition-all ${sizeClasses} ${meta.badgeClass} ${pulse && (level === 'CRITICAL' || level === 'HIGH') ? 'animate-pulse' : ''}`}
      role="status"
      aria-label={`Risk Level: ${meta.label}`}
    >
      <Icon className={size === 'xs' ? 'w-3 h-3 flex-shrink-0' : 'w-3.5 h-3.5 flex-shrink-0'} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}
