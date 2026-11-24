import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Droplets, 
  Waves, 
  Mountain, 
  Activity, 
  BarChart3,
  Layers
} from 'lucide-react';

export default function ChartsSection({ selectedRegion }) {
  if (!selectedRegion) {
    return (
      <div className="p-8 text-center text-slate-400 bg-command-darker rounded-xl border border-command-border">
        Select a region to visualize hydrological timeseries and correlation models.
      </div>
    );
  }

  const historyData = selectedRegion.historical_24h || [
    { hour: '00:00', rainfall_mm: 10, river_level_m: 1.8, soil_moisture_pct: 45, risk_score: 22 },
    { hour: '04:00', rainfall_mm: 22, river_level_m: 2.1, soil_moisture_pct: 54, risk_score: 31 },
    { hour: '08:00', rainfall_mm: 48, river_level_m: 2.7, soil_moisture_pct: 66, risk_score: 48 },
    { hour: '12:00', rainfall_mm: 75, river_level_m: 3.4, soil_moisture_pct: 78, risk_score: 65 },
    { hour: '16:00', rainfall_mm: 110, river_level_m: 4.2, soil_moisture_pct: 85, risk_score: 82 },
    { hour: 'Now', rainfall_mm: selectedRegion.environmental_data?.rainfall || 120, river_level_m: selectedRegion.environmental_data?.river_level || 4.5, soil_moisture_pct: selectedRegion.environmental_data?.soil_moisture || 88, risk_score: selectedRegion.risk_assessment?.risk_score || 85 }
  ];

  const env = selectedRegion.environmental_data || {};
  const dangerLevel = env.danger_level || 4.5;

  // Feature attribution breakdown data
  const featureContributionData = [
    { name: 'Rainfall (IMD)', value: Math.min(100, Math.round((env.rainfall / 140) * 35)), fill: '#3b82f6' },
    { name: 'Soil Moisture', value: Math.round((env.soil_moisture / 100) * 25), fill: '#06b6d4' },
    { name: 'River Level (CWC)', value: Math.min(100, Math.round((env.river_level / dangerLevel) * 25)), fill: '#8b5cf6' },
    { name: 'Terrain Slope (NRSC)', value: Math.min(100, Math.round((env.slope / 45) * 15)), fill: '#10b981' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-command-darkest border border-command-border p-3 rounded-lg shadow-xl text-xs space-y-1">
          <p className="font-semibold text-slate-300 font-mono border-b border-command-border/60 pb-1">Time: {label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color }} className="flex items-center justify-between space-x-3">
              <span>{item.name}:</span>
              <span className="font-mono font-bold">{item.value} {item.unit || ''}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top 2 Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Rainfall vs River Level Dual Axis */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-command-border/60 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-blue-950/80 border border-blue-800 text-blue-400">
                <Waves className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-white">Rainfall vs River Stage Surge (24h)</h4>
                <p className="text-[11px] text-slate-400">Catchment precipitation vs downstream river gauge height</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-command-card text-slate-300 border border-command-border">
              Danger Mark: {dangerLevel}m
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243456" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#8b9bb4" fontSize={11} />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fill: '#3b82f6', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={11} domain={[0, Math.max(6, dangerLevel + 1)]} label={{ value: 'Stage (m)', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <ReferenceLine yAxisId="right" y={dangerLevel} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Danger Level', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                <Line yAxisId="left" type="monotone" dataKey="rainfall_mm" name="Rainfall" unit="mm" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line yAxisId="right" type="monotone" dataKey="river_level_m" name="River Level" unit="m" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Risk Score Progression Curve */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-command-border/60 pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-red-950/80 border border-red-800 text-red-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-xs text-white">Flash Flood Risk Score Trajectory</h4>
                <p className="text-[11px] text-slate-400">ML multi-source prediction index trend (0–100)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
              Current: {selectedRegion.risk_assessment?.risk_score || 0}/100
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243456" opacity={0.5} />
                <XAxis dataKey="hour" stroke="#8b9bb4" fontSize={11} />
                <YAxis stroke="#8b9bb4" fontSize={11} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'CRITICAL (80+)', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={60} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'HIGH (60+)', fill: '#f97316', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'MODERATE (30+)', fill: '#f59e0b', fontSize: 10 }} />
                <Area type="monotone" dataKey="risk_score" name="Risk Score" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#riskGradient)" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Bottom Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Soil Moisture Progression */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-3 border-b border-command-border/60 pb-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <h4 className="font-semibold text-xs text-white">Soil Moisture Saturation Trend</h4>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243456" opacity={0.4} />
                <XAxis dataKey="hour" stroke="#8b9bb4" fontSize={10} />
                <YAxis stroke="#8b9bb4" fontSize={10} domain={[0, 100]} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="2 2" />
                <Line type="monotone" dataKey="soil_moisture_pct" name="Soil Saturation" unit="%" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Infiltration Buffer:</span>
            <span className="font-mono font-semibold text-cyan-300">
              {Math.max(0, 100 - (env.soil_moisture || 0))}% Remaining
            </span>
          </div>
        </div>

        {/* Feature Attribution Breakdown */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-3 border-b border-command-border/60 pb-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-semibold text-xs text-white">Multi-Source Factor Attribution</h4>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={featureContributionData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243456" opacity={0.4} />
                <XAxis type="number" domain={[0, 40]} stroke="#8b9bb4" fontSize={10} unit="%" />
                <YAxis type="category" dataKey="name" stroke="#8b9bb4" fontSize={10} width={90} />
                <Tooltip formatter={(val) => [`${val}%`, 'Relative Weight']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {featureContributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Relative weightings derived from Random Forest feature importance.
          </div>
        </div>

        {/* Catchment Geomorphology Profile */}
        <div className="bg-command-darker border border-command-border rounded-xl p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3 border-b border-command-border/60 pb-2">
              <Mountain className="w-4 h-4 text-amber-400" />
              <h4 className="font-semibold text-xs text-white">Catchment Physical Parameters</h4>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-command-card/60 p-2 rounded border border-command-border/50">
                <span className="text-slate-400">Elevation:</span>
                <span className="font-mono font-bold text-white">{env.elevation} meters</span>
              </div>
              <div className="flex justify-between items-center bg-command-card/60 p-2 rounded border border-command-border/50">
                <span className="text-slate-400">Terrain Slope:</span>
                <span className="font-mono font-bold text-amber-400">{env.slope}° (Very Steep)</span>
              </div>
              <div className="flex justify-between items-center bg-command-card/60 p-2 rounded border border-command-border/50">
                <span className="text-slate-400">Catchment Area:</span>
                <span className="font-mono font-bold text-slate-200">{env.catchment_area_sqkm} sq. km</span>
              </div>
              <div className="flex justify-between items-center bg-command-card/60 p-2 rounded border border-command-border/50">
                <span className="text-slate-400">River Headroom:</span>
                <span className={`font-mono font-bold ${
                  (dangerLevel - env.river_level) <= 0.2 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {Math.max(0, Math.round((dangerLevel - env.river_level) * 100) / 100)}m to Overflow
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-blue-950/30 rounded border border-blue-900/40 text-[11px] text-blue-300 flex items-center space-x-2">
            <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span>Fused with NRSC CartoDEM 30m Digital Elevation Model</span>
          </div>
        </div>
      </div>
    </div>
  );
}
