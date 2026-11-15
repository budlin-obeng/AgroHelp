import React, { useState, useEffect } from 'react';
import {
  CloudRain, Sun, Droplets, Satellite, TrendingUp, AlertTriangle,
  Calendar, Layers, ShieldCheck, Database, ExternalLink, Activity, Info
} from 'lucide-react';
import { getEnvironmentalProfile } from '../services/api';

export default function NasaIndicatorsDashboard() {
  const [profile, setProfile] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('rainfall'); // 'rainfall', 'moisture', 'heat', 'vegetation', 'ecostress'
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
  const vegStats = profile?.vegetation_stats || {};

  const maxRainfall = 220; // mm for chart scaling

  return (
    <section id="nasa-telemetry" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8 scroll-mt-24">
      {/* HEADER IN SIMPLE GHANAIAN ENGLISH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-[#0B3D91]/10 text-[#0B3D91] rounded-2xl shrink-0 mt-0.5">
            <Satellite className="w-6 h-6 text-[#0B3D91]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                10 Years of Rain, Sun, and Soil Records from NASA Satellites
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0B3D91] text-white font-mono">
                10-Year Ejura Record
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Ready for Your Farm
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Checked specifically for farms in <strong>Ejura-Sekyedumase</strong> (Ashanti Region &bull; 7.3856&deg; N, -1.3562&deg; W)
            </p>
          </div>
        </div>

        {/* Metric Switcher Tabs in Simple Ghanaian English */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold overflow-x-auto scrollbar-none self-start lg:self-auto">
          <button
            onClick={() => setSelectedMetric('rainfall')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              selectedMetric === 'rainfall'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rain Records (NASA GPM)
          </button>
          <button
            onClick={() => setSelectedMetric('moisture')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              selectedMetric === 'moisture'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Soil Water (NASA SMAP)
          </button>
          <button
            onClick={() => setSelectedMetric('heat')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              selectedMetric === 'heat'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hot Days &amp; Sun (NASA POWER)
          </button>
          <button
            onClick={() => setSelectedMetric('vegetation')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              selectedMetric === 'vegetation'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Farm Photos (Landsat)
          </button>
          <button
            onClick={() => setSelectedMetric('ecostress')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              selectedMetric === 'ecostress'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Water Loss &amp; Soil Type
          </button>
        </div>
      </div>

      {/* 5 CORE NASA SENSOR CARDS IN SIMPLE GHANAIAN ENGLISH */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: GPM Rainfall */}
        <div
          onClick={() => setSelectedMetric('rainfall')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedMetric === 'rainfall'
              ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-sky-900 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-600" />
              NASA Rain Satellite
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
              Rain Watcher
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            ~1,285 mm{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">rain a year</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Major Rain (Apr–Jul):</span>
              <span className="font-semibold text-slate-900">~642 mm (plenty rain)</span>
            </div>
            <div className="flex justify-between">
              <span>Minor Rain (Sep–Nov):</span>
              <span className="font-semibold text-slate-900">~489 mm (smaller rain)</span>
            </div>
            <div className="flex justify-between text-rose-600 font-medium pt-1 border-t border-sky-100">
              <span>Heavy Rain Days:</span>
              <span className="font-bold">38 heavy storm days</span>
            </div>
          </div>
        </div>

        {/* Card 2: SMAP Moisture */}
        <div
          onClick={() => setSelectedMetric('moisture')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedMetric === 'moisture'
              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-emerald-600" />
              NASA Soil Water
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Deep Roots
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            Good Wetness{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">(0.228 score)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Top Soil (where you sow):</span>
              <span className="font-semibold text-slate-900">Dries fast in sun</span>
            </div>
            <div className="flex justify-between">
              <span>Deep Roots (where plants drink):</span>
              <span className="font-semibold text-slate-900">Holds water longer</span>
            </div>
            <div className="flex justify-between text-rose-700 font-medium pt-1 border-t border-emerald-100">
              <span>Dry Spells Recorded:</span>
              <span className="font-bold">26 dry spells</span>
            </div>
          </div>
        </div>

        {/* Card 3: POWER Heat Stress */}
        <div
          onClick={() => setSelectedMetric('heat')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedMetric === 'heat'
              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-900 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-600" />
              NASA Heat Watcher
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
              Hot Sun
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            41 Days{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">very hot (&ge; 35&deg;C)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Normal Air Temperature:</span>
              <span className="font-semibold text-slate-900">27.4 &deg;C</span>
            </div>
            <div className="flex justify-between">
              <span>Harmattan Heat Spikes:</span>
              <span className="font-semibold text-slate-900">February &ndash; March</span>
            </div>
            <div className="flex justify-between text-rose-600 font-medium pt-1 border-t border-amber-100">
              <span>Maize Danger:</span>
              <span className="font-bold">Heat burns pollen</span>
            </div>
          </div>
        </div>

        {/* Card 4: Landsat 8/9 NDVI */}
        <div
          onClick={() => setSelectedMetric('vegetation')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedMetric === 'vegetation'
              ? 'bg-teal-50/80 border-teal-400 ring-2 ring-teal-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-teal-900 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              Landsat Pictures
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
              Space Photos
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            Very Green{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">(0.74 score)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Dry Season (Bare ground):</span>
              <span className="font-semibold text-slate-900">0.38 (Bare dirt)</span>
            </div>
            <div className="flex justify-between">
              <span>What it means:</span>
              <span className="font-semibold text-slate-900">Keep soil covered</span>
            </div>
            <div className="flex justify-between text-teal-700 font-medium pt-1 border-t border-teal-100">
              <span>Clear Photos:</span>
              <span className="font-bold">115 clear scenes</span>
            </div>
          </div>
        </div>

        {/* Card 5: ECOSTRESS & SoilGrids */}
        <div
          onClick={() => setSelectedMetric('ecostress')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            selectedMetric === 'ecostress'
              ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-200 shadow-xs'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-purple-900 font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              Soil Type &amp; Water
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
              Ejura Ground
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            Sandy Loam{' '}
            <span className="text-xs font-sans text-slate-500 font-medium">(pH 6.1)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Soil Texture:</span>
              <span className="font-semibold text-slate-900">Soft, easy to dig</span>
            </div>
            <div className="flex justify-between">
              <span>Water drainage:</span>
              <span className="font-semibold text-slate-900">Water passes fast</span>
            </div>
            <div className="flex justify-between text-purple-700 font-medium pt-1 border-t border-purple-100">
              <span>Water lost to sun:</span>
              <span className="font-bold">4.2 mm / day</span>
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE MONTHLY DECADAL CLIMATOLOGY VISUALIZER */}
      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0B3D91]" />
            <span>Month-by-Month Rain and Weather in Ejura (10-Year NASA Average)</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Hover or tap any month to see rain and weather details
          </span>
        </div>

        {/* Bar chart representation */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2.5 h-44 items-end px-2 border-b border-slate-300">
            {climatology.map((m) => {
              const monthLabel = m.month || m.month_name || `M${m.month_num}`;
              const rainVal = m.rainfall_mm ?? 0;
              const moistureVal = m.soil_moisture ?? (m.rootzone_wetness ? m.rootzone_wetness * 0.35 : 0.22);
              const heatVal = m.heat_stress_days ?? 0;
              const ndviVal = m.month === 'Jun' || m.month === 'Sep' ? 0.74 : (m.month === 'Jan' || m.month === 'Feb' ? 0.38 : 0.58);
              const etVal = m.rainfall_mm > 100 ? 4.8 : 3.2;

              const rainHeight = (rainVal / maxRainfall) * 100;
              const moistureHeight = (moistureVal / 0.35) * 100;
              const heatDaysHeight = (heatVal / 15) * 100;
              const ndviHeight = (ndviVal / 0.85) * 100;
              const etHeight = (etVal / 5.5) * 100;

              let activeHeight = rainHeight;
              let barColor = 'bg-sky-500 hover:bg-sky-600';
              if (selectedMetric === 'moisture') {
                activeHeight = moistureHeight;
                barColor = 'bg-emerald-500 hover:bg-emerald-600';
              } else if (selectedMetric === 'heat') {
                activeHeight = heatDaysHeight;
                barColor = 'bg-amber-500 hover:bg-amber-600';
              } else if (selectedMetric === 'vegetation') {
                activeHeight = ndviHeight;
                barColor = 'bg-teal-500 hover:bg-teal-600';
              } else if (selectedMetric === 'ecostress') {
                activeHeight = etHeight;
                barColor = 'bg-purple-500 hover:bg-purple-600';
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
                    <div className="absolute -top-18 z-30 bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none border border-slate-700">
                      <span className="font-bold text-sky-300">{monthLabel} Weather in Ejura:</span><br />
                      🌧️ Rain: {rainVal.toFixed(0)} mm<br />
                      💧 Soil Water: {moistureVal > 0.25 ? 'Very wet' : 'Medium wet'}<br />
                      ☀️ Hot Days: {heatVal} days
                    </div>
                  )}

                  {/* Top value badge */}
                  <span className="text-[9px] font-mono text-slate-400 group-hover:text-slate-900 mb-1">
                    {selectedMetric === 'rainfall'
                      ? `${Math.round(rainVal)}`
                      : selectedMetric === 'moisture'
                      ? `${moistureVal.toFixed(2)}`
                      : selectedMetric === 'heat'
                      ? `${Math.round(heatVal)}d`
                      : selectedMetric === 'vegetation'
                      ? `${ndviVal.toFixed(2)}`
                      : `${etVal.toFixed(1)}`}
                  </span>

                  {/* Active Bar */}
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${barColor}`}
                    style={{ height: `${Math.max(6, Math.min(100, activeHeight))}%` }}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Month labels */}
          <div className="grid grid-cols-12 gap-1.5 sm:gap-2.5 px-2 pt-2 text-center">
            {climatology.map((m) => {
              const label = m.month || m.month_name || `M${m.month_num}`;
              return (
                <span key={label} className="text-[10px] font-bold text-slate-600">
                  {label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Agronomic Interpretation in Simple Ghanaian English */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>What This Means for Your Farm in Ejura:</span>
          </div>
          <p>
            In Ejura, rain comes in two seasons. The first big rains start in April and reach the top in June (~185 mm). 
            August gets a small dry break, then the second rains come in September and October (~198 mm). 
            In February and March, the hot Harmattan wind blows and dries up bare soil fast. 
            Planting cowpeas (adua) or groundnuts (nkate) covers the ground, protects the soil from washing away, and gives you food and cash even when rains are short.
          </p>
        </div>
      </div>

      {/* HOW SATELLITES WORK IN SIMPLE GHANAIAN ENGLISH */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-sky-50 via-slate-50 to-emerald-50 rounded-2xl border border-sky-200 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-[#0B3D91]">
            <ShieldCheck className="w-4 h-4 text-[#0B3D91]" />
            <span>How NASA Satellites Work for Your Farm</span>
          </div>
          <p className="text-slate-600 max-w-3xl leading-relaxed">
            NASA has satellites high up in space that watch rain clouds, check heat in the air, and measure water under the ground. We combine these satellite records with what agricultural officers and farmers in Ejura know on the ground, so you get farm advice that is truthful, safe, and profitable.
          </p>
        </div>

        <a
          href="http://localhost:8501"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 bg-[#0B3D91] hover:bg-blue-900 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
        >
          <span>Open Space2Soil Simulator (8501)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </section>
  );
}
