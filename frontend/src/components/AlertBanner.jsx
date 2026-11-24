import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

export default function AlertBanner({ alerts = [], regions = [] }) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  // Find most critical active alert
  const criticalOrHighAlerts = alerts.filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH');
  
  if (dismissed || criticalOrHighAlerts.length === 0) {
    return null;
  }

  const primaryAlert = criticalOrHighAlerts[0];
  const isCritical = primaryAlert.risk_level === 'CRITICAL';
  const meta = getRiskMeta(primaryAlert.risk_level);

  return (
    <aside 
      className={`border-b px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between transition-all backdrop-blur-md ${
        isCritical 
          ? 'bg-red-500/10 border-red-500/25 text-red-100 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.25)]' 
          : 'bg-orange-500/10 border-orange-500/25 text-orange-100 shadow-[0_4px_20px_-4px_rgba(249,115,22,0.25)]'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-[1700px] w-full mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? 'bg-red-400' : 'bg-orange-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}></span>
          </span>

          <SeverityBadge level={primaryAlert.risk_level} size="xs" pulse={true} />

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-white">
              {primaryAlert.region} ({primaryAlert.state}):
            </span>
            <span className="text-slate-200 line-clamp-1 max-w-2xl font-normal">
              {primaryAlert.trigger}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
          >
            <span>View Protocol SOPs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Dismiss alert banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
