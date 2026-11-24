# Backend Gaps & Architecture Evolution (BACKEND_GAPS.md)

This document tracks endpoints and data capabilities identified during the Bloomberg-Style Flood Intelligence frontend redesign that are currently not provided by the MVP backend API, along with recommended endpoints, payloads, and integration strategies.

---

### Gap 1: Extended Multi-Day Historical Telemetry Archive (7-Day & 30-Day)
* **Current Limitation:** The backend `/api/historical/{region_id}` returns a 6-to-12 point 24-hour telemetry window. Selecting longer historical ranges (e.g. 7-Day or 30-Day trends) is currently disabled on the timeseries chart.
* **Operational Need:** Hydrograph recession curve analysis and antecedent moisture tracking over weekly monsoon phases.
* **Suggested Endpoint:** `GET /api/historical/{region_id}?range=7d` (or `30d`)
* **Expected Shape:**
  ```json
  {
    "region_id": "chamoli",
    "range": "7d",
    "data_points": [
      {
        "timestamp": "2026-09-01T00:00:00Z",
        "rainfall_mm": 45.2,
        "river_level_m": 2.8,
        "soil_moisture_pct": 65.0,
        "risk_score": 42.1
      }
    ]
  }
  ```
* **Frontend Handling:** 7-Day and 30-Day selector buttons are styled in an inactive state with a clear tooltip: *"Not available from current data source (24h telemetry window active)"*.

---

### Gap 2: Numerical Weather Prediction (NWP) Quantitative Precipitation Forecasts (QPF)
* **Current Limitation:** The system estimates short-term hydrological risk from real-time observations and trained ML inference. It does not ingest future 3-to-5 day numerical weather grids (e.g. IMD GFS/WRF $3\text{ km}$ resolution).
* **Operational Need:** Multi-horizon early warnings (6h nowcast, 24h outlook, 72h strategic prepositioning of disaster response forces).
* **Suggested Endpoint:** `GET /api/forecast/{region_id}?horizon=72h`
* **Expected Shape:**
  ```json
  {
    "region_id": "chamoli",
    "generated_at": "2026-09-06T18:00:00Z",
    "model_source": "IMD-WRF-3KM",
    "horizons": [
      { "hour_offset": 6, "expected_rainfall_mm": 35.0, "projected_river_m": 4.8, "projected_risk": "CRITICAL" },
      { "hour_offset": 12, "expected_rainfall_mm": 18.0, "projected_river_m": 4.6, "projected_risk": "HIGH" },
      { "hour_offset": 24, "expected_rainfall_mm": 8.0, "projected_river_m": 3.9, "projected_risk": "MODERATE" }
    ]
  }
  ```
* **Frontend Handling:** In the Forecast View and Forecast Panel, the 6h/12h projected trend line uses linear regression extrapolation from recent 6h telemetry, while future numerical weather prediction cards display labeled placeholders: *"Numerical Weather Model Feed (NWP QPF) — Awaiting IMD GFS/WRF API Integration"*.

---

### Gap 3: Live Radar Reflectivity Tile Server (IMD Doppler WMS)
* **Current Limitation:** The GIS Leaflet map includes CARTO Dark, OpenTopoMap, and Esri Satellite imagery, but does not have a live WMS/WMTS tile overlay for IMD Doppler Weather Radar (DWR) precipitation reflectivity (dBZ).
* **Operational Need:** Visualizing live cloudburst storm cells and convective squall lines directly over mountainous river catchments.
* **Suggested Endpoint:** `GET /api/gis/tiles/radar/{z}/{x}/{y}.png` or an external OGC WMS URL.
* **Expected Shape:** Raster PNG tile or GeoJSON storm polygon vector stream.
* **Frontend Handling:** The "Radar Reflectivity (dBZ)" layer toggle in the GIS layer control panel is visibly disabled with a badge: *"Not available from current data source (OGC WMS feed planned)"*.

---

### Gap 4: Automated Dispatch & SMS/CAP Broadcast Integration
* **Current Limitation:** Emergency actions generate standard operating procedure (SOP) text based on MHA/NDMA guidelines, but cannot trigger direct Common Alerting Protocol (CAP) or SMS/siren hardware webhooks.
* **Operational Need:** Automated single-click dispatch to district authorities and state emergency operation centers (SEOC).
* **Suggested Endpoint:** `POST /api/alerts/{alert_id}/dispatch`
* **Expected Shape:**
  ```json
  {
    "alert_id": "ALT-20260906-001",
    "channels": ["SMS_CAP", "SIREN_RELAY", "EMAIL_SEOC"],
    "authorized_by": "COMMANDER-01",
    "status": "DISPATCHED"
  }
  ```
* **Frontend Handling:** The "Dispatch CAP Bulletin" action displays an informational advisory modal explaining that live external siren/SMS relays require MHA departmental authorization, allowing the operator to preview or print the official PDF/CSV bulletin instead.
