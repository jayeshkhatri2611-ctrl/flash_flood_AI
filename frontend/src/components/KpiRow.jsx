import React from 'react';
import { 
  ShieldAlert, 
  CloudRain, 
  Waves, 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

function MiniSparkline({ data = [], dataKey, strokeColor = '#3B82F6', fillColor = 'rgba(59,130,246,0.15)' }) {
  if (!data || data.length < 2) {
    return <div className="h-9 w-28 text-[11px] text-app-muted flex items-center justify-end">No trend data</div>;
  }

  const values = data.map(d => Number(d[dataKey]) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 110;
  const height = 34;
  const points = values.map((val, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div className="h-9 w-28 flex items-center justify-end" title={`24h Range: ${min.toFixed(1)} – ${max.toFixed(1)}`}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#spark-${dataKey})`} />
        <polyline 
          points={points} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
}

// Circular Risk Score Progress Ring
function CircularScore({ score = 0, color = '#3B82F6' }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalized / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="4"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold text-white tabular-nums">
        {Math.round(score)}%
      </span>
    </div>
  );
}

export default function KpiRow({ selectedRegion }) {
  if (!selectedRegion) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-36 bg-app-card rounded-panel border border-app-border animate-pulse" />
        ))}
      </div>
    );
  }

  const env = selectedRegion.environmental_data || {};
  const risk = selectedRegion.risk_assessment || {};
  const history = selectedRegion.historical_24h || [];

  // Metrics
  const score = Number(risk.risk_score) || 0;
  const riskLevel = risk.risk_level || 'LOW';
  const riskMeta = getRiskMeta(riskLevel);

  const calculateTrend = (dataKey) => {
    if (history.length < 2) return { text: 'Stable', icon: Minus, color: 'text-app-muted' };
    const first = Number(history[0][dataKey]) || 0;
    const last = Number(history[history.length - 1][dataKey]) || 0;
    const diff = last - first;
    if (diff > 0.1) return { text: `+${diff.toFixed(1)} rising`, icon: ArrowUpRight, color: 'text-red-400' };
    if (diff < -0.1) return { text: `${diff.toFixed(1)} receding`, icon: ArrowDownRight, color: 'text-emerald-400' };
    return { text: 'Stable', icon: Minus, color: 'text-app-muted' };
  };

  const riskTrend = calculateTrend('risk_score');
  const rainTrend = calculateTrend('rainfall_mm');
  const riverTrend = calculateTrend('river_level_m');
  const soilTrend = calculateTrend('soil_moisture_pct');

  const dangerMark = Number(env.danger_level) || 4.5;
  const currentRiver = Number(env.river_level) || 0;
  const riverHeadroom = (dangerMark - currentRiver).toFixed(2);
  const isRiverBreached = currentRiver >= dangerMark;

  const soilVal = Number(env.soil_moisture) || 0;
  const soilClass = soilVal >= 85 ? 'Near Saturated' : (soilVal >= 70 ? 'High Saturation' : (soilVal >= 45 ? 'Moderate Buffer' : 'Dry Sponge'));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Flash Flood Risk Score */}
      <div className="bg-app-card hover:bg-app-card/90 rounded-panel border border-app-border hover:border-app-borderSubtle p-5 shadow-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-app-muted">Flash Flood Risk</span>
          <SeverityBadge level={riskLevel} size="xs" pulse={riskLevel === 'CRITICAL'} />
        </div>

        <div className="my-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                {score.toFixed(1)}
              </span>
              <span className="text-xs text-app-muted font-normal">/ 100</span>
            </div>
            <div className="text-[11px] text-app-muted mt-1 capitalize">
              {riskLevel.toLowerCase()} Hazard Status
            </div>
          </div>
          <CircularScore score={score} color={riskMeta.color} />
        </div>

        <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-xs">
          <span className="text-app-muted">24h Trajectory</span>
          <span className={`flex items-center space-x-1 font-medium ${riskTrend.color}`}>
            <riskTrend.icon className="w-3.5 h-3.5" />
            <span>{riskTrend.text}</span>
          </span>
        </div>
      </div>

      {/* 2. 24h Precipitation */}
      <div className="bg-app-card hover:bg-app-card/90 rounded-panel border border-app-border hover:border-app-borderSubtle p-5 shadow-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-app-muted flex items-center space-x-1.5">
            <CloudRain className="w-4 h-4 text-app-primary" />
            <span>24h Rainfall</span>
          </span>
          <span className="text-[10px] font-semibold text-app-cyan bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            IMD AWS
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                {(Number(env.rainfall) || 0).toFixed(1)}
              </span>
              <span className="text-xs text-app-muted font-normal">mm</span>
            </div>
            <div className="text-[11px] text-app-muted mt-1">
              Peak: <strong className="text-slate-200">{(Number(env.rainfall_intensity) || 0).toFixed(1)} mm/h</strong>
            </div>
          </div>
          <MiniSparkline 
            data={history} 
            dataKey="rainfall_mm" 
            strokeColor="#3B82F6" 
          />
        </div>

        <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-xs">
          <span className="text-app-muted">Precipitation Shift</span>
          <span className={`flex items-center space-x-1 font-medium ${rainTrend.color}`}>
            <rainTrend.icon className="w-3.5 h-3.5" />
            <span>{rainTrend.text}</span>
          </span>
        </div>
      </div>

      {/* 3. River Gauge Stage */}
      <div className="bg-app-card hover:bg-app-card/90 rounded-panel border border-app-border hover:border-app-borderSubtle p-5 shadow-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-app-muted flex items-center space-x-1.5">
            <Waves className="w-4 h-4 text-orange-400" />
            <span>River Stage</span>
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            isRiverBreached 
              ? 'bg-red-500/20 text-red-400 border-red-500/30 font-bold animate-pulse' 
              : 'bg-app-elevated text-slate-300 border-app-border'
          }`}>
            Danger: {dangerMark}m
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className={`text-3xl sm:text-4xl font-extrabold tabular-nums tracking-tight ${
                isRiverBreached ? 'text-red-400' : 'text-white'
              }`}>
                {currentRiver.toFixed(2)}
              </span>
              <span className="text-xs text-app-muted font-normal">m</span>
            </div>
            <div className="text-[11px] text-app-muted mt-1">
              {isRiverBreached ? (
                <span className="text-red-400 font-semibold">Exceeded danger mark</span>
              ) : (
                <span>{riverHeadroom}m below bankfull</span>
              )}
            </div>
          </div>
          <MiniSparkline 
            data={history} 
            dataKey="river_level_m" 
            strokeColor="#F97316" 
          />
        </div>

        <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-xs">
          <span className="text-app-muted">Discharge Trend</span>
          <span className={`flex items-center space-x-1 font-medium ${riverTrend.color}`}>
            <riverTrend.icon className="w-3.5 h-3.5" />
            <span>{riverTrend.text}</span>
          </span>
        </div>
      </div>

      {/* 4. Soil Saturation */}
      <div className="bg-app-card hover:bg-app-card/90 rounded-panel border border-app-border hover:border-app-borderSubtle p-5 shadow-card transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-app-muted flex items-center space-x-1.5">
            <Droplets className="w-4 h-4 text-app-cyan" />
            <span>Soil Saturation</span>
          </span>
          <span className="text-[10px] font-semibold text-app-cyan bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            MOSDAC
          </span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tabular-nums tracking-tight">
                {soilVal.toFixed(1)}
              </span>
              <span className="text-xs text-app-muted font-normal">%</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1 font-medium">
              {soilClass}
            </div>
          </div>
          <MiniSparkline 
            data={history} 
            dataKey="soil_moisture_pct" 
            strokeColor="#22D3EE" 
          />
        </div>

        <div className="pt-2 border-t border-app-border/60 flex items-center justify-between text-xs">
          <span className="text-app-muted">Infiltration Capacity</span>
          <span className={`flex items-center space-x-1 font-medium ${soilTrend.color}`}>
            <soilTrend.icon className="w-3.5 h-3.5" />
            <span>{soilTrend.text}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
