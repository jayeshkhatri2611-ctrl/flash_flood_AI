import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  Map, 
  Bell, 
  Clock, 
  Radio
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, alertCount, overallStatus }) {
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', path: '/', aliases: ['/dashboard'], label: 'Dashboard', icon: Activity },
    { id: 'map', path: '/map', aliases: ['/live-map', '/gis-map'], label: 'Live GIS Map', icon: Map },
    { id: 'alerts', path: '/alerts', aliases: ['/alerts-warnings', '/warnings'], label: 'Alerts & Warnings', icon: Bell, badge: alertCount },
  ];

  const isItemActive = (item) => {
    const currentPath = location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (item.path === currentPath) return true;
    if (item.aliases && item.aliases.some(alias => alias.toLowerCase() === currentPath)) return true;
    if (activeTab && activeTab === item.id) return true;
    return false;
  };

  const handleNavClick = (item) => {
    navigate(item.path);
    if (setActiveTab) {
      setActiveTab(item.id);
    }
  };

  const currentSelectValue = (() => {
    const active = navItems.find(item => isItemActive(item));
    return active ? active.path : '/';
  })();

  return (
    <header className="bg-command-darker border-b border-command-border sticky top-0 z-50 shadow-lg">
      {/* Top emergency strip */}
      <div className="bg-command-darkest px-4 py-1.5 flex items-center justify-between text-xs border-b border-command-border/60">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-blue-400 font-medium">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="tracking-wide">MINISTRY OF HOME AFFAIRS (MHA) &bull; DISASTER MANAGEMENT DIVISION</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 bg-command-border/40 px-2 py-0.5 rounded text-[11px] font-mono">
            PS ID: SIH26192
          </span>
          <span className="hidden md:inline-block text-slate-400 text-[11px]">
            Team: <strong className="text-amber-400">DeepCoders</strong>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-slate-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400 text-xs hidden sm:inline">National Status:</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase ${
              overallStatus === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' :
              overallStatus === 'HIGH' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
              overallStatus === 'MODERATE' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {overallStatus || 'ACTIVE'}
            </span>
          </div>
        </div>
      </div>

      {/* Main navigation toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick(navItems[0])}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center space-x-2">
              <span>FlashFlood-AI</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                MVP v1.0
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-none">
              Early Warning Decision Support System for Hilly Regions
            </div>
          </div>
        </div>

        {/* Tab buttons */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-command-card/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <div className="lg:hidden flex items-center space-x-1">
          <select
            value={currentSelectValue}
            onChange={(e) => {
              const targetPath = e.target.value;
              const matched = navItems.find(item => item.path === targetPath);
              if (matched) handleNavClick(matched);
            }}
            className="bg-command-card text-white text-xs border border-command-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {navItems.map((item) => (
              <option key={item.id} value={item.path}>
                {item.label} {item.badge ? `(${item.badge})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
