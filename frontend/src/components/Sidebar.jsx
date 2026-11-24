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
  Server
} from 'lucide-react';

export default function Sidebar({ alertCount = 0, isOpenMobile, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/map', label: 'Live GIS Map', icon: Map },
    { to: '/regions', label: 'Regions', icon: Globe2 },
    { to: '/alerts', label: 'Alerts & Warnings', icon: Bell, badge: alertCount },
    { to: '/forecast', label: 'Forecast', icon: TrendingUp },
    { to: '/reports', label: 'Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 bg-bb-sidebar border-r border-bb-border flex flex-col transition-all duration-200 ease-in-out ${
          collapsed ? 'w-16' : 'w-60'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        aria-label="Sidebar Navigation"
      >
        {/* Brand Header */}
        <div className="h-14 border-b border-bb-border flex items-center justify-between px-3.5 bg-[#09101f]">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-bb-accent to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm border border-bb-accent/30">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <div className="text-xs font-bold tracking-tight text-white flex items-center space-x-1">
                  <span>FLASHFLOOD</span>
                  <span className="text-bb-accent font-mono text-[10px] px-1 py-0.2 bg-blue-950/80 rounded border border-blue-800/60">AI</span>
                </div>
                <div className="text-[10px] text-bb-subtle font-mono uppercase tracking-wider truncate">
                  Disaster Ops Intel
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-bb-card text-bb-muted hover:text-white border border-transparent hover:border-bb-border"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) => `
                  flex items-center rounded px-3 py-2 text-xs font-medium transition-all group relative
                  ${isActive 
                    ? 'bg-bb-card text-bb-accent border border-bb-border shadow-flat' 
                    : 'text-bb-muted hover:text-white hover:bg-bb-card/60 border border-transparent'}
                  ${collapsed ? 'justify-center px-0' : 'space-x-3'}
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${collapsed ? '' : ''}`} />
                
                {!collapsed && (
                  <span className="truncate flex-1 tracking-wide">{item.label}</span>
                )}

                {/* Badge for Alerts */}
                {item.badge > 0 && (
                  <span className={`
                    font-mono font-bold rounded-full bg-red-600 text-white flex items-center justify-center
                    ${collapsed ? 'absolute top-1.5 right-1.5 w-2 h-2 p-0 animate-ping' : 'px-1.5 py-0.2 text-[10px] ml-auto'}
                  `}>
                    {!collapsed && item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Node Status */}
        <div className="p-3 border-t border-bb-border bg-[#09101f] text-[10px] font-mono text-bb-muted">
          {!collapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-semibold">MHA NODE-01</span>
                </span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="text-[9px] text-bb-subtle truncate">
                PS: SIH26192 &bull; DeepCoders
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="MHA Operational Node: ONLINE">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
