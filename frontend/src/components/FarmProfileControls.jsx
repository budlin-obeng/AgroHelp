import React, { useState } from 'react';
import { Sliders, Layers, DollarSign, ShieldAlert, Droplets, Leaf, Sparkles, HelpCircle } from 'lucide-react';

const PRESETS = [
  {
    name: 'FAW Pest Defense',
    icon: '🐛',
    desc: 'Break Fall Armyworm monoculture green-bridge',
    weights: { market: 0.15, fertilizer: 0.20, faw: 0.50, drought: 0.15 }
  },
  {
    name: 'Fertilizer Cost Cutting',
    icon: '💰',
    desc: 'Maximize biological N fixation, slash synthetic NPK',
    weights: { market: 0.20, fertilizer: 0.50, faw: 0.15, drought: 0.15 }
  },
  {
    name: 'Drought Resilience',
    icon: '☀️',
    desc: 'Endure mid-season dry spells and Harmattan heat',
    weights: { market: 0.15, fertilizer: 0.15, faw: 0.20, drought: 0.50 }
  },
  {
    name: 'Max Market Revenue',
    icon: '📈',
    desc: 'Target high-yield commercial cash crops for Ejura markets',
    weights: { market: 0.55, fertilizer: 0.20, faw: 0.15, drought: 0.10 }
  },
  {
    name: 'Balanced Regenerative',
    icon: '⚖️',
    desc: 'Balanced agronomic & economic portfolio',
    weights: { market: 0.25, fertilizer: 0.25, faw: 0.25, drought: 0.25 }
  }
];

