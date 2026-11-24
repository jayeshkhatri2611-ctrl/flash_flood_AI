import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  Globe2, 
  Bell, 
  TrendingUp, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert,
  Radio,
  Layers
} from 'lucide-react';

export default function Sidebar({ alertCount = 0, isOpenMobile, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/map', label: 'Live GIS Map', icon: Map },
    { to: '/regions', label: 'Basin Directory', icon: Globe2 },
    { to: '/alerts', label: 'Alerts & Bulletins', icon: Bell, badge: alertCount },
    { to: '/forecast', label: 'Hydrological Forecast', icon: TrendingUp },
    { to: '/reports', label: 'Telemetry & Reports', icon: FileText },
    { to: '/settings', label: 'Preferences', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 bg-app-sidebar border-r border-app-border flex flex-col transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-app-border flex items-center justify-between px-4 bg-app-sidebar">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-app-primary to-app-cyan flex items-center justify-center flex-shrink-0 shadow-glow">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-sm font-bold tracking-tight text-white flex items-center space-x-1.5">
                  <span>FlashFlood</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-app-cyan font-semibold border border-blue-500/30">
                    AI
                  </span>
                </div>
                <div className="text-[11px] text-app-muted truncate font-normal">
                  Early Warning Intelligence
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-app-elevated text-app-muted hover:text-white transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) => `
                  flex items-center rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all group relative
                  ${isActive 
                    ? 'bg-app-elevated text-white font-semibold border border-app-border shadow-card' 
                    : 'text-app-muted hover:text-white hover:bg-app-elevated/50 border border-transparent'}
                  ${collapsed ? 'justify-center px-0' : 'space-x-3'}
                `}
                title={collapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive ? 'text-app-cyan' : 'text-app-muted group-hover:text-white'
                    }`} />
                    
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {/* Active Alert Count Badge */}
                    {item.badge > 0 && (
                      <span className={`
                        font-bold rounded-full bg-red-500 text-white flex items-center justify-center
                        ${collapsed ? 'absolute top-2 right-2 w-2 h-2 p-0 animate-ping' : 'px-2 py-0.5 text-[10px] ml-auto'}
                      `}>
                        {!collapsed && item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom System Status Widget */}
        <div className="p-3.5 border-t border-app-border bg-app-sidebar/50">
          {!collapsed ? (
            <div className="p-3 rounded-xl bg-app-card/60 border border-app-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 text-slate-300 font-medium">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Telemetry Feeds</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  ONLINE
                </span>
              </div>
              <div className="text-[11px] text-app-muted leading-tight">
                IMD &bull; CWC &bull; MOSDAC &bull; NRSC
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="Telemetry Feeds: ONLINE">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
