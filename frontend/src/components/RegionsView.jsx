import React, { useState } from 'react';
import { 
  Globe2, 
  Search, 
  ArrowRightLeft, 
  ChevronRight,
  MapPin,
  Compass,
  Check
} from 'lucide-react';
import { SeverityBadge } from '../utils/theme';

export default function RegionsView({
  regions = [],
  selectedRegion,
  onSelectRegion
}) {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [compareRegionId, setCompareRegionId] = useState('');

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-app-card rounded-panel border border-app-border p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2.5">
            <Globe2 className="w-5 h-5 text-app-primary" />
            <span>Basin Directory & Vulnerability Catalog</span>
          </h2>
          <p className="text-xs text-app-muted mt-1">
            Geomorphological profiles, stage gauges, and vulnerability indices across {regions.length} critical mountain zones
          </p>
        </div>

        {/* Search & State Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-app-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter basin name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-app-elevated/70 text-white text-xs border border-app-border rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-app-primary w-44 sm:w-60 placeholder-app-muted"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-app-elevated/70 text-white text-xs border border-app-border rounded-lg px-3 py-2 focus:outline-none focus:border-app-primary font-medium cursor-pointer"
          >
            {states.map(st => (
              <option key={st} value={st}>{st === 'ALL' ? 'All States' : st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Module */}
      <div className="bg-app-card rounded-panel border border-app-border p-5 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border/70 pb-3.5">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-4 h-4 text-app-cyan" />
            <h3 className="text-sm font-bold text-white">
              Side-by-Side Catchment Comparative Analysis
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-app-muted">Compare With:</span>
            <select
              value={compareRegion?.id || ''}
              onChange={(e) => setCompareRegionId(e.target.value)}
              className="bg-app-elevated text-white text-xs border border-app-border rounded-lg px-3 py-1.5 font-medium cursor-pointer"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.state})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedRegion && compareRegion && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Basin 1 (Active) */}
            <div className="bg-app-elevated/50 border border-app-primary/40 rounded-xl p-4 space-y-3 shadow-glow">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-app-cyan block uppercase">Selected Active Basin</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{selectedRegion.name}</h4>
                  <div className="text-xs text-app-muted">{selectedRegion.state} &bull; {selectedRegion.river_basin}</div>
                </div>
                <SeverityBadge level={selectedRegion.risk_assessment?.risk_level} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-app-border/50">
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">Risk Score:</span>
                  <span className="text-lg font-bold text-white tabular-nums">{selectedRegion.risk_assessment?.risk_score} / 100</span>
                </div>
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">Rainfall 24h:</span>
                  <span className="text-lg font-bold text-blue-400 tabular-nums">{selectedRegion.environmental_data?.rainfall} mm</span>
                </div>
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">River Stage:</span>
                  <span className="text-lg font-bold text-orange-400 tabular-nums">{selectedRegion.environmental_data?.river_level} m</span>
                </div>
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">Soil Saturation:</span>
                  <span className="text-lg font-bold text-cyan-400 tabular-nums">{selectedRegion.environmental_data?.soil_moisture}%</span>
                </div>
              </div>

              <div className="text-xs text-app-muted flex justify-between pt-1">
                <span>Elevation: {selectedRegion.environmental_data?.elevation}m</span>
                <span>Slope: {selectedRegion.environmental_data?.slope}°</span>
                <span>Area: {selectedRegion.environmental_data?.catchment_area_sqkm} km²</span>
              </div>
            </div>

            {/* Basin 2 (Comparison Target) */}
            <div className="bg-app-elevated/30 border border-app-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-app-muted block uppercase">Comparative Basin</span>
                  <h4 className="text-base font-bold text-white mt-0.5">{compareRegion.name}</h4>
                  <div className="text-xs text-app-muted">{compareRegion.state} &bull; {compareRegion.river_basin}</div>
                </div>
                <SeverityBadge level={compareRegion.risk_assessment?.risk_level} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-app-border/50">
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">Risk Score:</span>
                  <span className="text-lg font-bold text-white tabular-nums">{compareRegion.risk_assessment?.risk_score} / 100</span>
                </div>
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">Rainfall 24h:</span>
                  <span className="text-lg font-bold text-blue-400 tabular-nums">{compareRegion.environmental_data?.rainfall} mm</span>
                </div>
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">River Stage:</span>
                  <span className="text-lg font-bold text-orange-400 tabular-nums">{compareRegion.environmental_data?.river_level} m</span>
                </div>
                <div className="bg-app-card/70 p-2.5 rounded-lg">
                  <span className="text-app-muted text-[11px] block">Soil Saturation:</span>
                  <span className="text-lg font-bold text-cyan-400 tabular-nums">{compareRegion.environmental_data?.soil_moisture}%</span>
                </div>
              </div>

              <div className="text-xs text-app-muted flex justify-between pt-1">
                <span>Elevation: {compareRegion.environmental_data?.elevation}m</span>
                <span>Slope: {compareRegion.environmental_data?.slope}°</span>
                <span>Area: {compareRegion.environmental_data?.catchment_area_sqkm} km²</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Monitored Catchments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(region => {
          const isSelected = selectedRegion?.id === region.id;
          const riskLevel = region.risk_assessment?.risk_level || 'LOW';
          const score = Number(region.risk_assessment?.risk_score) || 0;

          return (
            <div
              key={region.id}
              onClick={() => onSelectRegion(region)}
              className={`bg-app-card rounded-panel border p-5 transition-all cursor-pointer shadow-card hover:border-app-primary space-y-3.5 ${
                isSelected ? 'border-app-primary ring-1 ring-app-primary shadow-glow' : 'border-app-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{region.name}</h4>
                  <p className="text-xs text-app-muted">{region.state} &bull; {region.river_basin}</p>
                </div>
                <SeverityBadge level={riskLevel} size="xs" />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-app-elevated/50 p-2.5 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[11px] text-app-muted block">Risk Score</span>
                  <span className="font-bold text-white tabular-nums text-sm mt-0.5 block">{score.toFixed(1)}</span>
                </div>
                <div className="border-x border-app-border/70">
                  <span className="text-[11px] text-app-muted block">Rain 24h</span>
                  <span className="font-bold text-blue-400 tabular-nums text-sm mt-0.5 block">{Number(region.environmental_data?.rainfall).toFixed(1)}mm</span>
                </div>
                <div>
                  <span className="text-[11px] text-app-muted block">River Stage</span>
                  <span className="font-bold text-orange-400 tabular-nums text-sm mt-0.5 block">{Number(region.environmental_data?.river_level).toFixed(2)}m</span>
                </div>
              </div>

              <div className="text-xs text-app-muted line-clamp-1">
                {region.risk_assessment?.contributing_factors?.[0] || 'Hydrological parameters normal'}
              </div>

              <div className="flex items-center justify-between text-xs text-app-primary font-semibold pt-2 border-t border-app-border">
                <span>{isSelected ? 'Currently Selected' : 'Set Active in Console'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
