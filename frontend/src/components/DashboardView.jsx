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
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Four Core Telemetry KPI Cards */}
      <section aria-label="Key Hydrological Performance Indicators">
        <KpiRow selectedRegion={selectedRegion} />
      </section>

      {/* 2. Middle Row: Hydrograph Telemetry (2/3) + Regional Risk Analysis (1/3) */}
      <section 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
        aria-label="Hydrological Telemetry and Risk Factors"
      >
        <div className="lg:col-span-2">
          <HydroChartCard selectedRegion={selectedRegion} />
        </div>
        <div className="lg:col-span-1">
          <RegionalRiskAnalysisCard selectedRegion={selectedRegion} mlInfo={mlInfo} />
        </div>
      </section>

      {/* 3. Bottom Row: Catchment Vulnerability Table (2/3) + Forecast Outlook & SOP (1/3) */}
      <section 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch"
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
