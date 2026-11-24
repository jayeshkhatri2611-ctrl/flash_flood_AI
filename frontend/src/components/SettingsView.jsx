import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Bell, 
  Clock, 
  Globe2, 
  SlidersHorizontal
} from 'lucide-react';

export default function SettingsView({ regions = [] }) {
  const [units, setUnits] = useState('metric');
  const [defaultRegionId, setDefaultRegionId] = useState('chamoli');
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [timezone, setTimezone] = useState('IST');
  const [audioAlerts, setAudioAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="bg-app-card rounded-panel border border-app-border p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-app-primary" />
            <span>Platform Configuration & Preferences</span>
          </h2>
          <p className="text-xs text-app-muted mt-1">
            Configure measurement conventions, background polling frequencies, and default operational parameters
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Saved to Local Storage</span>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-app-card rounded-panel border border-app-border p-6 shadow-card space-y-7">
        {/* Section 1: Units & Standards */}
        <div className="space-y-4">
          <div className="border-b border-app-border/70 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-app-primary" />
              <span>Measurement Units & Temporal Standards</span>
            </h3>
            <p className="text-xs text-app-muted mt-0.5">Scientific unit conventions used across telemetry charts</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-2">
              <label className="text-slate-200 block font-medium">Measurement Standard:</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="w-full bg-app-elevated/70 text-white border border-app-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-app-primary cursor-pointer font-medium"
              >
                <option value="metric">Metric Standards (Rainfall: mm, Stage: m, Elevation: m)</option>
                <option value="imperial">Imperial (Rainfall: in, Stage: ft, Elevation: ft)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-200 block font-medium">Command Operations Timezone:</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-app-elevated/70 text-white border border-app-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-app-primary cursor-pointer font-medium"
              >
                <option value="IST">Indian Standard Time (IST - UTC+05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC+00:00)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Default Basin */}
        <div className="space-y-4">
          <div className="border-b border-app-border/70 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Globe2 className="w-4 h-4 text-app-primary" />
              <span>Default Active Basin</span>
            </h3>
            <p className="text-xs text-app-muted mt-0.5">Default catchment basin focused upon launching the console</p>
          </div>

          <div className="max-w-md space-y-2 text-xs">
            <label className="text-slate-200 block font-medium">Default Catchment:</label>
            <select
              value={defaultRegionId}
              onChange={(e) => setDefaultRegionId(e.target.value)}
              className="w-full bg-app-elevated/70 text-white border border-app-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-app-primary cursor-pointer font-medium"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.state}) &bull; {r.river_basin}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Section 3: Telemetry Sync Interval */}
        <div className="space-y-4">
          <div className="border-b border-app-border/70 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-app-primary" />
              <span>Background Telemetry Synchronization</span>
            </h3>
            <p className="text-xs text-app-muted mt-0.5">Polling interval for live river gauge, rainfall AWS, and soil saturation feeds</p>
          </div>

          <div className="max-w-md space-y-2 text-xs">
            <label className="text-slate-200 block font-medium">Polling Interval:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full bg-app-elevated/70 text-white border border-app-border rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-app-primary cursor-pointer font-medium"
            >
              <option value="15">Every 15 Seconds (Active Monsoon Surveillance)</option>
              <option value="30">Every 30 Seconds (Standard Routine Duty)</option>
              <option value="60">Every 60 Seconds (Low Bandwidth Mode)</option>
              <option value="manual">Manual Refresh Only</option>
            </select>
          </div>
        </div>

        {/* Section 4: Emergency Audio Warnings */}
        <div className="space-y-4">
          <div className="border-b border-app-border/70 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-app-primary" />
              <span>Audible Warning Alerts</span>
            </h3>
            <p className="text-xs text-app-muted mt-0.5">Audible warning signal when a monitored basin breaches emergency thresholds</p>
          </div>

          <label className="flex items-center space-x-3 cursor-pointer text-xs text-slate-200">
            <input
              type="checkbox"
              checked={audioAlerts}
              onChange={(e) => setAudioAlerts(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded bg-app-elevated border-app-border"
            />
            <span className="font-medium">Play browser audio alarm when Critical Flash Flood Hazard (&gt;80) is detected</span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-app-border flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-app-elevated hover:bg-app-border text-app-muted hover:text-white text-xs font-medium flex items-center space-x-1.5 border border-app-border transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-app-primary hover:bg-blue-600 text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
