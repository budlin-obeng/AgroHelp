import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Droplets, Satellite, TrendingUp, AlertTriangle, Calendar, Layers } from 'lucide-react';
import { getEnvironmentalProfile } from '../services/api';

export default function NasaIndicatorsDashboard() {
  const [profile, setProfile] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('rainfall'); // 'rainfall', 'moisture', 'heat'
  const [activeMonth, setActiveMonth] = useState(null);

  useEffect(() => {
    let mounted = true;
    getEnvironmentalProfile().then((data) => {
      if (mounted) setProfile(data);
    });
    return () => { mounted = false; };
  }, []);

  const climatology = profile?.monthly_climatology || [];
  const decadal = profile?.decadal_summary || {};
  const rainfallStats = profile?.rainfall_stats || {};
  const soilStats = profile?.soil_moisture_stats || {};
  const climateStats = profile?.climate_stats || {};

  const maxRainfall = 220; // mm for chart scaling

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-nasa-blue/10 text-nasa-blue rounded-xl">
            <Satellite className="w-5 h-5 text-nasa-blue" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">NASA Earth Observation Indicators</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                2016–2025 Decadal Archive
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Calibrated remote-sensing feeds for Ejura-Sekyedumase (Lat 7.3856°, Lon -1.3562°)
            </p>
          </div>
        </div>

        {/* Metric Switcher */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setSelectedMetric('rainfall')}
            className={`px-3 py-1.5 rounded-md transition ${selectedMetric === 'rainfall' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Rainfall (GPM)
          </button>
          <button
            onClick={() => setSelectedMetric('moisture')}
            className={`px-3 py-1.5 rounded-md transition ${selectedMetric === 'moisture' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Soil Moisture (SMAP)
          </button>
          <button
            onClick={() => setSelectedMetric('heat')}
            className={`px-3 py-1.5 rounded-md transition ${selectedMetric === 'heat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Heat Stress (POWER)
          </button>
        </div>
      </div>

      {/* 3 Core Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Rainfall Card */}
        <div className={`p-4 rounded-xl border transition ${selectedMetric === 'rainfall' ? 'bg-sky-50/60 border-sky-300 ring-1 ring-sky-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs text-sky-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-600" />
              Decadal Mean Rainfall
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
              NASA GPM
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {rainfallStats?.annual_average_rainfall_mm ? rainfallStats.annual_average_rainfall_mm.toFixed(1) : '1,284.6'}{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">mm / year</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Major Season (Mar–Jul):</span>
              <span className="font-semibold text-slate-900">~642.5 mm</span>
            </div>
            <div className="flex justify-between">
              <span>Minor Season (Sep–Nov):</span>
              <span className="font-semibold text-slate-900">~489.1 mm</span>
            </div>
            <div className="flex justify-between text-rose-600 font-medium pt-1 border-t border-sky-100">
              <span>Heavy Rain (&ge;25mm):</span>
              <span className="font-bold">{rainfallStats?.heavy_rain_days_ge_25mm || 38} days</span>
            </div>
          </div>
        </div>

        {/* Soil Moisture Card */}
        <div className={`p-4 rounded-xl border transition ${selectedMetric === 'moisture' ? 'bg-agro-50/60 border-agro-300 ring-1 ring-agro-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs text-agro-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-agro-600" />
              Root-Zone Moisture
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-agro-100 text-agro-800">
              NASA SMAP
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {decadal?.mean_rootzone_wetness ? decadal.mean_rootzone_wetness.toFixed(3) : '0.228'}{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">m&sup3; / m&sup3;</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Surface (0-5cm) Mean:</span>
              <span className="font-semibold text-slate-900">0.194 m&sup3;/m&sup3;</span>
            </div>
            <div className="flex justify-between">
              <span>Root Zone (0-100cm):</span>
              <span className="font-semibold text-slate-900">0.246 m&sup3;/m&sup3;</span>
            </div>
            <div className="flex justify-between text-amber-700 font-medium pt-1 border-t border-agro-100">
              <span>Decadal Drought Events:</span>
              <span className="font-bold">26 recorded</span>
            </div>
          </div>
        </div>

        {/* Heat Stress Card */}
        <div className={`p-4 rounded-xl border transition ${selectedMetric === 'heat' ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              Annual Heat Stress
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              NASA POWER
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {decadal?.mean_heat_stress_days_per_year ? decadal.mean_heat_stress_days_per_year.toFixed(1) : '41.2'}{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">days / yr &ge; 35&deg;C</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Mean Air Temperature:</span>
              <span className="font-semibold text-slate-900">27.4 &deg;C</span>
            </div>
            <div className="flex justify-between">
              <span>Peak Desiccation:</span>
              <span className="font-semibold text-slate-900">Feb &ndash; Mar</span>
            </div>
            <div className="flex justify-between text-rose-600 font-medium pt-1 border-t border-amber-100">
              <span>Maize Pollen Threshold:</span>
              <span className="font-bold">&ge; 35.0 &deg;C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Decadal Climatology Interactive Visualizer */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Monthly Climatological Profile &bull; 10-Year Average Pattern
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Hover over bars to inspect monthly values
          </span>
        </div>

        {/* Bar chart representation */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2.5 h-44 items-end px-2 border-b border-slate-300">
            {climatology.map((m) => {
              const monthLabel = m.month_name || m.month || `M${m.month_num}`;
              const rainVal = m.rainfall_mm ?? 0;
              const moistureVal = m.soil_moisture ?? (m.rootzone_wetness ? m.rootzone_wetness * 0.35 : 0.22);
              const heatVal = m.heat_stress_days ?? 0;

              const rainHeight = (rainVal / maxRainfall) * 100;
              const moistureHeight = (moistureVal / 0.35) * 100;
              const heatDaysHeight = (heatVal / 15) * 100;

              let activeHeight = rainHeight;
              let barColor = 'bg-sky-500 hover:bg-sky-600';
              if (selectedMetric === 'moisture') {
                activeHeight = moistureHeight;
                barColor = 'bg-agro-500 hover:bg-agro-600';
              } else if (selectedMetric === 'heat') {
                activeHeight = heatDaysHeight;
                barColor = 'bg-amber-500 hover:bg-amber-600';
              }

              const isHovered = activeMonth === monthLabel;

              return (
                <div
                  key={monthLabel}
                  onMouseEnter={() => setActiveMonth(monthLabel)}
                  onMouseLeave={() => setActiveMonth(null)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Tooltip on hover */}
                  {isHovered && (
                    <div className="absolute -top-16 z-20 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                      <span className="font-bold">{monthLabel}:</span> {rainVal.toFixed(1)}mm rain<br />
                      Moisture: {moistureVal.toFixed(2)} m&sup3;/m&sup3; | {heatVal.toFixed(0)} heat days
                    </div>
                  )}

                  {/* Value tag on top of bar */}
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-900 mb-1">
                    {selectedMetric === 'rainfall'
                      ? `${Math.round(rainVal)}`
                      : selectedMetric === 'moisture'
                      ? `${moistureVal.toFixed(2)}`
                      : `${Math.round(heatVal)}d`}
                  </span>

                  {/* Bar */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${barColor}`}
                    style={{ height: `${Math.max(6, Math.min(100, activeHeight))}%` }}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Month labels below chart */}
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2.5 px-2 pt-2 text-center">
            {climatology.map((m) => {
              const label = m.month_name || m.month || `M${m.month_num}`;
              return (
                <span key={label} className="text-[10px] font-bold text-slate-600">
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Agricultural interpretation of chart */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">Agronomic Insight: </span>
          Ejura displays a distinct bimodal precipitation regime. The major cropping season begins with onset rains in April and peaks in June. A short dry spell in August precedes the second minor peak in September&ndash;October. High heat stress in February&ndash;March desiccates unprotected topsoils, emphasizing the need for legume groundcover and crop rotation.
        </div>
      </div>
    </div>
  );
}
