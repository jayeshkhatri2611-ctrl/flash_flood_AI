import React from 'react';
import { 
  ShieldAlert, 
  CloudRain, 
  Waves, 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertCircle
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

function MiniSparkline({ data = [], dataKey, strokeColor = '#00A8FF', fillColor = 'rgba(0,168,255,0.15)' }) {
  if (!data || data.length < 2) {
    return <div className="h-7 w-24 text-[10px] text-bb-subtle flex items-center">No trend data</div>;
  }

  const values = data.map(d => Number(d[dataKey]) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 100;
  const height = 28;
  const points = values.map((val, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="h-7 w-24 flex items-center justify-end" title={`24h Trend (${min.toFixed(1)} - ${max.toFixed(1)})`}>
      <svg width={width} height={height} className="overflow-visible">
        <polygon points={areaPoints} fill={fillColor} />
        <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function KpiRow({ selectedRegion }) {
  if (!selectedRegion) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-bb-card border border-bb-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const env = selectedRegion.environmental_data || {};
  const risk = selectedRegion.risk_assessment || {};
  const history = selectedRegion.historical_24h || [];

  // 1. Risk Score calculations
  const score = Number(risk.risk_score) || 0;
  const riskLevel = risk.risk_level || 'LOW';
  const riskMeta = getRiskMeta(riskLevel);

  // Derive trend from real timeseries
  const calculateTrend = (dataKey) => {
    if (history.length < 2) return { text: 'steady', icon: Minus, color: 'text-bb-muted' };
    const first = Number(history[0][dataKey]) || 0;
    const last = Number(history[history.length - 1][dataKey]) || 0;
    const diff = last - first;
    if (diff > 0.1) return { text: `+${diff.toFixed(1)} (rising)`, icon: TrendingUp, color: 'text-red-400' };
    if (diff < -0.1) return { text: `${diff.toFixed(1)} (falling)`, icon: TrendingDown, color: 'text-emerald-400' };
    return { text: 'steady', icon: Minus, color: 'text-bb-muted' };
  };

  const riskTrend = calculateTrend('risk_score');
  const rainTrend = calculateTrend('rainfall_mm');
  const riverTrend = calculateTrend('river_level_m');
  const soilTrend = calculateTrend('soil_moisture_pct');

  const dangerMark = Number(env.danger_level) || 4.5;
  const currentRiver = Number(env.river_level) || 0;
  const riverHeadroom = (dangerMark - currentRiver).toFixed(2);
  const isRiverBreached = currentRiver >= dangerMark;

  // Soil saturation class
  const soilVal = Number(env.soil_moisture) || 0;
  const soilClass = soilVal >= 85 ? 'Near Saturated' : (soilVal >= 70 ? 'High Saturation' : (soilVal >= 45 ? 'Moderate Buffer' : 'Dry Sponge'));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Flash Flood Risk Score */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-bb-muted">Flash Flood Risk</span>
          <SeverityBadge level={riskLevel} size="xs" pulse={riskLevel === 'CRITICAL'} />
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span 
              className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight"
              style={{ color: riskMeta.color }}
            >
              {score.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-bb-subtle font-semibold">/ 100</span>
          </div>

          <MiniSparkline 
            data={history} 
            dataKey="risk_score" 
            strokeColor={riskMeta.color} 
            fillColor={`${riskMeta.color}20`}
          />
        </div>

        {/* Progress Bar & Trend */}
        <div className="space-y-1.5">
          <div className="w-full h-1.5 bg-[#091122] rounded-full overflow-hidden border border-bb-border/40">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(100, Math.max(5, score))}%`, 
                backgroundColor: riskMeta.color 
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-bb-subtle pt-0.5">
            <span className="capitalize text-slate-300">{riskLevel.toLowerCase()} Hazard Tier</span>
            <span className={`flex items-center space-x-1 ${riskTrend.color}`}>
              <riskTrend.icon className="w-3 h-3" />
              <span>{riskTrend.text}</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI 2: Rainfall 24h & Intensity */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-bb-muted flex items-center space-x-1">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>24h Precipitation</span>
          </span>
          <span className="text-[10px] font-mono text-bb-accent bg-blue-950/60 border border-blue-800/60 px-1.5 py-0.2 rounded">
            IMD AWS
          </span>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white">
              {(Number(env.rainfall) || 0).toFixed(1)}
            </span>
            <span className="text-xs font-mono text-bb-muted">mm</span>
          </div>

          <MiniSparkline 
            data={history} 
            dataKey="rainfall_mm" 
            strokeColor="#00A8FF" 
            fillColor="rgba(0,168,255,0.18)"
          />
        </div>

        <div className="border-t border-bb-border/50 pt-2 flex items-center justify-between text-[11px] font-mono">
          <span className="text-bb-muted">
            Intensity: <strong className="text-white tabular-nums">{(Number(env.rainfall_intensity) || 0).toFixed(1)}</strong> mm/h
          </span>
          <span className={`flex items-center space-x-1 ${rainTrend.color}`}>
            <rainTrend.icon className="w-3 h-3" />
            <span>{rainTrend.text}</span>
          </span>
        </div>
      </div>

      {/* KPI 3: River Level & Danger Mark */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-bb-muted flex items-center space-x-1">
            <Waves className="w-3.5 h-3.5 text-orange-400" />
            <span>River Gauge Stage</span>
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
            isRiverBreached 
              ? 'bg-red-950/80 text-red-400 border-red-800 font-bold animate-pulse' 
              : 'bg-bb-panel text-slate-300 border-bb-border'
          }`}>
            Danger: {dangerMark}m
          </span>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight ${
              isRiverBreached ? 'text-red-400' : 'text-white'
            }`}>
              {currentRiver.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-bb-muted">m</span>
          </div>

          <MiniSparkline 
            data={history} 
            dataKey="river_level_m" 
            strokeColor="#F97316" 
            fillColor="rgba(249,115,22,0.18)"
          />
        </div>

        <div className="border-t border-bb-border/50 pt-2 flex items-center justify-between text-[11px] font-mono">
          <span className={isRiverBreached ? 'text-red-400 font-bold' : 'text-bb-muted'}>
            {isRiverBreached 
              ? `Breached by +${Math.abs(riverHeadroom)}m` 
              : `${riverHeadroom}m below danger`}
          </span>
          <span className={`flex items-center space-x-1 ${riverTrend.color}`}>
            <riverTrend.icon className="w-3 h-3" />
            <span>{riverTrend.text}</span>
          </span>
        </div>
      </div>

      {/* KPI 4: Soil Saturation Ratio */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-bb-muted flex items-center space-x-1">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Soil Saturation</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.2 rounded">
            MOSDAC
          </span>
        </div>

        <div className="my-2 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-white">
              {soilVal.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-bb-muted">%</span>
          </div>

          <MiniSparkline 
            data={history} 
            dataKey="soil_moisture_pct" 
            strokeColor="#06B6D4" 
            fillColor="rgba(6,182,212,0.18)"
          />
        </div>

        <div className="border-t border-bb-border/50 pt-2 flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-300 truncate font-semibold">
            {soilClass}
          </span>
          <span className={`flex items-center space-x-1 ${soilTrend.color}`}>
            <soilTrend.icon className="w-3 h-3" />
            <span>{soilTrend.text}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
