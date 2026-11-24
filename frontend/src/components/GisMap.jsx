import React, { useEffect, useState, useMemo } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  CircleMarker, 
  Circle,
  Popup, 
  useMap 
} from 'react-leaflet';
import { 
  CloudRain, 
  Waves, 
  Mountain, 
  Compass, 
  AlertTriangle, 
  ExternalLink,
  ShieldAlert,
  Droplets,
  Layers,
  Search,
  ChevronRight,
  ChevronLeft,
  X,
  MapPin,
  Eye,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

// Map recenter controller with smooth flying animation
function MapController({ center, zoom, shouldInvalidate }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 7, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (shouldInvalidate) {
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }
  }, [shouldInvalidate, map]);

  return null;
}

export default function GisMap({ 
  regions = [], 
  selectedRegion, 
  onSelectRegion, 
  height = "760px",
  fullScreen = false
}) {
  const defaultCenter = [28.5, 84.0];
  const defaultZoom = 5;

  // UI State
  const [activeTileLayer, setActiveTileLayer] = useState('dark'); // 'dark' | 'topo' | 'voyager'
  const [searchQuery, setSearchQuery] = useState('');
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showHalos, setShowHalos] = useState(true);
  const [showCatchmentZones, setShowCatchmentZones] = useState(true);

  // Basemap Tile Providers - ALL 100% Free, Reliable, and ZERO watermarks
  const tileProviders = {
    dark: {
      name: 'Dark Intelligence',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &bull; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19
    },
    topo: {
      name: 'Topographic Contours',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> &bull; SRTM DEM',
      subdomains: 'abc',
      maxZoom: 17
    },
    voyager: {
      name: 'Terrain & Relief',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &bull; Natural Earth',
      subdomains: 'abcd',
      maxZoom: 19
    }
  };

  // Center on selected region
  const activeCenter = selectedRegion 
    ? [selectedRegion.lat, selectedRegion.lng] 
    : defaultCenter;
  const activeZoom = selectedRegion ? 8 : defaultZoom;

  // Filtered regions for search
  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return regions;
    const q = searchQuery.toLowerCase();
    return regions.filter(r => 
      r.name?.toLowerCase().includes(q) || 
      r.state?.toLowerCase().includes(q) ||
      r.river_basin?.toLowerCase().includes(q)
    );
  }, [regions, searchQuery]);

  // High risk alerts count
  const criticalCount = regions.filter(r => r.risk_assessment?.risk_level === 'CRITICAL').length;
  const highCount = regions.filter(r => r.risk_assessment?.risk_level === 'HIGH').length;

  return (
    <div 
      className={`relative w-full rounded-panel overflow-hidden bg-app-bg border border-app-border shadow-card select-none ${
        fullScreen ? 'h-[calc(100vh-8.5rem)] min-h-[640px]' : ''
      }`}
      style={{ height: fullScreen ? undefined : height }}
    >
      {/* 1. TOP FLOATING INTELLIGENCE TOOLBAR */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left cluster: Search + Region Quick Selection */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-app-card/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-app-border shadow-card">
          <Search className="w-4 h-4 text-app-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search basin, river, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-app-muted focus:outline-none w-36 sm:w-56"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-app-muted hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Center: Geographic Cluster Quick Jumps */}
        <div className="hidden xl:flex items-center space-x-1.5 pointer-events-auto bg-app-card/90 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-app-border shadow-card text-xs">
          <span className="text-[11px] text-app-muted mr-1 font-medium">Quick Jumps:</span>
          {[
            { label: 'All India', center: [28.5, 84.0], zoom: 5 },
            { label: 'Uttarakhand', match: 'chamoli' },
            { label: 'Himachal', match: 'kullu' },
            { label: 'Sikkim', match: 'mangan' },
            { label: 'Assam & NE', match: 'dima_hasao' },
            { label: 'Western Ghats', match: 'wayanad' },
          ].map((cluster, i) => (
            <button
              key={i}
              onClick={() => {
                if (cluster.match) {
                  const reg = regions.find(r => r.id === cluster.match);
                  if (reg && onSelectRegion) onSelectRegion(reg);
                } else if (cluster.center) {
                  // Trigger reset
                  const reg = regions[0];
                  if (reg && onSelectRegion) onSelectRegion(reg);
                }
              }}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-app-muted hover:text-white hover:bg-app-elevated transition-colors"
            >
              {cluster.label}
            </button>
          ))}
        </div>

        {/* Right cluster: Map Style Switcher & Layer Controls */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          {/* Basemap Style Toggle */}
          <div className="flex items-center bg-app-card/90 backdrop-blur-md p-0.5 rounded-full border border-app-border shadow-card text-xs">
            {Object.entries(tileProviders).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setActiveTileLayer(key)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                  activeTileLayer === key 
                    ? 'bg-app-primary text-white shadow-sm' 
                    : 'text-app-muted hover:text-white'
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>

          {/* Layer Options Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`p-2 rounded-full border shadow-card transition-colors ${
                showLayerMenu 
                  ? 'bg-app-primary text-white border-app-primary' 
                  : 'bg-app-card/90 backdrop-blur-md text-app-muted hover:text-white border-app-border'
              }`}
              title="Map Overlays & Layers"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Layer Options Flyout */}
            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-app-card/95 backdrop-blur-md border border-app-border rounded-panel shadow-2xl p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-app-border">
                  <span className="font-semibold text-white flex items-center space-x-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-app-primary" />
                    <span>GIS Layer Overlays</span>
                  </span>
                  <button onClick={() => setShowLayerMenu(false)} className="text-app-muted hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                    <span>Flood Hazard Markers</span>
                    <input type="checkbox" checked={true} readOnly className="accent-blue-500 rounded" />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                    <span>Critical Alert Pulse Halos</span>
                    <input 
                      type="checkbox" 
                      checked={showHalos} 
                      onChange={(e) => setShowHalos(e.target.checked)} 
                      className="accent-blue-500 rounded" 
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer text-slate-200 hover:text-white">
                    <span>Catchment Influence Zones</span>
                    <input 
                      type="checkbox" 
                      checked={showCatchmentZones} 
                      onChange={(e) => setShowCatchmentZones(e.target.checked)} 
                      className="accent-blue-500 rounded" 
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-app-border text-[10px] text-app-muted space-y-1">
                  <div className="flex justify-between">
                    <span>Basemap Provider:</span>
                    <strong className="text-app-cyan">{tileProviders[activeTileLayer].name}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    No third-party API keys required. Open geospatial data feeds.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. LEFT FLOATING REGIONAL RISK SUMMARY PANEL */}
      <div className={`absolute top-16 left-3 z-[1000] w-72 sm:w-80 transition-all duration-300 pointer-events-none ${
        showLeftPanel ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        <div className="pointer-events-auto bg-app-card/90 backdrop-blur-md border border-app-border rounded-panel shadow-2xl p-3.5 space-y-3 max-h-[calc(100vh-14rem)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-app-cyan" />
              <span className="font-semibold text-xs text-white">Basin Risk Directory</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-semibold animate-pulse">
                  {criticalCount} Critical
                </span>
              )}
              <button 
                onClick={() => setShowLeftPanel(false)}
                className="p-1 rounded text-app-muted hover:text-white"
                title="Collapse Panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Region List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {filteredRegions.map((region) => {
              const riskLevel = region.risk_assessment?.risk_level || 'LOW';
              const riskScore = Number(region.risk_assessment?.risk_score) || 0;
              const meta = getRiskMeta(riskLevel);
              const isSelected = selectedRegion?.id === region.id;

              return (
                <div
                  key={region.id}
                  onClick={() => onSelectRegion && onSelectRegion(region)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-app-elevated border-app-primary shadow-glow' 
                      : 'bg-app-card/50 hover:bg-app-elevated/70 border-app-border/70 hover:border-app-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center space-x-1.5">
                        <span>{region.name}</span>
                        <span className="text-[11px] text-app-muted font-normal">({region.state})</span>
                      </div>
                      <div className="text-[10px] text-app-muted truncate max-w-[170px]">
                        {region.river_basin}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm tabular-nums" style={{ color: meta.color }}>
                        {riskScore.toFixed(1)}
                      </div>
                      <SeverityBadge level={riskLevel} size="xs" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Collapse/Expand Left Panel Toggle Button */}
      {!showLeftPanel && (
        <button
          onClick={() => setShowLeftPanel(true)}
          className="absolute top-16 left-3 z-[1000] p-2 bg-app-card/90 backdrop-blur-md text-white border border-app-border rounded-full shadow-card hover:bg-app-elevated transition-colors"
          title="Show Basin Directory"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* 3. RIGHT FLOATING DETAILED TELEMETRY PANEL (On Selected Basin) */}
      {selectedRegion && showRightPanel && (
        <div className="absolute top-16 right-3 z-[1000] w-80 sm:w-96 transition-all duration-300 pointer-events-none">
          <div className="pointer-events-auto bg-app-card/95 backdrop-blur-md border border-app-border rounded-panel shadow-2xl p-4 space-y-3.5 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-2.5 border-b border-app-border">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-white">{selectedRegion.name}</h3>
                  <span className="text-xs text-app-muted">({selectedRegion.state})</span>
                </div>
                <div className="text-xs text-app-cyan flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{selectedRegion.river_basin}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <SeverityBadge 
                  level={selectedRegion.risk_assessment?.risk_level} 
                  size="sm"
                  pulse={selectedRegion.risk_assessment?.risk_level === 'CRITICAL'}
                />
                <button 
                  onClick={() => setShowRightPanel(false)}
                  className="p-1 rounded text-app-muted hover:text-white"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Risk Score Highlight Gauge */}
            <div className="bg-app-bg/80 p-3 rounded-lg border border-app-border/80 flex items-center justify-between">
              <div>
                <div className="text-xs text-app-muted font-medium">Flash Flood Risk Score</div>
                <div className="text-xs text-slate-400 capitalize">
                  {selectedRegion.risk_assessment?.risk_level?.toLowerCase()} Hazard Classification
                </div>
              </div>
              <div className="flex items-baseline space-x-1">
                <span 
                  className="text-3xl font-extrabold tabular-nums tracking-tight"
                  style={{ color: getRiskMeta(selectedRegion.risk_assessment?.risk_level).color }}
                >
                  {(Number(selectedRegion.risk_assessment?.risk_score) || 0).toFixed(1)}
                </span>
                <span className="text-xs text-app-muted">/ 100</span>
              </div>
            </div>

            {/* 4-Cell Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Rainfall */}
              <div className="bg-app-elevated/60 p-2.5 rounded-lg border border-app-border flex items-center space-x-2.5">
                <CloudRain className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-app-muted">24h Rainfall</div>
                  <div className="font-bold text-white tabular-nums">
                    {(Number(selectedRegion.environmental_data?.rainfall) || 0).toFixed(1)} mm
                  </div>
                </div>
              </div>

              {/* River Stage */}
              <div className="bg-app-elevated/60 p-2.5 rounded-lg border border-app-border flex items-center space-x-2.5">
                <Waves className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-app-muted">River Gauge</div>
                  <div className="font-bold text-white tabular-nums">
                    {(Number(selectedRegion.environmental_data?.river_level) || 0).toFixed(2)} m
                  </div>
                </div>
              </div>

              {/* Soil Moisture */}
              <div className="bg-app-elevated/60 p-2.5 rounded-lg border border-app-border flex items-center space-x-2.5">
                <Droplets className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-app-muted">Soil Saturation</div>
                  <div className="font-bold text-white tabular-nums">
                    {(Number(selectedRegion.environmental_data?.soil_moisture) || 0).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Terrain Slope & Elevation */}
              <div className="bg-app-elevated/60 p-2.5 rounded-lg border border-app-border flex items-center space-x-2.5">
                <Mountain className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] text-app-muted">Elevation & Slope</div>
                  <div className="font-bold text-white tabular-nums">
                    {selectedRegion.environmental_data?.elevation}m &bull; {selectedRegion.environmental_data?.slope}°
                  </div>
                </div>
              </div>
            </div>

            {/* Active Hazard Warning Notice */}
            {selectedRegion.environmental_data?.danger_level && (
              <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[11px] text-slate-300 flex items-center justify-between">
                <span>Bankfull Danger Mark:</span>
                <span className="font-bold text-amber-300">
                  {selectedRegion.environmental_data.danger_level} m
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. BOTTOM FLOATING HAZARD TIER LEGEND */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] bg-app-card/90 backdrop-blur-md border border-app-border px-4 py-2 rounded-full shadow-card flex items-center space-x-4 text-xs">
        <span className="font-semibold text-white flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-app-cyan animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-app-muted">Severity:</span>
        </span>
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            <span className="text-red-400 font-medium">Critical (&gt;80)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-orange-400 font-medium">High (61–80)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-medium">Moderate (31–60)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 font-medium">Low (&lt;30)</span>
          </div>
        </div>
      </div>

      {/* 5. LEAFLET INTERACTIVE CANVAS */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          key={activeTileLayer}
          attribution={tileProviders[activeTileLayer].attribution}
          url={tileProviders[activeTileLayer].url}
          subdomains={tileProviders[activeTileLayer].subdomains}
          maxZoom={tileProviders[activeTileLayer].maxZoom}
        />

        <MapController 
          center={activeCenter} 
          zoom={activeZoom} 
          shouldInvalidate={showLeftPanel || showRightPanel}
        />

        {/* Region Hydrological Markers & Catchment Influence Zones */}
        {regions.map((region) => {
          const riskLevel = region.risk_assessment?.risk_level || 'LOW';
          const riskScore = Number(region.risk_assessment?.risk_score) || 0;
          const meta = getRiskMeta(riskLevel);
          const isSelected = selectedRegion?.id === region.id;
          const isCritical = riskLevel === 'CRITICAL';
          const isHigh = riskLevel === 'HIGH';

          const markerRadius = isSelected ? 16 : (isCritical ? 14 : (isHigh ? 12 : 9));

          return (
            <React.Fragment key={region.id}>
              {/* Catchment Influence Zone Overlay */}
              {showCatchmentZones && (isCritical || isHigh) && (
                <Circle
                  center={[region.lat, region.lng]}
                  radius={isCritical ? 25000 : 16000}
                  pathOptions={{
                    color: meta.color,
                    fillColor: meta.color,
                    fillOpacity: 0.08,
                    weight: 1,
                    dashArray: '4, 6'
                  }}
                />
              )}

              {/* Pulsing Outer Aura Halo for Critical/High */}
              {showHalos && (isCritical || isHigh) && (
                <CircleMarker
                  center={[region.lat, region.lng]}
                  radius={markerRadius + 8}
                  pathOptions={{
                    color: meta.color,
                    fillColor: meta.color,
                    fillOpacity: 0.22,
                    weight: 1.5,
                  }}
                />
              )}

              {/* Primary Interactive Marker */}
              <CircleMarker
                center={[region.lat, region.lng]}
                radius={markerRadius}
                pathOptions={{
                  color: isSelected ? '#FFFFFF' : meta.color,
                  fillColor: meta.color,
                  fillOpacity: 0.9,
                  weight: isSelected ? 3 : 1.5,
                }}
                eventHandlers={{
                  click: () => {
                    if (onSelectRegion) onSelectRegion(region);
                    setShowRightPanel(true);
                  }
                }}
              >
                <Popup className="modern-leaflet-popup" minWidth={260} maxWidth={300}>
                  <div className="p-1 space-y-2 text-slate-100 font-sans">
                    <div className="flex items-center justify-between border-b border-app-border pb-1.5">
                      <div className="font-bold text-xs text-white">
                        {region.name} <span className="text-app-muted font-normal">({region.state})</span>
                      </div>
                      <SeverityBadge level={riskLevel} size="xs" />
                    </div>
                    <div className="flex items-baseline justify-between py-1">
                      <span className="text-xs text-app-muted">Risk Score:</span>
                      <span className="text-xl font-extrabold tabular-nums" style={{ color: meta.color }}>
                        {riskScore.toFixed(1)} / 100
                      </span>
                    </div>
                    <div className="text-[11px] text-app-muted grid grid-cols-2 gap-1 bg-app-elevated/40 p-2 rounded">
                      <div>Rain: <strong className="text-white">{region.environmental_data?.rainfall}mm</strong></div>
                      <div>River: <strong className="text-white">{region.environmental_data?.river_level}m</strong></div>
                      <div>Soil: <strong className="text-white">{region.environmental_data?.soil_moisture}%</strong></div>
                      <div>Slope: <strong className="text-white">{region.environmental_data?.slope}°</strong></div>
                    </div>
                    <button
                      onClick={() => {
                        if (onSelectRegion) onSelectRegion(region);
                        setShowRightPanel(true);
                      }}
                      className="w-full py-1.5 bg-app-primary hover:bg-blue-600 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1"
                    >
                      <span>Open Basin Telemetry</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
