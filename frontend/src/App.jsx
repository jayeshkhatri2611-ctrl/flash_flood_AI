import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import AlertBanner from './components/AlertBanner';
import DashboardView from './components/DashboardView';
import GisMap from './components/GisMap';
import RegionsView from './components/RegionsView';
import AlertsView from './components/AlertsView';
import ForecastView from './components/ForecastView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';

import { 
  fetchSystemOverview, 
  fetchRegions, 
  fetchAlerts, 
  fetchMlInfo
} from './services/api';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [overview, setOverview] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [mlInfo, setMlInfo] = useState({});
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);

  // Load telemetry
  const loadTelemetry = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const [overviewData, regionsData, alertsData, mlData] = await Promise.all([
        fetchSystemOverview(),
        fetchRegions(),
        fetchAlerts(),
        fetchMlInfo()
      ]);

      setOverview(overviewData || {});
      setRegions(regionsData || []);
      setAlerts(alertsData || []);
      setMlInfo(mlData || {});
      setIsOnline(true);
      
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' IST');

      // Set initial selected region
      if (regionsData && regionsData.length > 0) {
        setSelectedRegion(prev => {
          const queryRegionId = searchParams.get('region');
          if (queryRegionId) {
            const matched = regionsData.find(r => r.id.toLowerCase() === queryRegionId.toLowerCase());
            if (matched) return matched;
          }
          if (prev) {
            const updated = regionsData.find(r => r.id === prev.id);
            if (updated) return updated;
          }
          const defaultStored = localStorage.getItem('ff_default_region');
          if (defaultStored) {
            const matchedStored = regionsData.find(r => r.id === defaultStored);
            if (matchedStored) return matchedStored;
          }
          return regionsData.find(r => r.id === 'chamoli') || regionsData[0];
        });
      }
    } catch (err) {
      console.warn("Live telemetry sync failed, running in resilient mode:", err);
      setIsOnline(false);
    } finally {
      setLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadTelemetry();
  }, [loadTelemetry]);

  // Background auto-refresh timer based on settings
  useEffect(() => {
    const storedInterval = localStorage.getItem('ff_refresh_interval') || '30';
    if (storedInterval === 'manual') return;

    const intervalSeconds = Math.max(10, parseInt(storedInterval, 10) || 30);
    const timer = setInterval(() => {
      loadTelemetry(false);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [loadTelemetry]);

  // Select region handler - syncs both state and URL parameter
  const handleSelectRegion = (region) => {
    if (!region) return;
    setSelectedRegion(region);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('region', region.id);
      return next;
    }, { replace: true });
  };

  const activeAlertsCount = alerts.filter(a => a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH').length;

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col font-sans selection:bg-app-primary selection:text-white">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar 
        alertCount={activeAlertsCount}
        isOpenMobile={isOpenMobileMenu}
        onCloseMobile={() => setIsOpenMobileMenu(false)}
      />

      {/* 2. Main Layout Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        {/* Modern Top Navigation Bar */}
        <TopBar
          onToggleMobileMenu={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          regions={regions}
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
          lastUpdated={lastUpdated}
          onRefresh={() => loadTelemetry(true)}
          isRefreshing={isRefreshing}
          isOnline={isOnline}
          alerts={alerts}
          unreadAlertsCount={activeAlertsCount}
        />

        {/* Full-Width Early Warning Alert Banner (Rendered when alerts active) */}
        <AlertBanner alerts={alerts} regions={regions} />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1740px] w-full mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[460px] space-y-4 text-xs text-app-muted">
              <div className="w-9 h-9 border-2 border-app-primary/20 border-t-app-primary rounded-full animate-spin" />
              <p className="font-medium text-slate-300">Connecting to Hydrological Telemetry Pipeline...</p>
            </div>
          ) : (
            <Routes>
              {/* Dashboard View */}
              <Route 
                path="/" 
                element={
                  <DashboardView 
                    regions={regions}
                    selectedRegion={selectedRegion}
                    onSelectRegion={handleSelectRegion}
                    overview={overview}
                    mlInfo={mlInfo}
                  />
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <DashboardView 
                    regions={regions}
                    selectedRegion={selectedRegion}
                    onSelectRegion={handleSelectRegion}
                    overview={overview}
                    mlInfo={mlInfo}
                  />
                } 
              />

              {/* Full-Screen Modern Live GIS Map View */}
              <Route 
                path="/map" 
                element={
                  <div className="w-full">
                    <GisMap 
                      regions={regions}
                      selectedRegion={selectedRegion}
                      onSelectRegion={handleSelectRegion}
                      fullScreen={true}
                    />
                  </div>
                } 
              />
              <Route path="/gis-map" element={<Navigate to="/map" replace />} />
              <Route path="/live-map" element={<Navigate to="/map" replace />} />

              {/* Basin Directory View */}
              <Route 
                path="/regions" 
                element={
                  <RegionsView 
                    regions={regions}
                    selectedRegion={selectedRegion}
                    onSelectRegion={handleSelectRegion}
                  />
                } 
              />

              {/* Alerts & Bulletins View */}
              <Route 
                path="/alerts" 
                element={
                  <AlertsView 
                    alerts={alerts}
                    regions={regions}
                    onSelectRegion={handleSelectRegion}
                  />
                } 
              />
              <Route path="/alerts-warnings" element={<Navigate to="/alerts" replace />} />
              <Route path="/warnings" element={<Navigate to="/alerts" replace />} />

              {/* Hydrological Forecast View */}
              <Route 
                path="/forecast" 
                element={
                  <ForecastView 
                    selectedRegion={selectedRegion} 
                  />
                } 
              />

              {/* Reports & Telemetry Audit View */}
              <Route 
                path="/reports" 
                element={
                  <ReportsView 
                    regions={regions}
                    overview={overview}
                    mlInfo={mlInfo}
                  />
                } 
              />

              {/* Preferences / Settings View */}
              <Route 
                path="/settings" 
                element={
                  <SettingsView 
                    regions={regions} 
                  />
                } 
              />

              {/* Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>

        {/* Clean Modern Status Footer */}
        <footer className="border-t border-app-border bg-app-sidebar/70 px-6 py-3 text-xs text-app-muted flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">FlashFlood-AI Early Warning Platform</span>
            <span>&bull;</span>
            <span>Ministry of Home Affairs (MHA) &bull; SIH26192</span>
          </div>

          <div className="flex items-center space-x-3 text-app-subtle">
            <span>Ensemble Random Forest Engine: <strong className="text-emerald-400 font-medium">R² 0.942</strong></span>
            <span>&bull;</span>
            <span>Team: <strong className="text-slate-300">DeepCoders</strong></span>
          </div>
        </footer>
      </div>
    </div>
  );
}
