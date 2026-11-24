# FlashFlood-AI: Bloomberg-Style Flood Intelligence Dashboard
## Redesign Plan & Data Architecture Mapping

### 1. Design System & Theme Tokens
- **Base Background:** `#080F1F` (Dark Tactical Canvas)
- **Sidebar Surface:** `#0B1427` (Command Console Sidebar)
- **Card Surface:** `#111D33` (Flat 1px subtle blue border)
- **Panel / Secondary Surface:** `#17243B`
- **Border Token:** `#1E2D4A` / `rgba(0, 168, 255, 0.16)`
- **Accent Primary:** `#00A8FF`
- **Accent Highlight:** `#00D4FF`
- **Typography:** Inter, tabular numbers for all telemetry (`font-mono` / `tabular-nums`), WCAG AA compliant contrast
- **Severity Tokens (Icon + Label + Color):**
  - **CRITICAL:** `#EF4444` (Bg: `rgba(239, 68, 68, 0.15)`, Border: `rgba(239, 68, 68, 0.4)`)
  - **HIGH:** `#F97316` (Bg: `rgba(249, 115, 22, 0.15)`, Border: `rgba(249, 115, 22, 0.4)`)
  - **MODERATE:** `#FACC15` (Bg: `rgba(250, 204, 21, 0.15)`, Border: `rgba(250, 204, 21, 0.4)`)
  - **LOW:** `#10B981` (Bg: `rgba(16, 185, 129, 0.15)`, Border: `rgba(16, 185, 129, 0.4)`)

---

### 2. Component Hierarchy & Navigation Map
```
App.jsx (Global State: selectedRegion, regions, alerts, overview, onlineStatus, settings)
├── Layout / Shell
│   ├── Sidebar (Fixed / Collapsible / Mobile Drawer)
│   │   ├── Brand Identity ("FlashFlood-AI | Bloomberg-style Flood Intelligence")
│   │   ├── Navigation Links:
│   │   │   ├── Dashboard (/ and /dashboard)
│   │   │   ├── Live GIS Map (/map)
│   │   │   ├── Regions Directory (/regions)
│   │   │   ├── Alerts & Warnings (/alerts)
│   │   │   ├── Forecast (/forecast)
│   │   │   ├── Reports (/reports)
│   │   │   └── Settings (/settings)
│   │   └── Node Status Footer (MHA / NDMA Operational Node)
│   └── TopBar
│       ├── Health Pill (Online / Cached)
│       ├── Global Region Dropdown Selector (Synced to URL query ?region=id)
│       ├── Last Updated Clock (IST / UTC)
│       ├── Refresh Action Button (with spinner)
│       ├── Notification Bell (with active critical alert counter)
│       └── Operator Profile Button
│
├── Views
│   ├── DashboardView
│   │   ├── Critical Alert Banner (Visible only when active alert exists)
│   │   ├── KPI Row (4 Equal Grid Cards)
│   │   │   ├── KPI 1: Flash Flood Risk Score (Gauge meter 0-100, class, trend)
│   │   │   ├── KPI 2: Rainfall 24h & Intensity (mm, mm/h, sparkline, peak hour)
│   │   │   ├── KPI 3: River Gauge Level (current m, danger stage 4.5m, rising/falling, sparkline)
│   │   │   └── KPI 4: Soil Saturation (%, class: saturated/damp, sparkline)
│   │   ├── Middle Row (2/3 + 1/3)
│   │   │   ├── HydroTimeseriesCard (2/3 width)
│   │   │   │   ├── Dual-Axis Recharts (Blue bars: Rainfall mm, Orange line: River level m)
│   │   │   │   ├── Threshold Reference Line (Danger Stage: 4.5m)
│   │   │   │   └── Range Selector: 1h / 6h / 24h (Active) | 7d (Disabled: "Requires historical archive")
│   │   │   └── RegionalRiskAnalysisCard (1/3 width)
│   │   │       ├── Catchment Geomorphology Profile (Elevation, Slope, Area, Basin)
│   │   │       ├── Hydrological Contributing Factors (from ML model output)
│   │   │       └── Feature Importance / Attribution Bars (Derived from trained RandomForest)
│   │   └── Bottom Row (2/3 + 1/3)
│   │       ├── RegionsRiskTable (2/3 width)
│   │       │   ├── Search bar & Risk Level Filter (ALL, CRITICAL, HIGH, MODERATE, LOW)
│   │       │   ├── Sortable Columns (Default: Risk Score descending)
│   │       │   └── Interactive Rows (Click updates global selectedRegion)
│   │       └── SideColumn (1/3 width)
│   │           ├── ForecastPanel (Observed vs Projected Hydrograph & Labeled Gaps)
│   │           └── RecommendedActionsPanel (Advisory SOPs, Emergency Actions, Modal)
│   │
│   ├── GisMapView (/map)
│   │   ├── Leaflet Map Container (CARTO Dark, OpenTopoMap, Esri Satellite)
│   │   ├── Layer Panel (Risk Markers, Catchment Centers, Overlays)
│   │   ├── Region Selection Sync with Global State
│   │   └── Topographic & Basin Quick Zoom Presets
│   │
│   ├── RegionsView (/regions)
│   │   ├── Comprehensive Basin Grid with Quick Search & State Filters
│   │   └── Side-by-Side Basin Comparison Tool (Compare 2 selected mountain catchments)
│   │
│   ├── AlertsView (/alerts)
│   │   ├── Active Early Warning Bulletins Tab
│   │   ├── Historical Incident Logs Tab
│   │   ├── Filter by Severity & Region
│   │   └── Print / Export Bulletin Action
│   │
│   ├── ForecastView (/forecast)
│   │   ├── Detailed Hydro-Meteorological Trajectory
│   │   ├── 6h / 12h / 24h Model Projection Curves
│   │   └── Explicit Labeled Placeholders for Multi-Day NWP Radar API Feeds
│   │
│   ├── ReportsView (/reports)
│   │   ├── Regional Telemetry Audit Table
│   │   ├── System-Wide Summary Report Card
│   │   └── Real CSV Export Download Generator
│   │
│   └── SettingsView (/settings)
│       ├── Measurement Unit Preference (Metric vs Imperial)
│       ├── Default Initial Region
│       ├── Auto-Refresh Polling Interval (15s, 30s, 60s, Manual)
│       ├── Time Display (IST vs UTC)
│       └── LocalStorage Persistence
```

