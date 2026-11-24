import React, { useState } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  Layers
} from 'lucide-react';
import { SeverityBadge } from '../utils/theme';

export default function RegionsRiskTable({
  regions = [],
  selectedRegion,
  onSelectRegion
}) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState('risk_score');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filtered = regions.filter(reg => {
    const matchesSearch = search === '' || 
      reg.name.toLowerCase().includes(search.toLowerCase()) ||
      reg.state.toLowerCase().includes(search.toLowerCase()) ||
      reg.river_basin.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || 
      (reg.risk_assessment?.risk_level === riskFilter);

    return matchesSearch && matchesRisk;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    switch (sortField) {
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      case 'risk_score':
        aVal = Number(a.risk_assessment?.risk_score) || 0;
        bVal = Number(b.risk_assessment?.risk_score) || 0;
        break;
      case 'rainfall':
        aVal = Number(a.environmental_data?.rainfall) || 0;
        bVal = Number(b.environmental_data?.rainfall) || 0;
        break;
      case 'river_level':
        aVal = Number(a.environmental_data?.river_level) || 0;
        bVal = Number(b.environmental_data?.river_level) || 0;
        break;
      default:
        aVal = Number(a.risk_assessment?.risk_score) || 0;
        bVal = Number(b.risk_assessment?.risk_score) || 0;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="bg-app-card rounded-panel border border-app-border p-5 shadow-card flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border/70 pb-3.5 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-app-primary" />
            <span>Catchment Vulnerability Matrix</span>
          </h3>
          <p className="text-xs text-app-muted mt-0.5">
            Comparative risk score ranking across {regions.length} monitored river basins
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-app-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter basin or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-app-elevated/70 text-white text-xs border border-app-border rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-app-primary w-40 sm:w-48 placeholder-app-muted"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-app-elevated/70 text-white text-xs border border-app-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-app-primary cursor-pointer font-medium"
          >
            <option value="ALL">All Tiers ({regions.length})</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Modern Clean Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-app-border text-xs text-app-muted font-medium bg-app-elevated/30 select-none">
              <th 
                className="py-2.5 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1.5">
                  <span>Basin & State</span>
                  <ArrowUpDown className="w-3 h-3 text-app-muted" />
                </div>
              </th>
              <th className="py-2.5 px-3">Hazard Status</th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('risk_score')}
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3 text-app-muted" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('rainfall')}
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>Rain 24h</span>
                  <ArrowUpDown className="w-3 h-3 text-app-muted" />
                </div>
              </th>
              <th 
                className="py-2.5 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('river_level')}
              >
                <div className="flex items-center justify-end space-x-1.5">
                  <span>River Stage</span>
                  <ArrowUpDown className="w-3 h-3 text-app-muted" />
                </div>
              </th>
              <th className="py-2.5 px-2 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border/40">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-app-muted">
                  No basins matching "{search}" in tier "{riskFilter}".
                </td>
              </tr>
            ) : (
              sorted.map((reg) => {
                const isSelected = selectedRegion?.id === reg.id;
                const riskLevel = reg.risk_assessment?.risk_level || 'LOW';
                const score = Number(reg.risk_assessment?.risk_score) || 0;
                const rain = Number(reg.environmental_data?.rainfall) || 0;
                const river = Number(reg.environmental_data?.river_level) || 0;
                const danger = Number(reg.environmental_data?.danger_level) || 4.5;
                const isBreached = river >= danger;

                return (
                  <tr
                    key={reg.id}
                    onClick={() => onSelectRegion(reg)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected 
                        ? 'bg-app-primary/10 border-l-2 border-l-app-primary text-white font-medium' 
                        : 'hover:bg-app-elevated/50 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white group-hover:text-app-cyan transition-colors">
                        {reg.name}
                      </div>
                      <div className="text-[11px] text-app-muted">
                        {reg.state} &bull; {reg.river_basin}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <SeverityBadge level={riskLevel} size="xs" />
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums font-bold text-sm">
                      <span className={score >= 80 ? 'text-red-400' : (score >= 60 ? 'text-orange-400' : 'text-slate-200')}>
                        {score.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className="text-white font-medium">{rain.toFixed(1)}</span>
                      <span className="text-app-muted ml-1 text-xs">mm</span>
                    </td>

                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className={isBreached ? 'text-red-400 font-bold' : 'text-white font-medium'}>
                        {river.toFixed(2)}
                      </span>
                      <span className="text-app-muted ml-1 text-xs">m</span>
                    </td>

                    <td className="py-3 px-2 text-center text-app-muted group-hover:text-app-primary">
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
