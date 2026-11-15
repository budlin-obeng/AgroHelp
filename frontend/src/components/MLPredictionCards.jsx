import React, { useState } from 'react';
import { 
  Award, TrendingUp, ShieldCheck, Droplets, Leaf, 
  ChevronDown, ChevronUp, CheckCircle, Info, Sparkles, 
  Cpu, ArrowRight, BarChart2 
} from 'lucide-react';

export default function MLPredictionCards({ predictions, isLoading, currentCrop, farmSizeHa }) {
  const [expandedIndex, setExpandedIndex] = useState(0); // first item expanded by default

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center min-h-[350px]">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-16 h-16 border-4 border-agro-200 border-t-agro-600 rounded-full animate-spin"></div>
          <Cpu className="w-6 h-6 text-agro-700 absolute" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Processing Space2Soil ML Model</h3>
        <p className="text-xs text-slate-500 max-w-sm text-center mt-1">
          Evaluating 10-year NASA climate records, soil texture interactions, and Fall Armyworm lifecycle models...
        </p>
      </div>
    );
  }

  const recommendations = predictions?.recommendations || [];
  const modelMeta = predictions?.model_metadata || {};

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <p className="text-slate-500 text-sm">No recommendations available for the selected profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              ML-Predicted Crop Rotations
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-agro-100 text-agro-800 border border-agro-200">
              {recommendations.length} Candidates Evaluated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimized for <span className="font-semibold text-slate-700">{predictions?.soil_type || 'Sandy Loam'}</span> &bull; 
            Prior standing crop: <span className="font-semibold text-slate-700">{currentCrop || 'Maize'}</span>
          </p>
        </div>

        {/* Model Indicator badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
          <Cpu className="w-3.5 h-3.5 text-agro-600" />
          <span>{modelMeta.model_type || 'Decadal Ensemble ML'}</span>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {recommendations.map((rec, index) => {
          const isTop = index === 0;
          const isExpanded = expandedIndex === index;
          const totalEstimatedIncome = rec.total_expected_margin_ghs || Math.round(rec.expected_gross_margin_ghs_ha * (farmSizeHa || 2));

          return (
            <div
              key={rec.crop_name}
              className={`rounded-2xl transition-all duration-200 overflow-hidden border ${
                isTop
                  ? 'bg-gradient-to-b from-agro-50/40 via-white to-white border-agro-300 shadow-md ring-1 ring-agro-200/60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Card Banner for #1 Rank */}
              {isTop && (
                <div className="bg-gradient-to-r from-agro-600 via-agro-700 to-agro-800 text-white px-4 py-1.5 flex items-center justify-between text-xs font-bold tracking-wide">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-300" />
                    <span>#1 TOP RECOMMENDED AGRO-ECOLOGICAL ROTATION</span>
                  </div>
                  <span className="text-[11px] text-agro-200 font-normal">
                    Optimal Pest Break & Profitability
                  </span>
                </div>
              )}

              {/* Main Card Summary Row */}
              <div
                onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Rank, Crop Name, Family */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm shrink-0 ${
                      isTop
                        ? 'bg-agro-600 text-white shadow-sm'
                        : index === 1
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    #{rec.rank || index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                        {rec.crop_name}
                      </h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {rec.crop_family}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 italic mt-0.5 font-serif">
                      {rec.scientific_name}
                    </p>
                  </div>
                </div>

                {/* Center / Right: Key KPI Badges & Score */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between md:justify-end">
                  {/* Suitability Score Gauge */}
                  <div className="text-left md:text-right">
                    <div className="flex items-center md:justify-end gap-1.5">
                      <span className="text-xs font-semibold text-slate-500">Suitability</span>
                      <span className="font-mono text-base font-black text-agro-700">
                        {rec.suitability_score}%
                      </span>
                    </div>
                    <div className="w-24 sm:w-28 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-agro-500 to-agro-600 rounded-full"
                        style={{ width: `${Math.min(100, rec.suitability_score)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Fertilizer Savings Pill */}
                  <div className="bg-agro-50 border border-agro-200 px-3 py-1.5 rounded-xl text-left">
                    <span className="text-[10px] font-bold text-agro-700 uppercase tracking-wider block flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-agro-600" />
                      Fertilizer Saved
                    </span>
                    <span className="font-mono font-bold text-agro-900 text-xs sm:text-sm">
                      {rec.fertilizer_reduction_pct}% N Cut
                    </span>
                  </div>

                  {/* FAW Disruption Pill */}
                  <div className="bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-left">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-rose-600" />
                      FAW Pest Break
                    </span>
                    <span className="font-mono font-bold text-rose-900 text-xs sm:text-sm">
                      {rec.faw_disruption_score}% Interruption
                    </span>
                  </div>

                  {/* Expand / Collapse Icon */}
                  <button
                    type="button"
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition self-center"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Deep Agronomic Detail Drawer */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-6 space-y-4 text-xs">
                  {/* Agronomic Guidance Banner */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Agronomic Implementation Guidance (Ejura District)
                    </h4>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      {rec.agronomic_guidance}
                    </p>
                  </div>

                  {/* Quantitative Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        Estimated Yield
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 block">
                        {rec.predicted_yield_tons_ha} tons / ha
                      </span>
                      <span className="text-[10px] text-slate-500">Based on Ejura rain index</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        Est. Gross Margin
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-sm mt-0.5 block">
                        GHS {rec.expected_gross_margin_ghs_ha.toLocaleString()} / ha
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        ~GHS {totalEstimatedIncome.toLocaleString()} for plot
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-sky-500" />
                        Drought Resilience
                      </span>
                      <span className="font-mono font-bold text-sky-800 text-sm mt-0.5 block">
                        {rec.drought_resilience_score} / 100
                      </span>
                      <span className="text-[10px] text-slate-500">SMAP calibrated tolerance</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        Labor Intensity
                      </span>
                      <span className="font-medium text-slate-800 text-xs mt-1 block">
                        {rec.labor_intensity}
                      </span>
                    </div>
                  </div>

                  {/* Ecological & Soil Benefits */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-agro-50/60 p-3 rounded-xl border border-agro-200">
                      <span className="font-bold text-agro-900 block text-[11px] mb-1">
                        Soil Health & Biomass Restoration
                      </span>
                      <p className="text-agro-800 text-xs">
                        {rec.soil_organic_matter_benefit}
                      </p>
                    </div>

                    <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200">
                      <span className="font-bold text-sky-900 block text-[11px] mb-1">
                        Seasonal Compatibility Window
                      </span>
                      <p className="text-sky-800 text-xs">
                        {rec.season_fit}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
