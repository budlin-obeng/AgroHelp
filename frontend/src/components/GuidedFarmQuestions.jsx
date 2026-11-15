import React from 'react';
import { CheckCircle2, ChevronRight, Sparkles, HelpCircle, Minus, Plus } from 'lucide-react';
import { CropImage, SoilImage, GoalImage } from './CropVisuals';

const CROPS = [
  {
    id: 'Maize',
    name: 'Maize / Corn',
    localName: 'Aburo',
    desc: 'Most common field crop in Ejura belt',
    imageKey: 'maize',
  },
  {
    id: 'Cassava',
    name: 'Cassava',
    localName: 'Bankye',
    desc: 'Deep roots, hardy against dry weather',
    imageKey: 'cassava',
  },
  {
    id: 'Yam',
    name: 'Yam',
    localName: 'Bayer',
    desc: 'Climbing vines and mounded tubers',
    imageKey: 'yam',
  },
  {
    id: 'Rice',
    name: 'Rice',
    localName: 'Emo',
    desc: 'Paddy grain in moist valley soils',
    imageKey: 'rice',
  },
  {
    id: 'Cowpea',
    name: 'Cowpea / Beans',
    localName: 'Adua',
    desc: 'Fast-growing legume pods',
    imageKey: 'cowpea',
  },
  {
    id: 'Groundnut',
    name: 'Groundnut / Peanuts',
    localName: 'Nkate',
    desc: 'Underground pods & lush ground cover',
    imageKey: 'groundnut',
  },
];

const PRIORITIES = [
  {
    id: 'income',
    title: 'Make good income',
    desc: 'Earn high cash at Ejura and Kumasi markets',
    goalKey: 'income',
    badge: 'High Cash',
    weights: { market: 0.70, fertilizer: 0.10, faw: 0.10, drought: 0.10 },
  },
  {
    id: 'fertilizer',
    title: 'Save money on fertilizer',
    desc: 'Cut expensive chemical bags, feed soil naturally',
    goalKey: 'fertilizer',
    badge: 'Cut Costs',
    weights: { market: 0.10, fertilizer: 0.70, faw: 0.10, drought: 0.10 },
  },
  {
    id: 'pest',
    title: 'Stop armyworm worms',
    desc: 'Starve Fall Armyworm, protect future maize',
    goalKey: 'pest',
    badge: 'Beat Pests',
    weights: { market: 0.10, fertilizer: 0.10, faw: 0.70, drought: 0.10 },
  },
  {
    id: 'drought',
    title: 'Guard against dry weather',
    desc: 'Survive low rains and hot sun without dying',
    goalKey: 'drought',
    badge: 'Drought Shield',
    weights: { market: 0.10, fertilizer: 0.10, faw: 0.10, drought: 0.70 },
  },
];

const SOILS = [
  {
    id: 'Sandy Loam',
    title: 'Sandy Loam',
    desc: 'Light brown soil that drains easily (Common across Ejura)',
    typeKey: 'sandy loam',
  },
  {
    id: 'Clay Loam',
    title: 'Red Clay',
    desc: 'Reddish soil that holds moisture and feels sticky when wet',
    typeKey: 'red clay',
  },
  {
    id: 'Loam',
    title: 'Black Loam',
    desc: 'Dark, fertile black earth found near river valleys',
    typeKey: 'black loam',
  },
];

const FARM_SIZES = [
  { label: 'Small Plot', acres: 2, ha: 0.8 },
  { label: 'Medium Farm', acres: 5, ha: 2.0 },
  { label: 'Large Farm', acres: 10, ha: 4.0 },
];

