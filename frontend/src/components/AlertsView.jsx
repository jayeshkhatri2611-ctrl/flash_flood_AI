import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Search, 
  Printer, 
  Clock, 
  ExternalLink,
  Radio,
  ShieldAlert
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

export default function AlertsView({
  alerts = [],
  regions = [],
  onSelectRegion
}) {
  const [activeTab, setActiveTab] = useState('ACTIVE');
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
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-panel p-4 flex items-start space-x-3 text-amber-200 text-xs shadow-card">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-300 block">
            MHA & NDMA Advisory Early Warning Dispatch Console
          </span>
          <p className="text-amber-200/90 leading-relaxed text-xs">
            Alerts issued by this system are classified as <strong>hydrological decision-support advisories</strong>. Emergency Response Agencies (NDRF, SDRF, DDMA) should verify on-ground telemetric stage gauges before enacting mandatory evacuation directives.
          </p>
        </div>
      </div>

      {/* Main Alert Card Container */}
      <div className="bg-app-card rounded-panel border border-app-border p-5 sm:p-6 shadow-card space-y-5">
        {/* Header with Tabs and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border/70 pb-4">
          {/* Active / All Tabs */}
          <div className="flex items-center space-x-1.5 bg-app-elevated/70 p-1 rounded-full border border-app-border text-xs">
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center space-x-1.5 ${
                activeTab === 'ACTIVE'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-app-muted hover:text-white'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${activeTab === 'ACTIVE' ? 'animate-pulse' : ''}`} />
              <span>Active Urgent Bulletins ({activeAlerts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                activeTab === 'ALL'
                  ? 'bg-app-primary text-white shadow-sm'
                  : 'text-app-muted hover:text-white'
              }`}
            >
              <span>Incident History ({alerts.length})</span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-app-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bulletins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-app-elevated/70 text-white text-xs border border-app-border rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-app-primary w-40 sm:w-52 placeholder-app-muted"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-app-elevated/70 text-white text-xs border border-app-border rounded-lg px-3 py-1.5 cursor-pointer font-medium"
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
              className="px-3 py-1.5 rounded-lg bg-app-elevated hover:bg-app-border text-white text-xs font-medium flex items-center space-x-1.5 border border-app-border transition-colors"
              title="Print Official Emergency Bulletin"
            >
              <Printer className="w-3.5 h-3.5 text-app-primary" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Bulletins Feed List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-app-muted text-xs">
              No bulletins found matching current filter criteria.
            </div>
          ) : (
            filtered.map((item) => {
              const meta = getRiskMeta(item.risk_level);
              return (
                <article
                  key={item.id}
                  className="bg-app-elevated/40 border border-app-border rounded-xl p-4 sm:p-5 space-y-3 hover:border-app-primary/60 transition-all shadow-sm"
                  aria-labelledby={`alert-${item.id}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-app-border/60 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <SeverityBadge level={item.risk_level} size="sm" pulse={item.risk_level === 'CRITICAL'} />
                      <span className="font-bold text-white text-sm" id={`alert-${item.id}`}>
                        {item.region} ({item.state})
                      </span>
                      <span className="text-xs text-app-muted hidden sm:inline">
                        Bulletin ID: {item.id}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-app-muted flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-app-subtle" />
                        <span className="tabular-nums">{item.time_display || item.timestamp}</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: `${meta.color}25`, border: `1px solid ${meta.color}60` }}>
                        Score: {item.risk_score} / 100
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed">
                    <strong className="text-white">Hydrological Trigger:</strong> {item.trigger}
                  </div>

                  {item.factors && item.factors.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {item.factors.map((f, i) => (
                        <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-app-card border border-app-border text-slate-300 font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bg-app-card/60 border border-app-border p-3.5 rounded-lg text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-app-cyan text-xs">
                      Command Action Taken & Directives:
                    </div>
                    <p className="leading-relaxed text-xs">{item.action_taken}</p>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        const target = regions.find(r => r.id === item.region_id);
                        if (target && onSelectRegion) onSelectRegion(target);
                      }}
                      className="text-xs text-app-primary hover:text-app-cyan flex items-center space-x-1.5 font-semibold transition-colors"
                    >
                      <span>Focus Basin in Live GIS Map & Telemetry</span>
                      <ExternalLink className="w-3.5 h-3.5" />
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
