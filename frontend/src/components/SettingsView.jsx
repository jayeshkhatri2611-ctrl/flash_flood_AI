import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Bell, 
  Clock, 
  Globe2, 
  SlidersHorizontal,
  ShieldAlert
} from 'lucide-react';

export default function SettingsView({ regions = [] }) {
  const [units, setUnits] = useState('metric');
  const [defaultRegionId, setDefaultRegionId] = useState('chamoli');
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [timezone, setTimezone] = useState('IST');
  const [audioAlerts, setAudioAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedUnits = localStorage.getItem('ff_units');
      if (storedUnits) setUnits(storedUnits);

      const storedReg = localStorage.getItem('ff_default_region');
      if (storedReg) setDefaultRegionId(storedReg);

      const storedInterval = localStorage.getItem('ff_refresh_interval');
      if (storedInterval) setRefreshInterval(storedInterval);

      const storedTz = localStorage.getItem('ff_timezone');
      if (storedTz) setTimezone(storedTz);

      const storedAudio = localStorage.getItem('ff_audio_alerts');
      if (storedAudio) setAudioAlerts(storedAudio === 'true');
    } catch (e) {
      console.warn("Could not read local storage settings:", e);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('ff_units', units);
      localStorage.setItem('ff_default_region', defaultRegionId);
      localStorage.setItem('ff_refresh_interval', refreshInterval);
      localStorage.setItem('ff_timezone', timezone);
      localStorage.setItem('ff_audio_alerts', audioAlerts ? 'true' : 'false');
      
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  };

  const handleReset = () => {
    setUnits('metric');
    setDefaultRegionId('chamoli');
    setRefreshInterval('30');
    setTimezone('IST');
    setAudioAlerts(false);
    try {
      localStorage.clear();
    } catch (e) {}
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="bg-bb-card border border-bb-border rounded-lg p-4 sm:p-5 shadow-flat flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Settings className="w-4 h-4 text-bb-accent" />
            <span>Operational Console Preferences</span>
          </h2>
          <p className="text-xs text-bb-muted mt-0.5">
            Configure local telemetric measurement units, auto-polling frequency, and default command basin
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Saved to Browser</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-bb-card border border-bb-border rounded-lg p-5 shadow-flat space-y-6">
        {/* Section 1: Units & Standards */}
        <div className="space-y-3">
          <div className="border-b border-bb-border/70 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-bb-accent" />
              <span>Measurement Units & Conventions</span>
            </h3>
            <p className="text-[11px] text-bb-subtle">Choose scientific and civil engineering unit standards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="text-slate-300 block font-semibold">Measurement System:</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-[#091122] text-white border border-bb-border rounded px-3 py-2 text-xs focus:outline-none focus:border-bb-accent cursor-pointer"
              >
                <option value="metric">Metric Standards (Rainfall: mm, Stage: m, Elevation: m)</option>
                <option value="imperial">Imperial (Rainfall: in, Stage: ft, Elevation: ft)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 block font-semibold">Operational Time Zone:</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#091122] text-white border border-bb-border rounded px-3 py-2 text-xs focus:outline-none focus:border-bb-accent cursor-pointer"
              >
                <option value="IST">Indian Standard Time (IST - UTC+05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC+00:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Default Catchment Basin */}
        <div className="space-y-3">
          <div className="border-b border-bb-border/70 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Globe2 className="w-3.5 h-3.5 text-bb-accent" />
              <span>Default Active Basin</span>
            </h3>
            <p className="text-[11px] text-bb-subtle">Initial catchment basin loaded upon opening the dashboard</p>
          </div>

          <div className="max-w-md space-y-1.5 text-xs font-mono">
            <label className="text-slate-300 block font-semibold">Default Basin Target:</label>
            <select
              value={defaultRegionId}
              onChange={(e) => setDefaultRegionId(e.target.value)}
              className="w-full bg-[#091122] text-white border border-bb-border rounded px-3 py-2 text-xs focus:outline-none focus:border-bb-accent cursor-pointer"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.state}) &bull; {r.river_basin}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Telemetry Polling Frequency */}
        <div className="space-y-3">
          <div className="border-b border-bb-border/70 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-bb-accent" />
              <span>Background Telemetry Sync</span>
            </h3>
            <p className="text-[11px] text-bb-subtle">How frequently the frontend polls the backend for river gauge and precipitation updates</p>
          </div>

          <div className="max-w-md space-y-1.5 text-xs font-mono">
            <label className="text-slate-300 block font-semibold">Auto-Refresh Interval:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full bg-[#091122] text-white border border-bb-border rounded px-3 py-2 text-xs focus:outline-none focus:border-bb-accent cursor-pointer"
            >
              <option value="15">Every 15 Seconds (Real-time Monsoon Mode)</option>
              <option value="30">Every 30 Seconds (Standard Duty Mode)</option>
              <option value="60">Every 60 Seconds (Low Bandwidth Mode)</option>
              <option value="manual">Manual Refresh Only</option>
            </select>
          </div>
        </div>

        {/* Section 4: Emergency Audio Sirens */}
        <div className="space-y-3">
          <div className="border-b border-bb-border/70 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Bell className="w-3.5 h-3.5 text-bb-accent" />
              <span>Audio Emergency Sirens</span>
            </h3>
            <p className="text-[11px] text-bb-subtle">Audible sound alarm on critical flood threshold breach</p>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer text-xs text-slate-200">
            <input
              type="checkbox"
              checked={audioAlerts}
              onChange={(e) => setAudioAlerts(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded bg-[#091122] border-bb-border"
            />
            <span>Enable audible browser alert on Critical Red Hazard Tier</span>
          </label>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-bb-border flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 rounded bg-bb-panel hover:bg-bb-border text-bb-muted hover:text-white text-xs font-mono flex items-center space-x-1.5 border border-bb-border"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded bg-bb-accent hover:bg-blue-600 text-white text-xs font-bold font-mono flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
