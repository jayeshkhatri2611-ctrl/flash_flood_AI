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
  ReferenceLine
} from 'recharts';
import { Waves, CloudRain, Info, Activity } from 'lucide-react';

export default function HydroChartCard({ selectedRegion }) {
  const [activeRange, setActiveRange] = useState('24h');

  if (!selectedRegion) {
    return (
      <div className="h-96 bg-app-card rounded-panel border border-app-border p-5 flex items-center justify-center text-xs text-app-muted">
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
        <div className="bg-app-card/95 backdrop-blur-md border border-app-border p-3.5 rounded-xl shadow-2xl text-xs space-y-2 z-50">
          <div className="font-semibold text-white border-b border-app-border pb-1.5 flex items-center justify-between">
            <span>Time: {label}</span>
            <span className="text-[10px] text-app-muted font-normal">Observed</span>
          </div>
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between space-x-5">
              <span className="flex items-center space-x-2" style={{ color: item.color }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-slate-300">{item.name}:</span>
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
    <div className="bg-app-card rounded-panel border border-app-border p-5 shadow-card flex flex-col justify-between">
      {/* Header & Range Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border/70 pb-3.5 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-app-primary" />
              <span>Hydrological Response Telemetry</span>
            </h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-app-elevated text-app-cyan border border-app-border">
              {selectedRegion.river_basin}
            </span>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Upstream precipitation volume (bars) vs downstream river gauge height (line)
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1 bg-app-elevated/70 p-1 rounded-full border border-app-border text-xs">
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
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeRange === btn.id && btn.available
                  ? 'bg-app-primary text-white shadow-sm'
                  : btn.available
                    ? 'text-app-muted hover:text-white hover:bg-app-card'
                    : 'text-app-muted/30 cursor-not-allowed line-through'
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
          <ComposedChart data={filteredData} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1B2B45" strokeDasharray="3 3" opacity={0.5} vertical={false} />
            <XAxis 
              dataKey="hour" 
              stroke="#64748B" 
              fontSize={11} 
              tickLine={false}
              axisLine={{ stroke: '#1B2B45' }}
            />
            {/* Left Axis: Rainfall (mm) */}
            <YAxis 
              yAxisId="left" 
              stroke="#3B82F6" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#3B82F6', fontSize: 11, offset: 12 }}
            />
            {/* Right Axis: River Gauge (m) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#F97316" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              domain={[0, Math.max(dangerLevel + 1.0, 6.0)]}
              label={{ value: 'River Stage (m)', angle: 90, position: 'insideRight', fill: '#F97316', fontSize: 11, offset: 12 }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Danger mark line */}
            <ReferenceLine 
              y={dangerLevel} 
              yAxisId="right" 
              stroke="#EF4444" 
              strokeDasharray="4 4" 
              strokeWidth={1.5}
              label={{ value: `Danger Mark: ${dangerLevel}m`, fill: '#EF4444', fontSize: 11, position: 'top' }} 
            />

            {/* Bars for Rainfall */}
            <Bar 
              yAxisId="left" 
              dataKey="rainfall_mm" 
              name="Rainfall" 
              fill="url(#rainGradient)" 
              unit="mm" 
              radius={[4, 4, 0, 0]} 
              barSize={18}
            />

            {/* Line for River Gauge */}
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="river_level_m" 
              name="River Level" 
              stroke="#F97316" 
              strokeWidth={2.5} 
              dot={{ r: 3, fill: '#F97316', stroke: '#080E1B', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#F97316', stroke: '#FFFFFF', strokeWidth: 2 }}
              unit="m" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Meta */}
      <div className="mt-4 pt-3 border-t border-app-border/60 flex flex-wrap items-center justify-between text-xs text-app-muted gap-2">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-cyan-400 to-blue-500" />
            <span className="text-slate-200 font-medium">Precipitation (IMD AWS)</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="w-3 h-0.5 bg-[#F97316]" />
            <span className="text-slate-200 font-medium">River Stage (CWC)</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-app-subtle">
          <Info className="w-3.5 h-3.5 text-app-cyan" />
          <span>Hydraulic response lag: ~2 to 4 hours</span>
        </div>
      </div>
    </div>
  );
}
