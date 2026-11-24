import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  CloudRain, 
  Droplets, 
  Waves, 
  Mountain, 
  Compass, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  ExternalLink,
  MapPin,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react';
import GisMap from './GisMap';
import ChartsSection from './ChartsSection';

export default function Dashboard({
  regions = [],
  selectedRegion,
  onSelectRegion,
  overview = {},
  onNavigateTab,
  onRefresh
}) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [filterState, setFilterState] = useState('ALL');

  const env = selectedRegion?.environmental_data || {
    rainfall: 128.5,
    rainfall_intensity: 36.4,
    soil_moisture: 88.2,
    river_level: 4.65,
    danger_level: 4.5,
    elevation: 2150,
    slope: 38.5
  };

  const risk = selectedRegion?.risk_assessment || {
    risk_score: 88.4,
    risk_level: 'CRITICAL',
    trend: 'rising',
    contributing_factors: [
      "Torrential cloudburst rainfall (36.4 mm/h)",
      "Soil moisture near saturation (88.2%)",
      "River level breached danger mark (4.65m / 4.50m)"
    ],
    recommended_action: "🚨 RED ALERT: Order immediate evacuation of low-lying riverbanks.",
    last_updated: "Just now"
  };

  const dangerHeadroom = env.danger_level - env.river_level;

  const states = ['ALL', ...new Set(regions.map(r => r.state))];
  const filteredRegions = filterState === 'ALL' 
    ? regions 
    : regions.filter(r => r.state === filterState);

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return { bg: 'bg-red-950', text: 'text-red-400', border: 'border-red-800' };
      case 'HIGH': return { bg: 'bg-orange-950', text: 'text-orange-400', border: 'border-orange-800' };
      case 'MODERATE': return { bg: 'bg-amber-950', text: 'text-amber-400', border: 'border-amber-800' };
      default: return { bg: 'bg-emerald-950', text: 'text-emerald-400', border: 'border-emerald-800' };
    }
  };

  const badgeStyle = getRiskColor(risk.risk_level);

  return (
    <div className="space-y-6">
      {/* Top Command Status Strip & Region Selector */}
      <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Region Selector with State Grouping */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Selected Region:
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedRegion?.id || ''}
              onChange={(e) => {
                const found = regions.find(r => r.id === e.target.value);
                if (found) onSelectRegion(found);
              }}
              className="bg-command-card text-white text-xs font-semibold px-3 py-2 rounded-lg border border-command-border focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.state}) — {r.risk_assessment?.risk_level} [{r.risk_assessment?.risk_score}]
                </option>
              ))}
            </select>

            {/* Filter by state */}
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-command-card text-slate-300 text-xs px-2.5 py-2 rounded-lg border border-command-border focus:outline-none hidden sm:inline-block"
            >
              {states.map((s, idx) => (
                <option key={idx} value={s}>
                  {s === 'ALL' ? 'All States' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 bg-command-card hover:bg-command-border text-slate-200 hover:text-white rounded-lg border border-command-border transition-colors text-xs font-medium flex items-center space-x-1.5 shadow-sm"
            title="Refresh Live Telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top 5 Primary Telemetry Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Overall Risk */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Selected Hazard</span>
            <ShieldAlert className={`w-4 h-4 ${badgeStyle.text}`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-black font-mono tracking-tight ${badgeStyle.text}`}>
                {risk.risk_level}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({risk.risk_score}/100)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              Trend: <span className="font-semibold capitalize text-slate-200">{risk.trend || 'Rising'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Rainfall */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Rainfall (24h)</span>
            <CloudRain className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black font-mono text-white">
                {env.rainfall}
              </span>
              <span className="text-xs text-slate-400">mm</span>
            </div>
            <div className="text-[11px] text-blue-400 font-mono">
              Intensity: {env.rainfall_intensity} mm/hr
            </div>
          </div>
        </div>

        {/* Card 3: Soil Moisture */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Soil Moisture</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black font-mono text-white">
                {env.soil_moisture}
              </span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <div className="text-[11px] text-cyan-400">
              {env.soil_moisture > 80 ? 'Near Complete Saturation' : 'Moderate Infiltration'}
            </div>
          </div>
        </div>

        {/* Card 4: River Level */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">River Gauge Stage</span>
            <Waves className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black font-mono text-white">
                {env.river_level}
              </span>
              <span className="text-xs text-slate-400">m</span>
              <span className="text-[10px] text-slate-500 font-mono">/ {env.danger_level}m</span>
            </div>
            <div className={`text-[11px] font-semibold ${
              dangerHeadroom <= 0 ? 'text-red-400 animate-pulse' : 'text-slate-400'
            }`}>
              {dangerHeadroom <= 0 
                ? `Breached by ${Math.abs(Math.round(dangerHeadroom * 100)/100)}m` 
                : `${Math.round(dangerHeadroom * 100)/100}m below danger`}
            </div>
          </div>
        </div>

        {/* Card 5: Topography */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Terrain & Slope</span>
            <Mountain className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black font-mono text-white">
                {env.slope}°
              </span>
              <span className="text-xs text-slate-400 font-mono">@ {env.elevation}m</span>
            </div>
            <div className="text-[11px] text-emerald-400">
              Steep Valley Funneling
            </div>
          </div>
        </div>
      </div>

      {/* Main Split View: GIS Interactive Map + Critical Advisory Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left GIS Map View (8 Cols) */}
        <div className="lg:col-span-8">
          <GisMap
            regions={filteredRegions}
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
            height="480px"
          />
        </div>

        {/* Right Early Warning & Decision Support Card (4 Cols) */}
        <div className="lg:col-span-4 bg-command-darker border border-command-border rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Top alert badge header */}
            <div className="flex items-start justify-between border-b border-command-border/60 pb-3">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Decision Support Bulletin
                </div>
                <h3 className="text-base font-bold text-white flex items-center space-x-1.5 pt-0.5">
                  <span>{selectedRegion?.name} Basin</span>
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider font-mono border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                {risk.risk_level}
              </span>
            </div>

            {/* Risk factors bullet list */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-Source Hydrological Factors:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(risk.contributing_factors || []).map((factor, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-command-card/50 p-2 rounded border border-command-border/40 text-[11px] leading-snug">
                    <span className="text-blue-400 mt-0.5">&bull;</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Official Authority SOP Checklist */}
            <div className="bg-slate-900/90 border border-command-border rounded-lg p-3.5 space-y-2 text-xs">
              <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Standard Operating Procedure (SOP):</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {risk.recommended_action}
              </p>
            </div>
          </div>

          {/* Card Footer CTA buttons */}
          <div className="pt-2 border-t border-command-border/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Authority: {selectedRegion?.authority || 'District DDMA'}</span>
            </div>
            <div>
              <button
                onClick={() => onNavigateTab('alerts')}
                className="w-full py-2 px-3 bg-command-card hover:bg-command-border text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 border border-command-border transition-colors shadow-sm"
              >
                <span>View Regional Alerts Log</span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Recharts Section: 24h Timeseries & Attribution */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>Hydrological Telemetry Timeseries & Correlation Curves</span>
            </h3>
            <p className="text-xs text-slate-400">
              Observational hydrograph tracking precipitation vs river crest lag over the past 24 hours.
            </p>
          </div>
        </div>

        <ChartsSection selectedRegion={selectedRegion} />
      </div>
    </div>
  );
}
