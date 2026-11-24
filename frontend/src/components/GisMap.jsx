import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayersControl } from 'react-leaflet';
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
  Info,
  Maximize2
} from 'lucide-react';
import { SeverityBadge, getRiskMeta } from '../utils/theme';

const { BaseLayer } = LayersControl;

// Map controller to automatically pan/zoom when a region is selected
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 8, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function GisMap({ 
  regions = [], 
  selectedRegion, 
  onSelectRegion, 
  height = "600px" 
}) {
  const defaultCenter = [28.5, 84.0];
  const defaultZoom = 5;

  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showHalos, setShowHalos] = useState(true);

  const currentCenter = selectedRegion 
    ? [selectedRegion.lat, selectedRegion.lng] 
    : defaultCenter;

  const getMarkerRadius = (level, isSelected) => {
    let base = 9;
    if (level === 'CRITICAL') base = 15;
    else if (level === 'HIGH') base = 13;
    else if (level === 'MODERATE') base = 11;
    return isSelected ? base + 4 : base;
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-bb-border bg-bb-card shadow-flat">
      {/* Top Map Action Bar */}
      <div className="bg-[#091122] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-bb-border z-10 text-xs">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bb-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-bb-accent"></span>
          </span>
          <span className="font-bold text-white font-mono text-xs uppercase tracking-wider">
            GIS Hydrological & Catchment Telemetry Layer
          </span>
          <span className="text-bb-subtle hidden sm:inline">&bull;</span>
          <span className="text-bb-muted hidden sm:inline font-mono text-[11px]">
            Leaflet.js + CartoDEM Multi-Source Topography
          </span>
        </div>

        {/* Quick Zoom & Layer Panel Toggle */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <span className="text-bb-subtle text-[11px] font-mono hidden md:inline">Quick Zoom:</span>
          {[
            { label: 'All India Belts', center: [28.5, 84.0], zoom: 5 },
            { label: 'Uttarakhand', center: [30.5, 78.9], zoom: 8 },
            { label: 'Himachal', center: [31.8, 77.1], zoom: 8 },
            { label: 'Sikkim', center: [27.4, 88.5], zoom: 9 },
            { label: 'North-East', center: [25.8, 92.8], zoom: 7 },
            { label: 'Western Ghats', center: [11.7, 76.1], zoom: 9 },
          ].map((cluster, idx) => (
            <button
              key={idx}
              onClick={() => {
                const targetReg = regions.find(r => 
                  cluster.label.includes(r.state) || 
                  (cluster.label === 'Uttarakhand' && r.id === 'chamoli') ||
                  (cluster.label === 'Himachal' && r.id === 'kullu') ||
                  (cluster.label === 'Sikkim' && r.id === 'mangan') ||
                  (cluster.label === 'North-East' && r.id === 'dima_hasao') ||
                  (cluster.label === 'Western Ghats' && r.id === 'wayanad')
                );
                if (targetReg) onSelectRegion(targetReg);
              }}
              className="px-2 py-1 bg-bb-panel hover:bg-bb-border text-bb-muted hover:text-white rounded text-[11px] font-mono border border-bb-border transition-colors whitespace-nowrap"
            >
              {cluster.label}
            </button>
          ))}

          {/* Toggle Layers Panel */}
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`px-2 py-1 rounded text-[11px] font-mono border flex items-center space-x-1 transition-colors ${
              showLayerPanel 
                ? 'bg-bb-accent text-white border-bb-accent font-bold' 
                : 'bg-bb-panel text-bb-muted hover:text-white border-bb-border'
            }`}
            title="Layer Overlays"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
          </button>
        </div>
      </div>

      {/* Layer Options Drawer Panel */}
      {showLayerPanel && (
        <div className="absolute top-12 right-4 z-20 w-72 bg-bb-sidebar border border-bb-border rounded-lg shadow-2xl p-3 text-xs space-y-2.5">
          <div className="font-bold text-white border-b border-bb-border pb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-bb-accent" />
              <span>GIS Layer Overlays</span>
            </span>
            <button onClick={() => setShowLayerPanel(false)} className="text-bb-subtle hover:text-white text-xs">✕</button>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <label className="flex items-center justify-between cursor-pointer text-slate-200">
              <span>Risk Hazard Markers</span>
              <input type="checkbox" checked={true} readOnly className="accent-blue-500 rounded" />
            </label>

            <label className="flex items-center justify-between cursor-pointer text-slate-200">
              <span>Pulsing Hazard Halos</span>
              <input 
                type="checkbox" 
                checked={showHalos} 
                onChange={() => setShowHalos(!showHalos)} 
                className="accent-blue-500 rounded" 
              />
            </label>

            {/* Disabled overlays with required tooltips */}
            {[
              { name: 'Live IMD Radar Reflectivity (dBZ)', reason: 'Not available from current data source (OGC WMS feed planned)' },
              { name: 'Soil Saturation Contours (MOSDAC)', reason: 'Not available from current data source (NetCDF raster planned)' },
              { name: 'Slope Inundation Vector Polygons', reason: 'Not available from current data source (DEM vector layer planned)' }
            ].map((overlay, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between text-bb-subtle/50 opacity-60 cursor-not-allowed border-t border-bb-border/30 pt-1.5"
                title={overlay.reason}
              >
                <span className="truncate max-w-[200px]">{overlay.name}</span>
                <span className="text-[9px] bg-bb-border/30 px-1 py-0.2 rounded">Disabled</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Canvas */}
      <div style={{ height }} className="w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Tactical Dark (CARTO)">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
            </BaseLayer>
            <BaseLayer name="Topographic Contours (OpenTopoMap)">
              <TileLayer
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <BaseLayer name="Satellite Imagery (Esri World)">
              <TileLayer
                attribution='&copy; Esri, Maxar, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </BaseLayer>
          </LayersControl>

          <MapRecenter center={currentCenter} zoom={selectedRegion ? 8 : 5} />

          {/* Region Markers */}
          {regions.map((region) => {
            const riskLevel = region.risk_assessment?.risk_level || 'LOW';
            const riskScore = Number(region.risk_assessment?.risk_score) || 0;
            const meta = getRiskMeta(riskLevel);
            const isSelected = selectedRegion?.id === region.id;
            const radius = getMarkerRadius(riskLevel, isSelected);

            return (
              <React.Fragment key={region.id}>
                {/* Pulsing Outer Halo for Critical and High Regions */}
                {showHalos && (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') && (
                  <CircleMarker
                    center={[region.lat, region.lng]}
                    radius={radius + 8}
                    pathOptions={{
                      color: meta.color,
                      fillColor: meta.color,
                      fillOpacity: 0.15,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                )}

                {/* Primary Circle Marker */}
                <CircleMarker
                  center={[region.lat, region.lng]}
                  radius={radius}
                  pathOptions={{
                    color: isSelected ? '#FFFFFF' : meta.color,
                    fillColor: meta.color,
                    fillOpacity: 0.85,
                    weight: isSelected ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    click: () => onSelectRegion(region)
                  }}
                >
                  <Popup className="tactical-leaflet-popup" minWidth={290} maxWidth={340}>
                    <div className="p-1 space-y-2.5 text-slate-100 font-sans">
                      {/* Header */}
                      <div className="flex items-start justify-between border-b border-bb-border pb-2">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center space-x-1.5">
                            <span>{region.name}</span>
                            <span className="text-bb-muted text-xs font-normal">({region.state})</span>
                          </div>
                          <div className="text-[11px] text-bb-subtle font-mono">
                            {region.river_basin}
                          </div>
                        </div>
                        <SeverityBadge level={riskLevel} size="xs" />
                      </div>

                      {/* Risk Score Highlight */}
                      <div className="bg-[#091122] p-2 rounded border border-bb-border flex items-center justify-between">
                        <span className="text-xs text-bb-muted font-mono">Risk Score:</span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-black font-mono tabular-nums" style={{ color: meta.color }}>
                            {riskScore.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-bb-subtle font-mono">/ 100</span>
                        </div>
                      </div>

                      {/* Telemetry Metrics Grid */}
                      <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                        <div className="bg-bb-panel/60 p-1.5 rounded flex items-center space-x-1.5 border border-bb-border/40">
                          <CloudRain className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-bb-subtle">Rainfall 24h</div>
                            <div className="font-bold text-white tabular-nums">
                              {Number(region.environmental_data?.rainfall || 0).toFixed(1)} mm
                            </div>
                          </div>
                        </div>

                        <div className="bg-bb-panel/60 p-1.5 rounded flex items-center space-x-1.5 border border-bb-border/40">
                          <Waves className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-bb-subtle">River Level</div>
                            <div className="font-bold text-white tabular-nums">
                              {Number(region.environmental_data?.river_level || 0).toFixed(2)} m
                            </div>
                          </div>
                        </div>

                        <div className="bg-bb-panel/60 p-1.5 rounded flex items-center space-x-1.5 border border-bb-border/40">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-bb-subtle">Soil Saturation</div>
                            <div className="font-bold text-white tabular-nums">
                              {Number(region.environmental_data?.soil_moisture || 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>

                        <div className="bg-bb-panel/60 p-1.5 rounded flex items-center space-x-1.5 border border-bb-border/40">
                          <Mountain className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-bb-subtle">Elevation / Slope</div>
                            <div className="font-bold text-white tabular-nums">
                              {region.environmental_data?.elevation}m &bull; {region.environmental_data?.slope}°
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Select CTA Button */}
                      <button
                        onClick={() => onSelectRegion(region)}
                        className="w-full mt-1 py-1.5 px-3 bg-bb-accent hover:bg-blue-600 text-white rounded text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <span>Set Active Basin in Dashboard</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Floating Tactical Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-10 bg-bb-sidebar/95 backdrop-blur border border-bb-border p-3 rounded-lg shadow-2xl text-xs space-y-1.5 max-w-[210px] font-mono">
        <div className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center space-x-1.5 border-b border-bb-border pb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-bb-accent" />
          <span>Flood Hazard Tiers</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-400 font-semibold">CRITICAL</span>
            </div>
            <span className="text-bb-muted">81 - 100</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-orange-400 font-semibold">HIGH</span>
            </div>
            <span className="text-bb-muted">61 - 80</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-amber-300 font-semibold">MODERATE</span>
            </div>
            <span className="text-bb-muted">31 - 60</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-400 font-semibold">LOW</span>
            </div>
            <span className="text-bb-muted">0 - 30</span>
          </div>
        </div>
        <div className="text-[10px] text-bb-subtle pt-1 border-t border-bb-border leading-tight">
          Click any marker to inspect telemetry & pan map.
        </div>
      </div>
    </div>
  );
}
