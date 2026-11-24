import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin,
  FileText,
  Radio,
  ExternalLink
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

export default function AlertsView({
  alerts = [],
  regions = [],
  onSelectRegion
}) {
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'ALL'
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const activeAlerts = alerts.filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH');
  const displaySource = activeTab === 'ACTIVE' ? activeAlerts : alerts;

  const filtered = displaySource.filter(a => {
    const matchesRisk = riskFilter === 'ALL' || a.risk_level === riskFilter;
    const matchesRegion = regionFilter === 'ALL' || a.region_id === regionFilter;
    const matchesSearch = search === '' || 
      a.region.toLowerCase().includes(search.toLowerCase()) ||
      a.trigger.toLowerCase().includes(search.toLowerCase()) ||
      a.state.toLowerCase().includes(search.toLowerCase());
    return matchesRisk && matchesRegion && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* Top Banner Notice */}
      <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3.5 flex items-start space-x-3 text-amber-200 text-xs shadow-flat">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold uppercase tracking-wider text-amber-300 font-mono">
            MHA & NDMA Advisory Early Warning Dispatch Console:
          </span>
          <p className="text-amber-200/90 leading-relaxed text-[11px]">
            Alerts issued by this system are classified as <strong>hydrological decision-support advisories</strong>. Emergency Response Agencies (NDRF, SDRF, DDMA) should verify on-ground telemetric stage gauges before enacting mandatory evacuation directives.
          </p>
        </div>
      </div>

      {/* Main Alert Card Container */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat space-y-4">
        {/* Header with Tabs and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bb-border/70 pb-3">
          {/* Active / All Tabs */}
          <div className="flex items-center space-x-2 bg-[#091122] p-1 rounded border border-bb-border text-xs font-mono">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3 py-1 rounded transition-colors flex items-center space-x-1.5 ${
                activeTab === 'ACTIVE'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-bb-muted hover:text-white'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeTab === 'ACTIVE' ? 'animate-pulse' : ''}`} />
              <span>Active Urgent Bulletins ({activeAlerts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 rounded transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-bb-accent text-white font-bold shadow-sm'
                  : 'text-bb-muted hover:text-white'
              }`}
            >
              <span>Incident History ({alerts.length})</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-bb-subtle absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bulletins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#091122] text-white text-xs border border-bb-border rounded pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-bb-accent w-36 sm:w-48 placeholder-bb-subtle"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-[#091122] text-white text-xs border border-bb-border rounded px-2.5 py-1.5 font-mono cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
            </select>

            {/* Print Bulletin */}
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1.5 rounded bg-bb-panel hover:bg-bb-border text-white text-xs font-mono flex items-center space-x-1.5 border border-bb-border"
              title="Print Official Emergency Bulletin"
            >
              <Printer className="w-3.5 h-3.5 text-bb-accent" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Bulletins Feed List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-bb-muted font-mono text-xs">
              No bulletins found matching current filter criteria.
            </div>
          ) : (
            filtered.map((item) => {
              const meta = getRiskMeta(item.risk_level);
              return (
                <article
                  key={item.id}
                  className="bg-[#091122] border border-bb-border rounded-lg p-4 space-y-2.5 hover:border-bb-accent/60 transition-colors shadow-sm"
                  aria-labelledby={`alert-${item.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-bb-border/50 pb-2">
                    <div className="flex items-center space-x-2">
                      <SeverityBadge level={item.risk_level} size="sm" pulse={item.risk_level === 'CRITICAL'} />
                      <span className="font-bold text-white text-sm" id={`alert-${item.id}`}>
                        {item.region} ({item.state})
                      </span>
                      <span className="text-[11px] font-mono text-bb-subtle hidden sm:inline">
                        ID: {item.id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs font-mono">
                      <span className="text-bb-muted flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-bb-subtle" />
                        <span className="tabular-nums">{item.time_display || item.timestamp}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono text-white" style={{ backgroundColor: `${meta.color}25`, border: `1px solid ${meta.color}60` }}>
                        Score: {item.risk_score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Trigger text */}
                  <div className="text-xs text-slate-200 font-sans">
                    <strong>Hydrological Trigger:</strong> {item.trigger}
                  </div>

                  {/* Factors tags */}
                  {item.factors && item.factors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {item.factors.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-bb-panel border border-bb-border text-slate-300">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action taken / SOP response */}
                  <div className="bg-bb-panel/50 border border-bb-border/40 p-2.5 rounded text-xs text-slate-300 space-y-1">
                    <div className="font-bold text-bb-accent text-[11px] uppercase tracking-wider font-mono">
                      Command Action Taken & Directives:
                    </div>
                    <p className="leading-relaxed">{item.action_taken}</p>
                  </div>

                  {/* Footer Action */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        const target = regions.find(r => r.id === item.region_id);
                        if (target) onSelectRegion(target);
                      }}
                      className="text-xs text-bb-accent hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <span>Focus Region in GIS Map & Telemetry</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
