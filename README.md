# AI-Based Flash Flood Early Warning System for Hilly Regions

**Smart India Hackathon 2026 Prototype (SIH26192)**  
*Theme:* Disaster Management | *Category:* Software | *Organization:* Ministry of Home Affairs (MHA) | *Team:* DeepCoders

---

## 1. Executive Summary

Flash floods in mountainous terrain develop within minutes due to steep geomorphology, high-intensity orographic cloudbursts, and saturated soils. Conventional single-parameter weather alerts fail to capture the complex interaction of hydrology and terrain.

**FlashFlood-AI** unifies 4 distinct physical domains into an early-warning decision-support system:
1. **Atmospheric Precipitation (IMD)**: 24h cumulative rainfall & peak hourly intensity.
2. **Soil Saturation (ISRO SAC / MOSDAC)**: Antecedent soil moisture saturation percentage.
3. **Hydrological River Stage (Central Water Commission - CWC)**: River gauge level vs bankfull danger marks.
4. **Catchment Topography (NRSC / Bhuvan CartoDEM)**: 30m digital elevation and terrain slope angle.

The system processes these features through a **Multi-Source Data Fusion Engine** and feeds an ensemble **Scikit-Learn Random Forest Regressor** to predict a continuous **Flash Flood Risk Score (0–100)** and assign standardized hazard tiers:
- `0–30`: **LOW** (Safe / Normal monitoring)
- `31–60`: **MODERATE** (Yellow Watch)
- `61–80`: **HIGH** (Orange Alert)
- `81–100`: **CRITICAL** (Red Emergency / Evacuation)

---

## 2. Technical Architecture

```
                    MULTI-SOURCE DATA INGESTION
     ┌──────────────┬──────────────┬──────────────┬──────────────┐
     │ Rainfall     │ Soil Moisture│ River Level  │ Terrain DEM  │
     │ (IMD AWS/DWR)│ (MOSDAC/SAC) │ (CWC Gauges) │(NRSC Bhuvan) │
     └──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┘
            │              │              │              │
            ▼              ▼              ▼              ▼
     ┌───────────────────────────────────────────────────────────┐
     │          MULTI-SOURCE DATA FUSION & FEATURE PIPELINE      │
     │  - Soil Saturation Index (SSI = Moisture / 100)           │
     │  - Runoff Potential Factor (Q ∝ SSI^1.3 × sin(θ))         │
     │  - River Headroom Utilization Ratio (R = Stage / Danger)  │
     │  - Topographic Valley Funneling Factor                    │
     └─────────────────────────────┬─────────────────────────────┘
                                   ▼
     ┌───────────────────────────────────────────────────────────┐
     │         SCIKIT-LEARN RANDOM FOREST PREDICTION ENGINE      │
     │     120 Estimator Trees • R²: 0.985 • Latency: <15ms      │
     └─────────────────────────────┬─────────────────────────────┘
                                   ▼
     ┌───────────────────────────────────────────────────────────┐
     │                  FASTAPI REST BACKEND                     │
     │   /api/predict  |  /api/regions  |  /api/alerts  | ...    │
     └─────────────────────────────┬─────────────────────────────┘
                                   ▼
     ┌───────────────────────────────────────────────────────────┐
     │               REACT + VITE FRONTEND (LEAFLET GIS)         │
     │   - Interactive GIS Catchment Map with Pulsing Radii      │
     │   - Recharts Dual-Axis Rainfall vs River Hydrograph       │
     │   - Interactive What-If Simulation Sandbox with Sliders   │
     │   - MHA / NDMA Standard Operating Procedure (SOP) Alerts  │
     └───────────────────────────────────────────────────────────┘
```

---

## 3. Repository Structure

```
sih-flash-flood-mvp/
├── backend/
│   ├── api/
│   │   ├── models.py             # Pydantic schemas (PredictionRequest, Region, etc.)
│   │   └── routes.py             # REST API endpoints (/predict, /regions, /alerts)
│   ├── data/
│   │   ├── regions_data.json     # 12 Himalayan/NE monitored hilly basins
│   │   └── alerts_history.json   # Early warning bulletin historical log
│   ├── ml_model/
│   │   ├── preprocessing.py      # Feature engineering & data fusion logic
│   │   ├── train_model.py        # Random Forest model training & validation
│   │   ├── model.pkl             # Trained serialized model
│   │   └── model_meta.json       # Metrics & feature importance metadata
│   ├── main.py                   # FastAPI app entrypoint with CORS
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Tactical command bar & IST clock
│   │   │   ├── Dashboard.jsx            # Command center & stat cards
│   │   │   ├── GisMap.jsx               # Leaflet.js interactive hazard map
│   │   │   ├── PredictionSimulator.jsx  # Interactive what-if sandbox sliders
│   │   │   ├── ChartsSection.jsx        # Recharts hydrographs & attribution
│   │   │   ├── AlertsPanel.jsx          # Broadcast alerts & filterable table
│   │   │   ├── DataFusionView.jsx       # Interactive architecture flow
│   │   │   ├── DataSourcesView.jsx      # IMD/CWC/NRSC documentation
│   │   │   └── AboutSIH.jsx             # SIH 2026 specs & DeepCoders info
│   │   ├── services/
│   │   │   └── api.js                   # API client with resilient fallbacks
│   │   ├── App.jsx                      # Main app state & reactive syncing
│   │   ├── main.jsx                     # Vite React bootstrap
│   │   └── index.css                    # Tailwind CSS & custom tactical styles
│   ├── index.html                       # HTML5 canvas & Leaflet stylesheet
│   ├── package.json                     # Frontend dependencies
│   ├── tailwind.config.js               # Tactical dark theme styling
│   └── vite.config.js                   # Vite dev server & /api proxy
├── run_app.bat                          # One-click Windows launch script
└── README.md                            # Comprehensive documentation
```

