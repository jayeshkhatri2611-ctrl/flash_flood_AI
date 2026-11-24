import React, { useState } from 'react';
import { 
  Menu, 
  RefreshCw, 
  Bell, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin,
  X,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopBar({
  onToggleMobileMenu,
  regions = [],
  selectedRegion,
  onSelectRegion,
  lastUpdated,
  onRefresh,
  isRefreshing,
  isOnline = true,
  alerts = [],
  unreadAlertsCount = 0
}) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const activeCriticalAlerts = alerts.filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH');

  return (
    <header className="h-14 bg-bb-sidebar border-b border-bb-border px-4 flex items-center justify-between sticky top-0 z-30 shadow-flat">
      {/* Left: Mobile Toggle + Region Selector */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded hover:bg-bb-card text-bb-muted hover:text-white border border-bb-border"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Region Selector with Flag/Pin */}
        <div className="flex items-center space-x-2">
          <label htmlFor="global-region-select" className="hidden sm:flex items-center text-xs font-mono text-bb-muted uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-bb-accent mr-1" />
            <span>Basin:</span>
          </label>
          <select
            id="global-region-select"
            value={selectedRegion?.id || ''}
            onChange={(e) => {
              const reg = regions.find(r => r.id === e.target.value);
              if (reg) onSelectRegion(reg);
            }}
            className="bg-bb-card text-white text-xs font-semibold border border-bb-border rounded px-2.5 py-1.5 focus:outline-none focus:border-bb-accent focus:ring-1 focus:ring-bb-accent cursor-pointer min-w-[160px] sm:min-w-[200px]"
          >
            {regions.map((reg) => (
              <option key={reg.id} value={reg.id} className="bg-bb-card text-white">
                {reg.name} ({reg.state}) &bull; {reg.risk_assessment?.risk_level || 'LOW'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Actions: Telemetry Sync + Clock + Notifications + Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Real API Health Indicator */}
        <div 
          className={`hidden md:flex items-center space-x-1.5 px-2 py-1 rounded text-[11px] font-mono border ${
            isOnline 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
              : 'bg-red-950/40 text-red-400 border-red-800/60'
          }`}
          title={isOnline ? "Backend Live (Port 8000 Connected)" : "Backend Unreachable (Serving Local Cache)"}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span>{isOnline ? 'LIVE API' : 'OFFLINE (CACHE)'}</span>
        </div>

        {/* Last-Updated Time */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-bb-muted font-mono">
          <Clock className="w-3.5 h-3.5 text-bb-subtle" />
          <span className="tabular-nums">{lastUpdated || 'Syncing...'}</span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded bg-bb-card hover:bg-bb-panel text-bb-muted hover:text-white border border-bb-border text-xs flex items-center space-x-1 disabled:opacity-50"
          title="Manual Telemetry Refresh"
          aria-label="Refresh telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-bb-accent ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden xl:inline text-[11px] font-mono">REFRESH</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded bg-bb-card hover:bg-bb-panel text-bb-muted hover:text-white border border-bb-border relative"
            title="Active Bulletins"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[16px] h-4 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-bb-card border border-bb-border rounded-lg shadow-2xl z-50 overflow-hidden text-xs">
              <div className="p-3 border-b border-bb-border flex items-center justify-between bg-bb-panel/50">
                <span className="font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Bell className="w-3.5 h-3.5 text-red-400" />
                  <span>Early Warning Bulletins ({activeCriticalAlerts.length})</span>
                </span>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-bb-muted hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-bb-border/60">
                {activeCriticalAlerts.length === 0 ? (
                  <div className="p-4 text-center text-bb-muted">
                    No active high or critical risk alerts.
                  </div>
                ) : (
                  activeCriticalAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/alerts');
                      }}
                      className="p-3 hover:bg-bb-panel cursor-pointer space-y-1 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{alert.region} ({alert.state})</span>
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          alert.risk_level === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-orange-950 text-orange-400 border border-orange-800'
                        }`}>
                          {alert.risk_level} &bull; {alert.risk_score}
                        </span>
                      </div>
                      <p className="text-bb-muted text-[11px] line-clamp-2">{alert.trigger}</p>
                      <div className="text-[10px] text-bb-subtle font-mono pt-1">
                        {alert.time_display}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-bb-border bg-bb-panel/30 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="text-bb-accent hover:underline text-[11px] font-semibold flex items-center justify-center space-x-1 w-full"
                >
                  <span>View All Bulletins & SOPs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Operator Status Icon */}
        <div className="relative">
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="flex items-center space-x-1.5 p-1 rounded bg-bb-card hover:bg-bb-panel border border-bb-border text-slate-300"
            title="Disaster Operations Center Profile"
            aria-label="User profile"
          >
            <div className="w-6 h-6 rounded bg-blue-900/60 border border-blue-700/60 flex items-center justify-center text-bb-accent">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden xl:inline text-xs font-mono font-medium text-slate-300">OPS-01</span>
          </button>

          {showProfileModal && (
            <div className="absolute right-0 mt-2 w-64 bg-bb-card border border-bb-border rounded-lg shadow-2xl z-50 p-3 space-y-2.5 text-xs">
              <div className="border-b border-bb-border pb-2">
                <div className="font-bold text-white">Disaster Ops Console</div>
                <div className="text-[10px] text-bb-subtle font-mono">Ministry of Home Affairs &bull; DeepCoders</div>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-bb-muted">
                <div className="flex justify-between"><span>Operator:</span> <strong className="text-slate-200">NDMA Duty Officer</strong></div>
                <div className="flex justify-between"><span>Node ID:</span> <strong className="text-slate-200">DEL-SEOC-01</strong></div>
                <div className="flex justify-between"><span>Clearance:</span> <strong className="text-emerald-400">Classified SOP Level-2</strong></div>
              </div>
              <div className="pt-1 border-t border-bb-border">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate('/settings');
                  }}
                  className="w-full py-1.5 text-center bg-bb-panel hover:bg-bb-border text-slate-200 rounded font-semibold text-[11px]"
                >
                  Console Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