export default function GuidedFarmQuestions({
  profile,
  activePriority,
  onCropSelect,
  onPrioritySelect,
  onSoilSelect,
  onSizeChange,
  isLoading,
}) {
  // Current farm size in acres
  const currentAcres = Math.round(profile.farm_size_hectares * 2.471);

  const handleAcresDelta = (delta) => {
    const nextAcres = Math.max(1, Math.min(50, currentAcres + delta));
    const nextHa = parseFloat((nextAcres / 2.471).toFixed(1));
    onSizeChange(nextHa);
  };

  return (
    <div className="space-y-8">
      {/* ========================================================
          QUESTION 1: CURRENT CROP
          ======================================================== */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm transition hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white font-black text-sm sm:text-base shrink-0">
            1
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              What crop do you currently have on your farm?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Tap the crop currently standing or recently harvested on your field
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mt-5">
          {CROPS.map((crop) => {
            const isSelected = profile.current_crop === crop.id;
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => onCropSelect(crop.id)}
                className={`relative flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-150 group cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-4 ring-emerald-100 shadow-md transform -translate-y-0.5'
                    : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}

                {/* Crop Visual Illustration */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2.5">
                  <CropImage
                    name={crop.imageKey}
                    className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm group-hover:scale-105"
                    alt={crop.name}
                  />
                </div>

                {/* Text Labels */}
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                  {crop.name}
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 italic mt-0.5">
                  ({crop.localName})
                </span>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 hidden sm:block">
                  {crop.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          QUESTION 2: FARMER PRIORITY / GOAL
          ======================================================== */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm transition hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white font-black text-sm sm:text-base shrink-0">
            2
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              What is your biggest priority right now?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose the main goal you want this next harvest to achieve for you and your family
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {PRIORITIES.map((goal) => {
            const isSelected = activePriority === goal.id;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onPrioritySelect(goal.id, goal.weights)}
                className={`relative flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl border-2 transition-all duration-150 group cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-4 ring-emerald-100 shadow-md transform -translate-y-0.5'
                    : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}

                {/* Goal Visual Illustration */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-center mb-3">
                  <GoalImage
                    goal={goal.goalKey}
                    className="w-18 h-18 sm:w-20 sm:h-20 drop-shadow-sm group-hover:scale-105"
                    alt={goal.title}
                  />
                </div>

                {/* Badge */}
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1.5 ${
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {goal.badge}
                </span>

                {/* Text Labels */}
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {goal.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          QUESTION 3: SOIL TEXTURE & FARM SIZE
          ======================================================== */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm transition hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white font-black text-sm sm:text-base shrink-0">
            3
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              What does your soil look like?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pick the color and texture closest to your farm field
            </p>
          </div>
        </div>

        {/* Soil Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {SOILS.map((soil) => {
            const isSelected = profile.soil_type === soil.id;
            return (
              <button
                key={soil.id}
                type="button"
                onClick={() => onSoilSelect(soil.id)}
                className={`relative flex items-center sm:flex-col text-left sm:text-center p-4 sm:p-5 rounded-2xl border-2 transition-all duration-150 group cursor-pointer gap-4 sm:gap-3 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-4 ring-emerald-100 shadow-md transform -translate-y-0.5'
                    : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                {/* Active Checkmark Badge */}
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}

                {/* Soil Visual Illustration */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                  <SoilImage
                    type={soil.typeKey}
                    className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm group-hover:scale-105"
                    alt={soil.title}
                  />
                </div>

                {/* Text Labels */}
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                    {soil.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {soil.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Farm Size Picker Sub-section */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              How big is your planting land?
            </h3>
            <p className="text-xs text-slate-500">
              Used to estimate your total harvest sales and seed needs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Farm Size Presets */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {FARM_SIZES.map((size) => {
                const isActive = Math.abs(profile.farm_size_hectares - size.ha) < 0.3;
                return (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => onSizeChange(size.ha)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {size.label} ({size.acres} ac)
                  </button>
                );
              })}
            </div>

            {/* Stepper with Large Tap Targets */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleAcresDelta(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 active:scale-95 transition shadow-2xs text-lg font-black"
                title="Decrease size by 1 acre"
                aria-label="Decrease farm size"
              >
                <Minus className="w-4 h-4 text-slate-700" />
              </button>

              <div className="px-3 text-center min-w-[110px]">
                <span className="block text-sm sm:text-base font-black text-slate-900">
                  {currentAcres} {currentAcres === 1 ? 'Acre' : 'Acres'}
                </span>
                <span className="block text-[10px] font-bold text-emerald-700">
                  (~{profile.farm_size_hectares} Hectares)
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleAcresDelta(1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 active:scale-95 transition shadow-2xs text-lg font-black"
                title="Increase size by 1 acre"
                aria-label="Increase farm size"
              >
                <Plus className="w-4 h-4 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