---

### 3. Data Mapping Table

| UI Element | Data Field | Endpoint / Source | Status | Handling / Derivation |
| :--- | :--- | :--- | :---: | :--- |
| **System Overview** | `total_regions`, `critical_regions`, `high_risk_regions`, `overall_status` | `GET /api/overview` | ✅ Available | Direct bind to stats badges & top bar status |
| **Regions List** | `id`, `name`, `state`, `lat`, `lng`, `river_basin`, `environmental_data`, `risk_assessment` | `GET /api/regions` | ✅ Available | Ingests 12 monitored Himalayan & NE basins |
| **Selected Region** | Detailed single catchment object | `GET /api/regions/{id}` | ✅ Available | Synced with global state & URL query params |
| **Risk Score** | `risk_assessment.risk_score` (0-100) | `GET /api/risk/{id}` | ✅ Available | Formats into large tabular bold numbers & gauge |
| **Risk Tier** | `risk_assessment.risk_level` | `GET /api/risk/{id}` | ✅ Available | Maps to Critical/High/Moderate/Low severity badge |
| **Risk Trend** | `risk_assessment.trend` ("rising", "falling", "steady") | `GET /api/risk/{id}` | ✅ Available | Evaluated against last 2 historical hours |
| **Rainfall 24h** | `environmental_data.rainfall` | `GET /api/weather/{id}` | ✅ Available | Unit: mm. Displayed in KPI 2 & dual-axis chart |
| **Rainfall Intensity**| `environmental_data.rainfall_intensity` | `GET /api/weather/{id}` | ✅ Available | Unit: mm/h. Peak intensity surge |
| **River Gauge Height**| `environmental_data.river_level` | `GET /api/regions/{id}` | ✅ Available | Unit: meters. Plotted against 4.5m danger mark |
| **Danger Mark** | `environmental_data.danger_level` (default: 4.5m) | `GET /api/regions/{id}` | ✅ Available | Plotted as reference line in charts & KPI gauge |
| **Soil Moisture** | `environmental_data.soil_moisture` | `GET /api/weather/{id}` | ✅ Available | Unit: %. Infiltration status class |
| **Catchment Terrain**| `elevation` (m), `slope` (°), `catchment_area_sqkm` | `GET /api/regions/{id}` | ✅ Available | Shown in Regional Risk Analysis card |
| **24h Timeseries** | `historical_24h` array (hour, rainfall, river_level, soil, risk) | `GET /api/historical/{id}` | ✅ Available | Recharts dual-axis & sparkline generators |
| **1h / 6h Range** | Slices of `historical_24h` | Derived | ⚡ Derived | Filtered from real 24h array |
| **7-Day History** | 7-day historical telemetry archive | Missing | ⚠️ Missing | Range disabled with tooltip: *"7-day archive not available from current data source"* |
| **Active Alerts** | `alerts` array (id, region, risk_level, trigger, factors, action_taken) | `GET /api/alerts` | ✅ Available | Populates Alert Banner & Alerts View |
| **Contributing Factors** | `risk_assessment.contributing_factors` | `GET /api/risk/{id}` | ✅ Available | Displayed as explainability checklist |
| **Recommended SOP**| `risk_assessment.recommended_action` | `GET /api/risk/{id}` | ✅ Available | Labeled as "Advisory (MHA/NDMA Protocol)" |
| **ML Model Info** | Algorithm, $R^2$, MAE, RMSE, feature importances | `GET /api/ml-info` | ✅ Available | Binds real trained RandomForest metrics |
| **Multi-Day NWP Forecast** | 3-7 day GFS/WRF precipitation raster | Missing | ⚠️ Missing | Documented in `BACKEND_GAPS.md`. Labeled placeholder shown in Forecast tab |
| **Live WMS Radar Tiles**| GeoTIFF / WMS IMD Doppler radar reflectivity | Missing | ⚠️ Missing | Documented in `BACKEND_GAPS.md`. Map layer switch visibly disabled |
