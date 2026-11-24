import React from 'react';
import { 
  ShieldAlert, 
  Award, 
  Building2, 
  Users, 
  Cpu, 
  Database, 
  Radio, 
  CheckCircle2, 
  Layers,
  ArrowUpRight,
  Sparkles,
  GitBranch,
  FileText
} from 'lucide-react';

export default function AboutSIH() {
  const highlights = [
    {
      title: "Multi-Source Data Fusion Core",
      desc: "Unlike single-parameter weather alerts, this system unifies 4 distinct physical domains: atmospheric rainfall (IMD), soil moisture saturation (ISRO/SAC), river gauge telemetry (CWC), and 30m CartoDEM elevation & slopes (NRSC Bhuvan)."
    },
    {
      title: "Physics-Calibrated Machine Learning",
      desc: "Powered by an ensemble Random Forest regressor with physics-informed feature engineering (Soil Saturation Index, Runoff Potential Factor, and River Stage Headroom), achieving 0.985 R² score and sub-15ms inference latency."
    },
    {
      title: "Interactive GIS Decision Support",
      desc: "Built with Leaflet.js and responsive Recharts to give disaster response magistrates (NDMA, DDMA, SDRF) actionable 24h hazard progression timelines, automated siren criteria, and evacuation SOP advisories."
    },
    {
      title: "Production Integration Ready",
      desc: "Designed with standardized REST APIs, GeoJSON spatial representations, and modular data adapters ready for live telemetry linkage with IMD AWS grids, CWC hydrographs, and IoT edge mountain sensors."
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* SIH 2026 Official Identity Banner */}
      <div className="bg-gradient-to-r from-command-darker via-command-card to-command-darker border border-command-border rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-command-border/60 pb-3">
          <div className="flex items-center space-x-2 font-mono text-xs text-amber-400">
            <Award className="w-4 h-4" />
            <span>SMART INDIA HACKATHON 2026 &bull; PROTOTYPE DEMO</span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-blue-900/60 text-blue-300 font-mono text-xs border border-blue-700">
            PS ID: SIH26192
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">
            AI-Based Flash Flood Early Warning System for Hilly Regions
          </h1>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            A comprehensive multi-source data fusion and machine learning decision-support platform designed to protect vulnerable Himalayan and North-Eastern mountainous communities from catastrophic flash flood events.
          </p>
        </div>

        {/* Hackathon Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="bg-command-darkest/70 p-3 rounded-lg border border-command-border">
            <div className="text-slate-400 text-[10px]">Theme</div>
            <div className="text-emerald-400 font-bold">Disaster Management</div>
          </div>
          <div className="bg-command-darkest/70 p-3 rounded-lg border border-command-border">
            <div className="text-slate-400 text-[10px]">Category</div>
            <div className="text-blue-400 font-bold">Software Edition</div>
          </div>
          <div className="bg-command-darkest/70 p-3 rounded-lg border border-command-border">
            <div className="text-slate-400 text-[10px]">Nodal Ministry</div>
            <div className="text-amber-400 font-bold">Ministry of Home Affairs (MHA)</div>
          </div>
          <div className="bg-command-darkest/70 p-3 rounded-lg border border-command-border">
            <div className="text-slate-400 text-[10px]">Team Name</div>
            <div className="text-purple-400 font-bold">DeepCoders</div>
          </div>
        </div>
      </div>

      {/* Key Innovation Highlights */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Core Innovations & Technical Differentiators</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.map((item, idx) => (
            <div key={idx} className="bg-command-darker border border-command-border rounded-xl p-5 shadow-xl space-y-2">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture & Tech Stack Breakdown */}
      <div className="bg-command-darker border border-command-border rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Technology Stack</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-command-card/60 p-4 rounded-lg border border-command-border space-y-2">
            <div className="font-bold text-blue-400 text-sm">Frontend Layer</div>
            <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
              <li>&bull; React 18 (Vite Bundler)</li>
              <li>&bull; Leaflet.js & React-Leaflet GIS</li>
              <li>&bull; Recharts Data Analytics</li>
              <li>&bull; Tailwind CSS Modern Tactical Theme</li>
              <li>&bull; Lucide React Tactical Icons</li>
            </ul>
          </div>

          <div className="bg-command-card/60 p-4 rounded-lg border border-command-border space-y-2">
            <div className="font-bold text-indigo-400 text-sm">Backend Services</div>
            <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
              <li>&bull; Python 3.14 + FastAPI</li>
              <li>&bull; Uvicorn High-Concurrency ASGI</li>
              <li>&bull; Pydantic v2 Type Validation</li>
              <li>&bull; RESTful Endpoints & CORS</li>
              <li>&bull; In-Memory & File Persistence</li>
            </ul>
          </div>

          <div className="bg-command-card/60 p-4 rounded-lg border border-command-border space-y-2">
            <div className="font-bold text-emerald-400 text-sm">ML & Data Fusion</div>
            <ul className="text-slate-300 space-y-1 font-mono text-[11px]">
              <li>&bull; Scikit-Learn Random Forest</li>
              <li>&bull; NumPy & Pandas Transformations</li>
              <li>&bull; Soil Saturation Indexing (SSI)</li>
              <li>&bull; Hydrological Runoff Modeling</li>
              <li>&bull; SHAP-Style Feature Attribution</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Target Deployment Regions */}
      <div className="bg-command-darker border border-command-border rounded-xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
          <Radio className="w-4 h-4 text-amber-400" />
          <span>Priority Operational Himalayan & North-Eastern Corridors</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Calibrated across 12 high-vulnerability river basins: <strong>Alaknanda & Bhagirathi</strong> (Uttarakhand), <strong>Beas & Sutlej</strong> (Himachal Pradesh), <strong>Teesta Basin</strong> (Sikkim), <strong>Jatinga & Kopili</strong> (Assam), <strong>Tawang Chu</strong> (Arunachal Pradesh), <strong>Southern Escarpment Gorges</strong> (Meghalaya), and <strong>Kabini Catchment</strong> (Western Ghats).
        </p>
      </div>
    </div>
  );
}
