import React from 'react';
import KpiRow from './KpiRow';
import HydroChartCard from './HydroChartCard';
import RegionalRiskAnalysisCard from './RegionalRiskAnalysisCard';
import RegionsRiskTable from './RegionsRiskTable';
import ForecastAndActionsPanel from './ForecastAndActionsPanel';

export default function DashboardView({
  regions = [],
  selectedRegion,
  onSelectRegion,
  overview = {},
  mlInfo = {}
}) {
  return (
    <div className="space-y-4">
      {/* 1. Row of 4 Equal KPI Cards */}
      <section aria-label="Key Performance Indicators">
        <KpiRow selectedRegion={selectedRegion} />
      </section>

      {/* 2. Middle Row: Hydro Chart (2/3) + Regional Risk Analysis (1/3) */}
      <section 
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch"
        aria-label="Hydrological Telemetry and Risk Factors"
      >
        <div className="lg:col-span-2">
          <HydroChartCard selectedRegion={selectedRegion} />
        </div>
        <div className="lg:col-span-1">
          <RegionalRiskAnalysisCard selectedRegion={selectedRegion} mlInfo={mlInfo} />
        </div>
      </section>

      {/* 3. Bottom Row: Risk Across Regions Table (2/3) + Forecast & Actions (1/3) */}
      <section 
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch"
        aria-label="Regional Risk Table and Forecast Actions"
      >
        <div className="lg:col-span-2">
          <RegionsRiskTable 
            regions={regions}
            selectedRegion={selectedRegion}
            onSelectRegion={onSelectRegion}
          />
        </div>
        <div className="lg:col-span-1">
          <ForecastAndActionsPanel selectedRegion={selectedRegion} />
        </div>
      </section>
    </div>
  );
}