export default function FarmProfileControls({ profile, onChange, onApplyPreset, isLoading }) {
  const [unitMode, setUnitMode] = useState('ha'); // 'ha' or 'acres'

  const handleWeightChange = (key, val) => {
    const num = parseFloat(val) / 100;
    onChange({ [key]: num });
  };

  const handleSizeChange = (val) => {
    const raw = parseFloat(val) || 1.0;
    const inHa = unitMode === 'acres' ? raw / 2.471 : raw;
    onChange({ farm_size_hectares: Math.max(0.2, parseFloat(inHa.toFixed(2))) });
  };

  const currentSizeDisplay = unitMode === 'acres' 
    ? (profile.farm_size_hectares * 2.471).toFixed(1) 
    : profile.farm_size_hectares.toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-agro-100 text-agro-700 rounded-xl">
            <Sliders className="w-5 h-5 text-agro-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Farm Profile & Priority Controls</h2>
            <p className="text-xs text-slate-500">Configure plot characteristics and simulate reactive ML trade-offs</p>
          </div>
        </div>
        {isLoading && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-agro-50 text-agro-700 border border-agro-200">
            <span className="w-1.5 h-1.5 rounded-full bg-agro-500 animate-ping"></span>
            Predicting...
          </span>
        )}
      </div>

      {/* Preset Strategy Buttons */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Farmer Goal Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onApplyPreset(preset.weights)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-agro-500 hover:bg-agro-50/50 text-left transition flex flex-col justify-between group shadow-2xs"
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-base">{preset.icon}</span>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-agro-700">Apply</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block group-hover:text-agro-900 leading-tight">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Farm Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        {/* Current Crop */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Current / Previous Crop
          </label>
          <select
            value={profile.current_crop}
            onChange={(e) => onChange({ current_crop: e.target.value })}
            className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
          >
            <option value="Maize">Maize (Zea mays) - High Monoculture</option>
            <option value="Cassava">Cassava (Manihot esculenta)</option>
            <option value="Yam">Yam (Dioscorea rotundata)</option>
            <option value="Rice">Rice (Lowland Paddy)</option>
            <option value="Cowpea">Cowpea (Vigna unguiculata)</option>
            <option value="Groundnut">Groundnut / Peanut</option>
            <option value="Sorghum">Sorghum (Sorghum bicolor)</option>
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">Continuous maize triggers FAW surge</span>
        </div>

        {/* Soil Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Soil Texture / Series
          </label>
          <select
            value={profile.soil_type}
            onChange={(e) => onChange({ soil_type: e.target.value })}
            className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
          >
            <option value="Sandy Loam">Sandy Loam (Ejura Savannah Ochrosol)</option>
            <option value="Ferric Luvisol">Ferric Luvisol (Ironpan Subsoil)</option>
            <option value="Clay Loam">Clay Loam (Alluvial River Valley)</option>
            <option value="Sandy Clay Loam">Sandy Clay Loam (Transition Plateau)</option>
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">Ejura mean pH ~6.2; cation retention mod.</span>
        </div>

        {/* Farm Size */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Farm Plot Size</label>
            <div className="inline-flex rounded text-[10px] font-bold border border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setUnitMode('ha')}
                className={`px-1.5 py-0.5 rounded-l ${unitMode === 'ha' ? 'bg-agro-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Ha
              </button>
              <button
                type="button"
                onClick={() => setUnitMode('acres')}
                className={`px-1.5 py-0.5 rounded-r ${unitMode === 'acres' ? 'bg-agro-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Acres
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              value={currentSizeDisplay}
              onChange={(e) => handleSizeChange(e.target.value)}
              className="w-24 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
            />
            <span className="text-xs text-slate-500 font-medium">
              {unitMode === 'ha' ? 'Hectares (~' + (profile.farm_size_hectares * 2.471).toFixed(1) + ' ac)' : 'Acres (~' + profile.farm_size_hectares.toFixed(1) + ' ha)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Typical smallholder: 1.5 - 4.0 ha</span>
        </div>

        {/* Target Season */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target Planting Season
          </label>
          <select
            value={profile.target_season}
            onChange={(e) => onChange({ target_season: e.target.value })}
            className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-agro-500"
          >
            <option value="Major Rainy Season">Major Rainy Season (March - July)</option>
            <option value="Minor Rainy Season">Minor Rainy Season (Sept - Nov)</option>
            <option value="Dry Harmattan Season">Dry Harmattan Season (Dec - Feb)</option>
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block">Bimodal rainfall pattern in Ejura</span>
        </div>
      </div>

      {/* Reactive Farmer Priority Sliders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-agro-600" />
            Reactive Optimization Sliders (Adjust to re-rank ML models)
          </label>
          <span className="text-[11px] text-slate-400">Total Weight: {Math.round((profile.market_priority + profile.fertilizer_savings_priority + profile.faw_disruption_priority + profile.drought_resilience_priority) * 100)}%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Market Income Slider */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Market Income & Gross Margin
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {Math.round(profile.market_priority * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(profile.market_priority * 100)}
              onChange={(e) => handleWeightChange('market_priority', e.target.value)}
              className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Prioritizes high market demand, wholesale cash return, and market price stability in Ashanti Region.
            </p>
          </div>

          {/* Fertilizer Savings Slider */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-agro-600" />
                Fertilizer Cost Savings (Biological N Fixation)
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-agro-50 text-agro-700 border border-agro-200">
                {Math.round(profile.fertilizer_savings_priority * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(profile.fertilizer_savings_priority * 100)}
              onChange={(e) => handleWeightChange('fertilizer_savings_priority', e.target.value)}
              className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Favors nodulating legumes that fix 40-70 kg N/ha, slashing synthetic NPK bag expenditures.
            </p>
          </div>

          {/* Fall Armyworm Disruption Slider */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Fall Armyworm (FAW) Cycle Break
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                {Math.round(profile.faw_disruption_priority * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(profile.faw_disruption_priority * 100)}
              onChange={(e) => handleWeightChange('faw_disruption_priority', e.target.value)}
              className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Selects non-host broadleaf crops that break Spodoptera frugiperda larval pupation cycles.
            </p>
          </div>

          {/* Drought Resilience Slider */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-600" />
                Drought Resilience & Water Efficiency
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                {Math.round(profile.drought_resilience_priority * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(profile.drought_resilience_priority * 100)}
              onChange={(e) => handleWeightChange('drought_resilience_priority', e.target.value)}
              className="w-full h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Calibrated against NASA SMAP root-zone moisture deficits and GPM dry spells.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
