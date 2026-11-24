import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import GisMap from './components/GisMap';
import PredictionSimulator from './components/PredictionSimulator';
import AlertsPanel from './components/AlertsPanel';
import DataFusionView from './components/DataFusionView';
import DataSourcesView from './components/DataSourcesView';
import AboutSIH from './components/AboutSIH';
import { 
  fetchSystemOverview, 
  fetchRegions, 
  fetchAlerts, 
  fetchDataSources 
} from './services/api';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [overview, setOverview] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissBanner, setDismissBanner] = useState(false);

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [overviewData, regionsData, alertsData, sourcesData] = await Promise.all([
        fetchSystemOverview(),
        fetchRegions(),
        fetchAlerts(),
        fetchDataSources()
      ]);

      setOverview(overviewData);
      setRegions(regionsData);
      setAlerts(alertsData);
      setDataSources(sourcesData);

      // Default selected region to Chamoli (or highest risk region)
      if (regionsData && regionsData.length > 0) {
        const criticalReg = regionsData.find(r => r.id === 'chamoli') || regionsData[0];
        setSelectedRegion(criticalReg);
      }
    } catch (err) {
      console.error("Error loading system telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // When prediction is applied in simulator, update local region state dynamically
  const handlePredictionApplied = (predictionResult, params) => {
    if (!selectedRegion) return;

    const updatedRegion = {
      ...selectedRegion,
      environmental_data: {
        ...selectedRegion.environmental_data,
        rainfall: params.rainfall,
        rainfall_intensity: params.rainfall_intensity,
        soil_moisture: params.soil_moisture,
        river_level: params.river_level,
        elevation: params.elevation,
        slope: params.slope
      },
      risk_assessment: {
        ...selectedRegion.risk_assessment,
        risk_score: predictionResult.risk_score,
        risk_level: predictionResult.risk_level,
        contributing_factors: predictionResult.contributing_factors,
        recommended_action: predictionResult.recommended_action,
        last_updated: predictionResult.timestamp
      }
    };

    setSelectedRegion(updatedRegion);

    // Update in regions list
    setRegions(prev => prev.map(r => r.id === updatedRegion.id ? updatedRegion : r));

    // If critical/high, prepend dynamic alert to alerts list
    if (predictionResult.risk_level === 'CRITICAL' || predictionResult.risk_level === 'HIGH') {
      const newAlert = {
        id: `ALT-SIM-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        time_display: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Simulated)',
        region_id: updatedRegion.id,
        region: updatedRegion.name,
        state: updatedRegion.state,
        risk_score: predictionResult.risk_score,
        risk_level: predictionResult.risk_level,
        trigger: `User simulation trigger: Rainfall ${params.rainfall}mm + Soil ${params.soil_moisture}%`,
        factors: predictionResult.contributing_factors.slice(0, 3),
        action_taken: predictionResult.recommended_action,
        status: 'ACTIVE'
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const handleNavigateTab = (tab) => {
    switch (tab) {
      case 'map':
      case 'live-map':
        navigate('/map');
        break;
      case 'prediction':
      case 'simulator':
        navigate('/prediction');
        break;
      case 'alerts':
      case 'warnings':
        navigate('/alerts');
        break;
      case 'fusion':
      case 'data-fusion':
        navigate('/data-fusion');
        break;
      case 'sources':
      case 'data-sources':
        navigate('/data-sources');
        break;
      case 'about':
        navigate('/about');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const criticalAlertsCount = alerts.filter(a => a.risk_level === 'CRITICAL').length;

  return (
    <div className="min-h-screen bg-[#070b19] flex flex-col text-slate-100">
      {/* Top Navbar */}
      <Navbar
        alertCount={criticalAlertsCount}
        overallStatus={overview.overall_status || 'CRITICAL'}
      />

      {/* Flashing Red Emergency Banner for Critical Regions */}
      {!dismissBanner && criticalAlertsCount > 0 && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-700 px-4 py-2 text-xs flex items-center justify-between shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center space-x-2.5 text-white">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-bold uppercase tracking-wider text-red-200">
              🚨 CRITICAL FLASH FLOOD WARNING ACTIVE:
            </span>
            <span className="text-red-100 hidden sm:inline">
              Mangan (Teesta Basin) & Chamoli (Alaknanda Basin) breached flash thresholds.
            </span>
            <button
              onClick={() => navigate('/alerts')}
              className="underline font-semibold hover:text-red-200 ml-2"
            >
              View Early Warning SOPs &rarr;
            </button>
          </div>
          <button
            onClick={() => setDismissBanner(true)}
            className="text-red-300 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-xs font-mono text-slate-400">Loading Multi-Source Telemetry Grid...</p>
          </div>
        ) : (
          <Routes>
            {/* Dashboard routes */}
            <Route 
              path="/" 
              element={
                <Dashboard
                  regions={regions}
                  selectedRegion={selectedRegion}
                  onSelectRegion={(reg) => setSelectedRegion(reg)}
                  overview={overview}
                  onNavigateTab={handleNavigateTab}
                  onRefresh={loadInitialData}
                />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard
                  regions={regions}
                  selectedRegion={selectedRegion}
                  onSelectRegion={(reg) => setSelectedRegion(reg)}
                  overview={overview}
                  onNavigateTab={handleNavigateTab}
                  onRefresh={loadInitialData}
                />
              } 
            />

            {/* GIS Map routes */}
            <Route 
              path="/map" 
              element={
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-command-darker p-4 rounded-xl border border-command-border shadow-xl">
                    <div>
                      <h2 className="text-base font-bold text-white">Interactive GIS Hazard Map</h2>
                      <p className="text-xs text-slate-400">
                        Geographic distribution of flash flood hazard tiers across monitored Indian mountain basins.
                      </p>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Monitored: <strong className="text-white">{regions.length} Catchments</strong>
                    </div>
                  </div>
                  <GisMap
                    regions={regions}
                    selectedRegion={selectedRegion}
                    onSelectRegion={(reg) => {
                      setSelectedRegion(reg);
                      navigate('/');
                    }}
                    height="640px"
                  />
                </div>
              } 
            />
            <Route path="/live-map" element={<Navigate to="/map" replace />} />
            <Route path="/gis-map" element={<Navigate to="/map" replace />} />

            {/* Prediction Simulator routes */}
            <Route 
              path="/prediction" 
              element={
                <PredictionSimulator
                  selectedRegion={selectedRegion}
                  onPredictionApplied={handlePredictionApplied}
                />
              } 
            />
            <Route path="/prediction-simulator" element={<Navigate to="/prediction" replace />} />
            <Route path="/simulator" element={<Navigate to="/prediction" replace />} />

            {/* Alerts & Warnings routes */}
            <Route 
              path="/alerts" 
              element={
                <AlertsPanel
                  alerts={alerts}
                  regions={regions}
                  onSelectRegion={(reg) => {
                    setSelectedRegion(reg);
                    navigate('/');
                  }}
                />
              } 
            />
            <Route path="/alerts-warnings" element={<Navigate to="/alerts" replace />} />
            <Route path="/warnings" element={<Navigate to="/alerts" replace />} />

            {/* Data Fusion routes */}
            <Route 
              path="/data-fusion" 
              element={
                <DataFusionView
                  regions={regions}
                  selectedRegion={selectedRegion}
                  onSelectRegion={(reg) => setSelectedRegion(reg)}
                />
              } 
            />
            <Route path="/fusion" element={<Navigate to="/data-fusion" replace />} />

            {/* Data Sources routes */}
            <Route 
              path="/data-sources" 
              element={
                <DataSourcesView dataSources={dataSources} />
              } 
            />
            <Route path="/sources" element={<Navigate to="/data-sources" replace />} />

            {/* About SIH routes */}
            <Route path="/about" element={<AboutSIH />} />
            <Route path="/about-sih" element={<Navigate to="/about" replace />} />

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>

      {/* Tactical Footer */}
      <footer className="bg-command-darkest border-t border-command-border px-4 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-blue-500" />
            <span>Smart India Hackathon 2026 &bull; Problem Statement SIH26192 &bull; Ministry of Home Affairs</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span>Team: <strong className="text-slate-400">DeepCoders</strong></span>
            <span>&bull;</span>
            <span>Version: <strong className="text-slate-400">1.0.0-MVP</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
