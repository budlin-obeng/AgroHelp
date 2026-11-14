import React, { useState } from 'react';
import { Sprout, Satellite, Activity, ShieldCheck, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

export default function Header({ pipelineStatus = 'online', onRefresh, isRefreshing = false }) {
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          {/* Logo & Project Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-agro-600 via-agro-700 to-agro-900 text-white shadow-md shadow-agro-600/20">
              <Sprout className="w-6 h-6 text-emerald-300" />
              <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-nasa-blue text-white ring-2 ring-white">
                <Satellite className="w-3.5 h-3.5 text-blue-200" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Agro<span className="text-agro-600">Help</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-agro-100 text-agro-800 border border-agro-200">
                  Space2Soil Engine
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-nasa-blue/10 text-nasa-blue border border-nasa-blue/20">
                  NASA Space Apps
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden md:block">
                AI & Earth Observation Rotation Intelligence for Smallholders &bull; Ejura-Sekyedumase Pilot
              </p>
            </div>
          </div>

          {/* Right Toolbar: Pipeline Status & Space Apps tag */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Space2Soil Data Pipeline Status Pill */}
            <button
              onClick={() => setShowStatusModal(!showStatusModal)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 transition shadow-xs"
              title="Click to view Space2Soil NASA telemetry status"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-800 hidden sm:inline">Space2Soil Pipeline:</span>
              <span className="font-bold text-emerald-700">Decadal Sync (10-Yr)</span>
              <Activity className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ml-0.5" />
            </button>

            {/* Manual Refresh / Re-simulate Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 text-slate-600 hover:text-agro-700 hover:bg-agro-50 rounded-xl border border-slate-200 transition disabled:opacity-50"
                title="Recalculate Predictions"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-agro-600' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* NASA Pipeline Details Dropdown / Modal */}
      {showStatusModal && (
        <div className="bg-slate-900 text-white border-b border-slate-800 px-4 py-4 sm:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Space2Soil NASA Satellite Ingestion Pipeline &bull; Ejura District Telemetry
                </h4>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-slate-800"
              >
                Close &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                  <span>NASA POWER Climatology</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Daily Tmax, Tmin, RH, Diurnal Range (2016–2025)</p>
                <div className="mt-1.5 text-[10px] text-slate-300 font-mono">Records: 3,652 days verified</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                  <span>NASA GPM IMERG v07</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Rainfall totals, dry spell tracking, extreme storm flags</p>
                <div className="mt-1.5 text-[10px] text-slate-300 font-mono">Mean: 1,284.6 mm/yr</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                  <span>NASA SMAP L3/L4</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Surface (0-5cm) & Root-zone volumetric soil moisture</p>
                <div className="mt-1.5 text-[10px] text-slate-300 font-mono">Calibrated to Savannah Ochrosol</div>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                  <span>NASA/USGS Landsat 8/9</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Multispectral NDVI, NDRE, NDWI 10-year vegetation trends</p>
                <div className="mt-1.5 text-[10px] text-slate-300 font-mono">30-meter resolution grid</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
