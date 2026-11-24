import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, X, ChevronRight, Radio } from 'lucide-react';
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
      className={`border-b px-4 py-2 text-xs flex items-center justify-between transition-colors shadow-subtle ${
        isCritical 
          ? 'bg-red-950/80 border-red-800/80 text-red-100' 
          : 'bg-orange-950/80 border-orange-800/80 text-orange-100'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-7xl mx-auto flex-1 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isCritical ? 'bg-red-400' : 'bg-orange-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`}></span>
          </span>

          <SeverityBadge level={primaryAlert.risk_level} size="xs" pulse={true} />

          <span className="font-bold tracking-tight text-white">
            {primaryAlert.region} ({primaryAlert.state}):
          </span>

          <span className="text-slate-200 line-clamp-1 max-w-xl">
            {primaryAlert.trigger}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center space-x-1 text-xs font-semibold underline hover:no-underline text-white hover:text-bb-accent"
          >
            <span>View Emergency SOPs & Bulletins</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded hover:bg-black/20 text-slate-300 hover:text-white"
            aria-label="Dismiss alert banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
