import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, LayersControl } from 'react-leaflet';
import { 
  CloudRain, 
  Waves, 
  Mountain, 
  Compass, 
  AlertTriangle, 
  ExternalLink,
  ShieldAlert,
  Droplets
} from 'lucide-react';

const { BaseLayer } = LayersControl;

// Map controller to automatically pan/zoom when a region is selected
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || 9, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function GisMap({ 
  regions = [], 
  selectedRegion, 
  onSelectRegion, 
  height = "520px" 
}) {
  const defaultCenter = [28.5, 84.0];
  const defaultZoom = 5;

  const currentCenter = selectedRegion 
    ? [selectedRegion.lat, selectedRegion.lng] 
    : defaultCenter;

  const getRiskColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MODERATE': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getMarkerRadius = (level, isSelected) => {
    let base = 10;
    if (level === 'CRITICAL') base = 16;
    else if (level === 'HIGH') base = 14;
    else if (level === 'MODERATE') base = 12;
    return isSelected ? base + 4 : base;
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-command-border shadow-2xl bg-command-darker">
      {/* Top Map Action Bar */}
      <div className="bg-command-card/90 backdrop-blur px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-command-border z-10 text-xs">
        <div className="flex items-center space-x-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="font-semibold text-slate-200">GIS Terrain & Catchment Telemetry Layer</span>
          <span className="text-slate-500 hidden sm:inline">&bull;</span>
          <span className="text-slate-400 hidden sm:inline">Leaflet.js + CartoDEM Multi-Source GIS</span>
        </div>

        {/* Region Quick Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Quick Zoom:</span>
          {[
            { label: 'All India Hilly Belts', center: [28.5, 84.0], zoom: 5 },
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
              className="px-2 py-1 bg-command-dark hover:bg-command-border text-slate-300 hover:text-white rounded text-[11px] transition-colors border border-command-border/50 whitespace-nowrap"
            >
              {cluster.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ height }} className="w-full relative z-0">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="Tactical Dark (Command Mode)">
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

          <MapRecenter center={currentCenter} zoom={selectedRegion ? 9 : 5} />

          {/* Region Markers */}
          {regions.map((region) => {
            const riskLevel = region.risk_assessment?.risk_level || 'LOW';
            const riskScore = region.risk_assessment?.risk_score || 0;
            const color = getRiskColor(riskLevel);
            const isSelected = selectedRegion?.id === region.id;
            const radius = getMarkerRadius(riskLevel, isSelected);

            return (
              <React.Fragment key={region.id}>
                {/* Pulsing Outer Halo for Critical and High Regions */}
                {(riskLevel === 'CRITICAL' || riskLevel === 'HIGH') && (
                  <CircleMarker
                    center={[region.lat, region.lng]}
                    radius={radius + 8}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.15,
                      weight: 1.5,
                      dashArray: '4, 4'
                    }}
                  />
                )}

                {/* Primary Marker */}
                <CircleMarker
                  center={[region.lat, region.lng]}
                  radius={radius}
                  pathOptions={{
                    color: isSelected ? '#ffffff' : color,
                    fillColor: color,
                    fillOpacity: 0.85,
                    weight: isSelected ? 3 : 1.5,
                  }}
                  eventHandlers={{
                    click: () => onSelectRegion(region)
                  }}
                >
                  <Popup className="tactical-leaflet-popup" minWidth={280} maxWidth={340}>
                    <div className="p-1 space-y-2 text-slate-100 font-sans">
                      {/* Popup Header */}
                      <div className="flex items-start justify-between border-b border-command-border pb-1.5">
                        <div>
                          <div className="font-bold text-sm text-white flex items-center space-x-1.5">
                            <span>{region.name}</span>
                            <span className="text-slate-400 text-xs font-normal">({region.state})</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {region.river_basin}
                          </div>
                        </div>
                        <span 
                          className="px-2 py-0.5 rounded text-[11px] font-extrabold uppercase font-mono tracking-wider"
                          style={{
                            backgroundColor: `${color}25`,
                            color: color,
                            border: `1px solid ${color}60`
                          }}
                        >
                          {riskLevel}
                        </span>
                      </div>

                      {/* Risk Score Highlight */}
                      <div className="bg-command-dark p-2 rounded flex items-center justify-between">
                        <span className="text-xs text-slate-300">Flash Flood Risk Score:</span>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-xl font-black font-mono" style={{ color }}>
                            {riskScore}
                          </span>
                          <span className="text-[10px] text-slate-400">/ 100</span>
                        </div>
                      </div>

                      {/* Multi-Source Parameters Grid */}
                      <div className="grid grid-cols-2 gap-1.5 text-xs">
                        <div className="bg-command-darkest/70 p-1.5 rounded flex items-center space-x-1.5">
                          <CloudRain className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-slate-400">Rainfall (24h)</div>
                            <div className="font-mono font-semibold text-slate-200">
                              {region.environmental_data?.rainfall} mm
                            </div>
                          </div>
                        </div>

                        <div className="bg-command-darkest/70 p-1.5 rounded flex items-center space-x-1.5">
                          <Droplets className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-slate-400">Soil Moisture</div>
                            <div className="font-mono font-semibold text-slate-200">
                              {region.environmental_data?.soil_moisture}%
                            </div>
                          </div>
                        </div>

                        <div className="bg-command-darkest/70 p-1.5 rounded flex items-center space-x-1.5">
                          <Waves className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-slate-400">River Level</div>
                            <div className="font-mono font-semibold text-slate-200">
                              {region.environmental_data?.river_level} m
                              <span className="text-[10px] text-slate-500 ml-1">/ {region.environmental_data?.danger_level}m</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-command-darkest/70 p-1.5 rounded flex items-center space-x-1.5">
                          <Mountain className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <div className="text-[10px] text-slate-400">Elevation / Slope</div>
                            <div className="font-mono font-semibold text-slate-200">
                              {region.environmental_data?.elevation}m &bull; {region.environmental_data?.slope}°
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contributing Factors Bullet */}
                      {region.risk_assessment?.contributing_factors?.length > 0 && (
                        <div className="bg-slate-900/80 p-2 rounded text-[11px] text-slate-300 space-y-1">
                          <div className="font-semibold text-slate-400 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>Primary Trigger:</span>
                          </div>
                          <div className="text-slate-300 leading-snug">
                            {region.risk_assessment.contributing_factors[0]}
                          </div>
                        </div>
                      )}

                      {/* Select CTA Button */}
                      <button
                        onClick={() => onSelectRegion(region)}
                        className="w-full mt-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                      >
                        <span>Load In Dashboard & Telemetry</span>
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
      <div className="absolute bottom-3 right-3 z-10 bg-command-darkest/90 backdrop-blur border border-command-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 max-w-[210px]">
        <div className="font-bold text-slate-200 text-[11px] uppercase tracking-wider flex items-center space-x-1.5 border-b border-command-border/60 pb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          <span>Flash Flood Hazard Scale</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-red-400 font-semibold">CRITICAL</span>
            </div>
            <span className="font-mono text-slate-400">81 - 100</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-orange-400 font-semibold">HIGH</span>
            </div>
            <span className="font-mono text-slate-400">61 - 80</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-amber-400 font-semibold">MODERATE</span>
            </div>
            <span className="font-mono text-slate-400">31 - 60</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-400 font-semibold">LOW</span>
            </div>
            <span className="font-mono text-slate-400">0 - 30</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-command-border/40 leading-tight">
          Click any marker to inspect catchment telemetry and trigger early warnings.
        </div>
      </div>
    </div>
  );
}
