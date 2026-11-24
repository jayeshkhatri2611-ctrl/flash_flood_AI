import React, { useState } from 'react';
import { 
  Globe2, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  Mountain, 
  CloudRain, 
  Waves, 
  Droplets, 
  Compass, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

export default function RegionsView({
  regions = [],
  selectedRegion,
  onSelectRegion
}) {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [compareRegionId, setCompareRegionId] = useState('');

  // Unique states
  const states = ['ALL', ...new Set(regions.map(r => r.state))];

  const filtered = regions.filter(r => {
    const matchesSearch = search === '' || 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.river_basin.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState === 'ALL' || r.state === selectedState;
    return matchesSearch && matchesState;
  });

  const compareRegion = regions.find(r => r.id === compareRegionId) || (regions.length > 1 ? regions[1] : null);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Globe2 className="w-4 h-4 text-bb-accent" />
            <span>Monitored Catchment Basins Directory</span>
          </h2>
          <p className="text-xs text-bb-muted mt-0.5">
            Geomorphological profiles, river gauges, and vulnerability indices across {regions.length} critical Indian mountain zones
          </p>
        </div>

        {/* Search & State Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-bb-subtle absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter basin name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#091122] text-white text-xs border border-bb-border rounded pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-bb-accent w-40 sm:w-56"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-[#091122] text-white text-xs border border-bb-border rounded px-2.5 py-1.5 focus:outline-none focus:border-bb-accent font-mono cursor-pointer"
          >
            {states.map(st => (
              <option key={st} value={st}>{st === 'ALL' ? 'All States' : st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Module */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bb-border/70 pb-3">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-bb-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Side-by-Side Basin Comparison Tool
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-bb-muted">Compare With:</span>
            <select
              value={compareRegion?.id || ''}
              onChange={(e) => setCompareRegionId(e.target.value)}
              className="bg-[#091122] text-white text-xs border border-bb-border rounded px-2 py-1 font-semibold cursor-pointer"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.state})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedRegion && compareRegion && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basin 1 (Active) */}
            <div className="bg-[#091122] border border-bb-accent/40 rounded p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-bb-accent block font-bold">Selected Primary Basin</span>
                  <h4 className="text-base font-bold text-white">{selectedRegion.name}</h4>
                  <div className="text-xs text-bb-muted">{selectedRegion.state} &bull; {selectedRegion.river_basin}</div>
                </div>
                <SeverityBadge level={selectedRegion.risk_assessment?.risk_level} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-bb-border/50">
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">Risk Score:</span>
                  <span className="text-lg font-bold text-white">{selectedRegion.risk_assessment?.risk_score} / 100</span>
                </div>
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">Rainfall 24h:</span>
                  <span className="text-lg font-bold text-blue-400">{selectedRegion.environmental_data?.rainfall} mm</span>
                </div>
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">River Gauge:</span>
                  <span className="text-lg font-bold text-orange-400">{selectedRegion.environmental_data?.river_level} m</span>
                </div>
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">Soil Saturation:</span>
                  <span className="text-lg font-bold text-cyan-400">{selectedRegion.environmental_data?.soil_moisture}%</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-bb-subtle flex justify-between pt-1">
                <span>Elevation: {selectedRegion.environmental_data?.elevation}m</span>
                <span>Slope: {selectedRegion.environmental_data?.slope}°</span>
                <span>Area: {selectedRegion.environmental_data?.catchment_area_sqkm} km²</span>
              </div>
            </div>

            {/* Basin 2 (Comparison Target) */}
            <div className="bg-[#091122] border border-bb-border rounded p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-bb-muted block font-semibold">Comparative Basin</span>
                  <h4 className="text-base font-bold text-white">{compareRegion.name}</h4>
                  <div className="text-xs text-bb-muted">{compareRegion.state} &bull; {compareRegion.river_basin}</div>
                </div>
                <SeverityBadge level={compareRegion.risk_assessment?.risk_level} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-bb-border/50">
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">Risk Score:</span>
                  <span className="text-lg font-bold text-white">{compareRegion.risk_assessment?.risk_score} / 100</span>
                </div>
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">Rainfall 24h:</span>
                  <span className="text-lg font-bold text-blue-400">{compareRegion.environmental_data?.rainfall} mm</span>
                </div>
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">River Gauge:</span>
                  <span className="text-lg font-bold text-orange-400">{compareRegion.environmental_data?.river_level} m</span>
                </div>
                <div className="bg-bb-panel/50 p-2 rounded">
                  <span className="text-bb-subtle text-[10px] block">Soil Saturation:</span>
                  <span className="text-lg font-bold text-cyan-400">{compareRegion.environmental_data?.soil_moisture}%</span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-bb-subtle flex justify-between pt-1">
                <span>Elevation: {compareRegion.environmental_data?.elevation}m</span>
                <span>Slope: {compareRegion.environmental_data?.slope}°</span>
                <span>Area: {compareRegion.environmental_data?.catchment_area_sqkm} km²</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Catchments Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(region => {
          const isSelected = selectedRegion?.id === region.id;
          const riskLevel = region.risk_assessment?.risk_level || 'LOW';
          const score = Number(region.risk_assessment?.risk_score) || 0;

          return (
            <div
              key={region.id}
              onClick={() => onSelectRegion(region)}
              className={`bg-bb-card border rounded-lg p-4 transition-all cursor-pointer shadow-flat hover:border-bb-accent/80 space-y-3 ${
                isSelected ? 'border-bb-accent ring-1 ring-bb-accent/40' : 'border-bb-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{region.name}</h4>
                  <p className="text-xs text-bb-muted">{region.state} &bull; {region.river_basin}</p>
                </div>
                <SeverityBadge level={riskLevel} size="xs" />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#091122] p-2 rounded font-mono text-center text-xs">
                <div>
                  <span className="text-[10px] text-bb-subtle uppercase block">Risk</span>
                  <span className="font-bold text-white tabular-nums">{score.toFixed(1)}</span>
                </div>
                <div className="border-x border-bb-border/60">
                  <span className="text-[10px] text-bb-subtle uppercase block">Rain 24h</span>
                  <span className="font-bold text-blue-400 tabular-nums">{Number(region.environmental_data?.rainfall).toFixed(1)}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-bb-subtle uppercase block">River</span>
                  <span className="font-bold text-orange-400 tabular-nums">{Number(region.environmental_data?.river_level).toFixed(2)}m</span>
                </div>
              </div>

              <div className="text-[11px] text-bb-subtle line-clamp-1">
                {region.risk_assessment?.contributing_factors?.[0] || 'Parameters normal'}
              </div>

              <div className="flex items-center justify-between text-xs text-bb-accent font-semibold pt-1 border-t border-bb-border/50">
                <span>{isSelected ? 'Currently Selected' : 'Set Active'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
