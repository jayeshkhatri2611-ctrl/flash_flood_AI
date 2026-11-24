import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  RefreshCw, 
  Bell, 
  User, 
  Clock, 
  MapPin,
  X,
  ExternalLink,
  ShieldAlert,
  ChevronDown,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SeverityBadge } from '../utils/theme';

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
  const notifRef = useRef(null);

  const activeCriticalAlerts = alerts.filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH');

  // Close flyouts when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <header className="h-16 bg-app-sidebar/90 backdrop-blur-md border-b border-app-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Left: Mobile Toggle + Basin Selector */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-app-card hover:bg-app-elevated text-app-muted hover:text-white border border-app-border transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Global Basin Selector */}
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-app-primary absolute left-3 pointer-events-none" />
            <select
              id="global-basin-selector"
              value={selectedRegion?.id || ''}
              onChange={(e) => {
                const reg = regions.find(r => r.id === e.target.value);
                if (reg && onSelectRegion) onSelectRegion(reg);
              }}
              className="bg-app-card hover:bg-app-elevated text-white text-xs font-semibold border border-app-border rounded-lg pl-9 pr-8 py-2 focus:outline-none focus:border-app-primary focus:ring-1 focus:ring-app-primary cursor-pointer appearance-none transition-all shadow-sm min-w-[180px] sm:min-w-[240px]"
            >
              {regions.map((reg) => (
                <option key={reg.id} value={reg.id} className="bg-app-card text-white py-1">
                  {reg.name} ({reg.state}) &bull; {reg.risk_assessment?.risk_level || 'LOW'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-app-muted absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right Controls: Status Chip + Clock + Refresh + Notifications + Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Live System Status Chip */}
        <div 
          className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}
          title={isOnline ? "Backend Live & Operational" : "Backend Disconnected (Resilient Cache Mode)"}
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span>{isOnline ? 'System Live' : 'Offline Mode'}</span>
        </div>

        {/* Last Updated Time */}
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-app-muted font-normal px-2">
          <Clock className="w-3.5 h-3.5 text-app-subtle" />
          <span className="tabular-nums">{lastUpdated || 'Synchronizing...'}</span>
        </div>

        {/* Refresh Action Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-app-card hover:bg-app-elevated text-app-muted hover:text-white border border-app-border text-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          title="Manual Telemetry Sync"
          aria-label="Refresh telemetry data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-app-primary ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline text-xs font-medium">Sync</span>
        </button>

        {/* Notification Bell with Fixed Z-Index Dropdown (Fixes overlap bug) */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-lg border text-xs relative transition-colors ${
              showNotifications 
                ? 'bg-app-elevated text-white border-app-primary' 
                : 'bg-app-card hover:bg-app-elevated text-app-muted hover:text-white border-app-border'
            }`}
            title="Active Bulletins"
            aria-label="View bulletins"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout Modal (Properly positioned & bounded to avoid overlap) */}
          {showNotifications && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-18 sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 bg-app-card/98 backdrop-blur-xl border border-app-border rounded-panel shadow-2xl z-[9999] overflow-hidden text-xs">
              <div className="p-3.5 border-b border-app-border flex items-center justify-between bg-app-elevated/60">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="font-semibold text-white">Active Early Warnings ({activeCriticalAlerts.length})</span>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded text-app-muted hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-app-border/70">
                {activeCriticalAlerts.length === 0 ? (
                  <div className="p-6 text-center text-app-muted">
                    <p className="font-medium text-slate-300">No active critical warnings.</p>
                    <p className="text-[11px] text-app-subtle mt-1">All monitored basins currently below emergency thresholds.</p>
                  </div>
                ) : (
                  activeCriticalAlerts.map(alert => (
                    <div 
                      key={alert.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/alerts');
                      }}
                      className="p-3.5 hover:bg-app-elevated/80 cursor-pointer space-y-1.5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{alert.region} ({alert.state})</span>
                        <SeverityBadge level={alert.risk_level} size="xs" />
                      </div>
                      <p className="text-slate-300 text-xs line-clamp-2 leading-relaxed">{alert.trigger}</p>
                      <div className="text-[10px] text-app-subtle flex items-center justify-between pt-1">
                        <span>{alert.time_display}</span>
                        <span className="text-app-cyan font-medium">View Bulletin &rarr;</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 border-t border-app-border bg-app-elevated/40 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="text-app-primary hover:text-app-cyan text-xs font-semibold flex items-center justify-center space-x-1.5 w-full py-1"
                >
                  <span>Open Alerts & SOP Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Duty Officer Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfileModal(!showProfileModal)}
            className="flex items-center space-x-2 p-1.5 rounded-lg bg-app-card hover:bg-app-elevated border border-app-border text-slate-300 transition-colors"
            title="Duty Officer Profile"
            aria-label="User profile"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-app-primary to-app-cyan flex items-center justify-center text-white shadow-sm">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden xl:inline text-xs font-medium text-slate-200">Duty Officer</span>
          </button>

          {showProfileModal && (
            <div className="absolute right-0 mt-2 w-64 bg-app-card/98 backdrop-blur-xl border border-app-border rounded-panel shadow-2xl z-[9999] p-4 space-y-3 text-xs">
              <div className="border-b border-app-border pb-2.5">
                <div className="font-semibold text-white">Disaster Intelligence Operations</div>
                <div className="text-[11px] text-app-muted">National Disaster Management Authority</div>
              </div>
              <div className="space-y-1.5 text-xs text-app-muted">
                <div className="flex justify-between"><span>Designation:</span> <strong className="text-slate-200 font-medium">NDMA Duty Officer</strong></div>
                <div className="flex justify-between"><span>Node ID:</span> <strong className="text-slate-200 font-medium">DEL-SEOC-01</strong></div>
                <div className="flex justify-between"><span>Status:</span> <strong className="text-emerald-400 font-medium">Active Clearance</strong></div>
              </div>
              <div className="pt-2 border-t border-app-border">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate('/settings');
                  }}
                  className="w-full py-2 text-center bg-app-elevated hover:bg-app-border text-slate-200 rounded-lg font-medium text-xs transition-colors"
                >
                  System Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
