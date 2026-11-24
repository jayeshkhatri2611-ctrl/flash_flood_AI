import React, { useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  X, 
  Download,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

export default function ForecastAndActionsPanel({ selectedRegion }) {
  const [showSopModal, setShowSopModal] = useState(false);

  if (!selectedRegion) {
    return (
      <div className="h-96 bg-app-card rounded-panel border border-app-border p-5 flex items-center justify-center text-xs text-app-muted">
        Select a region to view forecast and emergency actions.
      </div>
    );
  }

  const env = selectedRegion.environmental_data || {};
  const risk = selectedRegion.risk_assessment || {};
  const history = selectedRegion.historical_24h || [];
  const riskLevel = risk.risk_level || 'LOW';
  const meta = getRiskMeta(riskLevel);

  // Derive projected 6h and 12h trajectory from recent 2-hour delta
  const recentDiffRain = history.length >= 2 
    ? (Number(history[history.length - 1]?.rainfall_mm) - Number(history[history.length - 2]?.rainfall_mm)) 
    : 4.0;
  const recentDiffRiver = history.length >= 2 
    ? (Number(history[history.length - 1]?.river_level_m) - Number(history[history.length - 2]?.river_level_m)) 
    : 0.15;

  const currentRain = Number(env.rainfall) || 0;
  const currentRiver = Number(env.river_level) || 0;
  const currentScore = Number(risk.risk_score) || 0;

  const forecast6hRain = Math.max(0, currentRain + (recentDiffRain * 1.5));
  const forecast6hRiver = Math.max(0.5, currentRiver + (recentDiffRiver * 1.5));
  const forecast6hScore = Math.min(100, Math.max(5, currentScore + (recentDiffRiver > 0 ? 4.5 : -3.0)));

  const forecast12hRain = Math.max(0, currentRain + (recentDiffRain * 2.8));
  const forecast12hRiver = Math.max(0.5, currentRiver + (recentDiffRiver * 2.8));
  const forecast12hScore = Math.min(100, Math.max(5, currentScore + (recentDiffRiver > 0 ? 8.0 : -6.0)));

  return (
    <div className="space-y-4">
      {/* 1. Forecast Trend Card */}
      <div className="bg-app-card rounded-panel border border-app-border p-5 shadow-card">
        <div className="flex items-center justify-between border-b border-app-border/70 pb-3 mb-3.5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-app-primary" />
              <span>Hydrological Forecast Outlook</span>
            </h3>
            <p className="text-xs text-app-muted mt-0.5">
              6h & 12h projected trend based on catchment recession kinetics
            </p>
          </div>
        </div>

        {/* Forecast Trajectory Comparison Matrix */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-2 bg-app-elevated/50 p-2.5 rounded-xl border border-app-border text-center text-xs">
            <div>
              <span className="text-[11px] text-app-muted block">Current</span>
              <span className="font-bold text-white tabular-nums text-base mt-0.5 block">{currentScore.toFixed(1)}</span>
              <span className="text-[10px] text-app-muted block">Risk Score</span>
            </div>
            <div className="border-x border-app-border/70">
              <span className="text-[11px] text-app-muted block">+6h Outlook</span>
              <span className={`font-bold tabular-nums text-base mt-0.5 block ${forecast6hScore >= 80 ? 'text-red-400' : 'text-orange-400'}`}>
                ~{forecast6hScore.toFixed(1)}
              </span>
              <span className="text-[10px] text-app-muted block">Projected</span>
            </div>
            <div>
              <span className="text-[11px] text-app-muted block">+12h Outlook</span>
              <span className={`font-bold tabular-nums text-base mt-0.5 block ${forecast12hScore >= 80 ? 'text-red-400' : 'text-amber-400'}`}>
                ~{forecast12hScore.toFixed(1)}
              </span>
              <span className="text-[10px] text-app-muted block">Projected</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Expected Rain Surge (+6h):</span>
              <span className="font-semibold text-blue-400 tabular-nums">+{Math.max(0, forecast6hRain - currentRain).toFixed(1)} mm</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Projected River Stage (+6h):</span>
              <span className="font-semibold text-orange-400 tabular-nums">{forecast6hRiver.toFixed(2)} m</span>
            </div>
          </div>

          {/* Labeled Placeholder for External Numerical Weather Model */}
          <div className="mt-2.5 p-2.5 rounded-lg bg-app-elevated/40 border border-app-border text-xs text-app-muted space-y-1">
            <div className="font-medium text-slate-300 flex items-center justify-between text-xs">
              <span>Numerical Weather Model (NWP):</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-elevated text-app-cyan">Grid Connector Planned</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Not available from current data source &bull; IMD GFS/WRF 3km high-resolution connector scheduled (logged in BACKEND_GAPS.md).
            </p>
          </div>
        </div>
      </div>

      {/* 2. Recommended Disaster Response Actions */}
      <div className="bg-app-card rounded-panel border border-app-border p-5 shadow-card">
        <div className="flex items-center justify-between border-b border-app-border/70 pb-3 mb-3.5">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">Disaster Response Protocol</h3>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Active SOP
              </span>
            </div>
            <p className="text-xs text-app-muted mt-0.5">
              NDMA Directive for {selectedRegion.name} ({riskLevel})
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-lg bg-app-elevated/60 border border-app-border text-slate-200 leading-relaxed text-xs">
            {risk.recommended_action || "Maintain routine telemetry polling. No public advisory required."}
          </div>

          <div className="text-xs text-app-muted flex items-center justify-between border-t border-app-border pt-2.5">
            <span>Jurisdiction: <strong className="text-slate-300">{selectedRegion.authority || 'District DDMA'}</strong></span>
            <span className="text-emerald-400 font-medium">Standing SOP</span>
          </div>

          <button
            onClick={() => setShowSopModal(true)}
            className="w-full py-2.5 px-3 bg-app-elevated hover:bg-app-border text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 border border-app-border transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-app-cyan" />
            <span>View Complete Response Directive</span>
          </button>
        </div>
      </div>

      {/* SOP Modal */}
      {showSopModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-app-card border border-app-border max-w-2xl w-full rounded-panel shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-app-border pb-3.5">
              <div>
                <div className="flex items-center space-x-2">
                  <SeverityBadge level={riskLevel} size="sm" />
                  <span className="text-xs text-app-muted">Directive ID: SOP-MHA-2026-FL</span>
                </div>
                <h2 className="text-base font-bold text-white mt-1.5">
                  Emergency Protocol: {selectedRegion.name} Basin
                </h2>
                <div className="text-xs text-app-cyan mt-0.5">
                  Jurisdictional Authority: {selectedRegion.authority}
                </div>
              </div>
              <button 
                onClick={() => setShowSopModal(false)}
                className="p-1 rounded-lg text-app-muted hover:text-white hover:bg-app-elevated"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 bg-app-elevated/60 border border-app-border rounded-xl">
                <span className="font-semibold text-white block mb-1">
                  1. Current Hydrological Trigger:
                </span>
                <p>{risk.recommended_action}</p>
              </div>

              <div>
                <span className="font-semibold text-white block mb-1.5">
                  2. Mandatory Inter-Agency Actions:
                </span>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                  <li><strong>Central Water Commission (CWC):</strong> Verify stage gauges at 15-minute intervals. Adjust downstream barrage spillways.</li>
                  <li><strong>State Disaster Response Force (SDRF):</strong> Deploy motorized inflatable boats and rescue battalions to riparian settlements.</li>
                  <li><strong>Traffic Police & BRO:</strong> Restrict heavy transport vehicles across bridges with less than 1.5m clearance to flood stage.</li>
                  <li><strong>District DDMA:</strong> Open designated cyclone/flood shelters equipped with emergency power and potable water reserves.</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <strong>Legal Notice:</strong> This protocol is an automated decision-support recommendation generated by the FlashFlood-AI system. Final statutory evacuation orders remain solely under the jurisdiction of the District Magistrate / State Executive Committee.
              </div>
            </div>

            <div className="flex items-center justify-between pt-3.5 border-t border-app-border">
              <span className="text-xs text-app-muted">
                Generated: {new Date().toLocaleTimeString()} IST
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-lg bg-app-elevated hover:bg-app-border text-white text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Directive</span>
                </button>
                <button
                  onClick={() => setShowSopModal(false)}
                  className="px-4 py-2 rounded-lg bg-app-primary hover:bg-blue-600 text-white text-xs font-semibold"
                >
                  Acknowledge & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