---

## 4. Setup & Running Instructions

### Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: 3.10+ (tested on Python 3.14)

### Quick Start (Windows One-Click)
Double-click `run_app.bat` or run:
```powershell
.\run_app.bat
```

---

### Manual Step-by-Step Launch

#### 1. Backend Setup (FastAPI)
```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- API will start at: `http://localhost:8000`
- Interactive Swagger UI: `http://localhost:8000/docs`

#### 2. Frontend Setup (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 5. Sample API Requests

### 1. Run Flash Flood Risk Prediction
**Endpoint:** `POST /api/predict`

**Request Payload:**
```json
{
  "rainfall": 128.5,
  "rainfall_intensity": 36.4,
  "soil_moisture": 88.2,
  "river_level": 4.65,
  "elevation": 2150,
  "slope": 38.5,
  "region_id": "chamoli"
}
```

**Response Payload:**
```json
{
  "risk_score": 88.4,
  "risk_level": "CRITICAL",
  "contributing_factors": [
    "Extreme rainfall (128.5 mm) exceeding catchment absorption threshold",
    "Cloudburst intensity rate (36.4 mm/hr)",
    "Soil near complete saturation (88.2%), causing direct surface runoff",
    "River gauge at 4.65m exceeding critical overflow stage",
    "Steep terrain slope (38.5°) sharply accelerating hydraulic flow velocity"
  ],
  "recommended_action": "🚨 EMERGENCY (RED): Trigger municipal sirens immediately. Order immediate evacuation of low-lying floodplains. Deploy NDRF/SDRF swift-water rescue teams.",
  "feature_importance": {
    "rainfall_contribution": 30.0,
    "soil_saturation_contribution": 22.1,
    "river_stage_contribution": 25.0,
    "terrain_slope_contribution": 12.8
  },
  "timestamp": "2026-09-06 17:30:00 IST",
  "model_version": "RandomForest-v1.0 (SIH-2026-MVP)"
}
```

### 2. Fetch Monitored Regions
**Endpoint:** `GET /api/regions`

### 3. Fetch Alert Bulletin History
**Endpoint:** `GET /api/alerts?risk_level=CRITICAL`

---

## 6. Monitored Basins & Geographical Coverage

1. **Chamoli, Uttarakhand** (Upper Alaknanda Basin)
2. **Uttarkashi, Uttarakhand** (Upper Bhagirathi Basin)
3. **Kullu, Himachal Pradesh** (Beas River Basin)
4. **Shimla, Himachal Pradesh** (Sutlej Sub-catchment)
5. **Dharamshala / Kangra, Himachal Pradesh** (Gaj Khad Sub-basin)
6. **Mandi, Himachal Pradesh** (Middle Beas Basin)
7. **Mangan, North Sikkim** (Upper Teesta River Basin)
8. **Gangtok, East Sikkim** (Rani Khola Basin)
9. **Dima Hasao (Haflong), Assam** (Jatinga & Kopili Basin)
10. **Tawang, Arunachal Pradesh** (Tawang Chu Basin)
11. **Cherrapunji (Sohra), Meghalaya** (Shella Escarpment Gorges)
12. **Wayanad, Kerala** (Kabini River / Western Ghats)

---

## 7. Data Provenance & Hackathon Disclaimer

> **Transparency Note for SIH 2026 Jury:**
> In accordance with hackathon guidelines, real-time access to production government APIs (IMD AWS, CWC hydrographs, ISRO Bhuvan) requires institutional credentials and secure telemetry access. 
> 
> This MVP operates on **scientifically calibrated synthetic datasets** reflecting actual historical flash flood events in the Himalayas (e.g., 2021 Chamoli cloudburst, 2023 Teesta dam breach). The entire data fusion architecture is plug-and-play ready to accept live REST/GeoJSON data streams from government sources.

---

## 8. Team Details

- **Team Name**: DeepCoders
- **Problem Statement**: SIH26192 - Flash Flood Prediction System for Hilly Regions using Multi-Source Data
- **Organization**: Ministry of Home Affairs (MHA)
