import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import { Waves, CloudRain, AlertTriangle, Info } from 'lucide-react';

export default function HydroChartCard({ selectedRegion }) {
  const [activeRange, setActiveRange] = useState('24h');

  if (!selectedRegion) {
    return (
      <div className="h-96 bg-bb-card border border-bb-border rounded-lg p-5 flex items-center justify-center text-xs text-bb-muted font-mono">
        Select a catchment basin to load hydrological telemetry.
      </div>
    );
  }

  const rawHistory = selectedRegion.historical_24h || [];
  const env = selectedRegion.environmental_data || {};
  const dangerLevel = Number(env.danger_level) || 4.5;

  // Filter range dynamically based on real data
  const filteredData = (() => {
    if (activeRange === '1h') return rawHistory.slice(-2);
    if (activeRange === '6h') return rawHistory.slice(-4);
    return rawHistory; // 24h default
  })();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0B1427] border border-bb-border p-3 rounded shadow-2xl text-xs font-mono space-y-1.5 z-50">
          <div className="font-bold text-white border-b border-bb-border pb-1">
            Hour: {label}
          </div>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between space-x-4">
              <span className="flex items-center space-x-1.5" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold text-white tabular-nums">
                {Number(item.value).toFixed(2)} {item.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-col justify-between">
      {/* Card Header & Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bb-border/70 pb-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1.5">
              <span>Hydrological Response Telemetry</span>
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bb-panel text-bb-muted border border-bb-border">
              {selectedRegion.river_basin}
            </span>
          </div>
          <p className="text-[11px] text-bb-subtle mt-0.5">
            Precipitation surge (bars) vs downstream river gauge height (line)
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 bg-[#091122] p-0.5 rounded border border-bb-border text-[11px] font-mono">
          {[
            { id: '1h', label: '1H', available: true },
            { id: '6h', label: '6H', available: true },
            { id: '24h', label: '24H', available: true },
            { id: '7d', label: '7D', available: false, reason: '7-day archive not available from current data source' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => btn.available && setActiveRange(btn.id)}
              disabled={!btn.available}
              title={!btn.available ? btn.reason : undefined}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeRange === btn.id && btn.available
                  ? 'bg-bb-accent text-white font-bold shadow-sm'
                  : btn.available
                    ? 'text-bb-muted hover:text-white hover:bg-bb-panel'
                    : 'text-bb-subtle/40 cursor-not-allowed line-through'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#1E2D4A" strokeDasharray="3 3" opacity={0.6} />
            <XAxis 
              dataKey="hour" 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              fontFamily="monospace"
            />
            {/* Left Axis: Rainfall (mm) */}
            <YAxis 
              yAxisId="left" 
              stroke="#00A8FF" 
              fontSize={11} 
              tickLine={false}
              fontFamily="monospace"
              label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#00A8FF', fontSize: 10 }}
            />
            {/* Right Axis: River Gauge (m) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#F97316" 
              fontSize={11} 
              tickLine={false}
              fontFamily="monospace"
              domain={[0, Math.max(dangerLevel + 1.0, 6.0)]}
              label={{ value: 'River Stage (m)', angle: 90, position: 'insideRight', fill: '#F97316', fontSize: 10 }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Danger mark line */}
            <ReferenceLine 
              y={dangerLevel} 
              yAxisId="right" 
              stroke="#EF4444" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ value: `DANGER ${dangerLevel}m`, fill: '#EF4444', fontSize: 10, position: 'right' }} 
            />

            {/* Bars for Rainfall */}
            <Bar 
              yAxisId="left" 
              dataKey="rainfall_mm" 
              name="Rainfall" 
              fill="#00A8FF" 
              unit="mm" 
              radius={[3, 3, 0, 0]} 
              barSize={20}
            />

            {/* Line for River Gauge */}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="river_level_m" 
              name="River Level" 
              stroke="#F97316" 
              strokeWidth={2.5} 
              dot={{ r: 3, fill: '#F97316', stroke: '#080F1F', strokeWidth: 1.5 }}
              unit="m" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Legend & Legend Meta */}
      <div className="mt-3 pt-2.5 border-t border-bb-border/50 flex flex-wrap items-center justify-between text-[11px] font-mono text-bb-muted gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#00A8FF]" />
            <span className="text-slate-300">Rainfall (IMD AWS)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-[#F97316]" />
            <span className="text-slate-300">River Stage (CWC Telemetry)</span>
          </span>
        </div>

        <div className="flex items-center space-x-1 text-bb-subtle">
          <Info className="w-3 h-3 text-bb-accent" />
          <span>Hydraulic response lag: ~2 to 4 hours</span>
        </div>
      </div>
    </div>
  );
}
