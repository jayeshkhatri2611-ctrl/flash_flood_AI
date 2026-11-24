import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUp,
  ArrowDown
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
  const [sortAsc, setSortAsc] = useState(false); // default: highest risk score descending

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // Default to desc for newly clicked field
    }
  };

  // Filter and sort
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
      case 'last_updated':
        aVal = a.risk_assessment?.last_updated || '';
        bVal = b.risk_assessment?.last_updated || '';
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      default:
        aVal = Number(a.risk_assessment?.risk_score) || 0;
        bVal = Number(b.risk_assessment?.risk_score) || 0;
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bb-border/70 pb-3 mb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Catchment Vulnerability Matrix
          </h3>
          <p className="text-[11px] text-bb-subtle">
            Comparative risk score ranking across {regions.length} monitored Himalayan & North-Eastern river basins
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-bb-subtle absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search basin, state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#091122] text-white text-xs border border-bb-border rounded pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-bb-accent w-36 sm:w-48 placeholder-bb-subtle"
            />
          </div>

          {/* Risk Level Filter Dropdown */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#091122] text-white text-xs border border-bb-border rounded px-2.5 py-1.5 focus:outline-none focus:border-bb-accent cursor-pointer font-mono"
          >
            <option value="ALL">All Tiers ({regions.length})</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Dense Bloomberg-Style Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse" role="table">
          <thead>
            <tr className="border-b border-bb-border text-[11px] text-bb-muted uppercase tracking-wider bg-[#091122]/60 select-none">
              <th 
                className="py-2 px-3 cursor-pointer hover:text-white"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Catchment / State</span>
                  <ArrowUpDown className="w-3 h-3 text-bb-subtle" />
                </div>
              </th>
              <th className="py-2 px-3">Hazard Tier</th>
              <th 
                className="py-2 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('risk_score')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3 text-bb-subtle" />
                </div>
              </th>
              <th 
                className="py-2 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('rainfall')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Rain 24h</span>
                  <ArrowUpDown className="w-3 h-3 text-bb-subtle" />
                </div>
              </th>
              <th 
                className="py-2 px-3 text-right cursor-pointer hover:text-white"
                onClick={() => handleSort('river_level')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>River Stage</span>
                  <ArrowUpDown className="w-3 h-3 text-bb-subtle" />
                </div>
              </th>
              <th 
                className="py-2 px-3 text-right cursor-pointer hover:text-white hidden sm:table-cell"
                onClick={() => handleSort('last_updated')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Last Sync</span>
                  <ArrowUpDown className="w-3 h-3 text-bb-subtle" />
                </div>
              </th>
              <th className="py-2 px-2 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bb-border/50">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-bb-muted font-mono">
                  No catchments matching "{search}" in tier "{riskFilter}".
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
                        ? 'bg-bb-accent/10 border-l-2 border-l-bb-accent text-white font-semibold' 
                        : 'hover:bg-bb-panel/60 text-slate-300'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-sans font-semibold text-white group-hover:text-bb-accent transition-colors">
                        {reg.name}
                      </div>
                      <div className="text-[10px] text-bb-subtle">
                        {reg.state} &bull; {reg.river_basin}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <SeverityBadge level={riskLevel} size="xs" />
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums font-bold">
                      <span className={score >= 80 ? 'text-red-400' : (score >= 60 ? 'text-orange-400' : 'text-slate-200')}>
                        {score.toFixed(1)}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className="text-white">{rain.toFixed(1)}</span>
                      <span className="text-bb-subtle ml-1 text-[10px]">mm</span>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums">
                      <span className={isBreached ? 'text-red-400 font-bold' : 'text-white'}>
                        {river.toFixed(2)}
                      </span>
                      <span className="text-bb-subtle ml-1 text-[10px]">m</span>
                    </td>

                    <td className="py-2.5 px-3 text-right tabular-nums text-bb-subtle text-[11px] hidden sm:table-cell">
                      {reg.risk_assessment?.last_updated ? reg.risk_assessment.last_updated.split(' ')[1] || 'Just now' : 'Synced'}
                    </td>

                    <td className="py-2.5 px-2 text-center text-bb-subtle group-hover:text-bb-accent">
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
