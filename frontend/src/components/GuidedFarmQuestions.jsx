import React, { useState } from 'react';
import { 
  CheckCircle2, ChevronRight, Sparkles, HelpCircle, 
  Minus, Plus, MapPin, Navigation, Compass, AlertCircle, 
  Leaf, PlusCircle, Calendar, Bug, Layers 
} from 'lucide-react';
import { CropImage, SoilImage, GoalImage } from './CropVisuals';

const BASE_CROPS = [
  { id: 'Maize', name: 'Maize / Corn', localName: 'Aburo', desc: 'Most common field crop in Ejura belt', imageKey: 'maize' },
  { id: 'Cassava', name: 'Cassava', localName: 'Bankye', desc: 'Deep roots, hardy against dry weather', imageKey: 'cassava' },
  { id: 'Yam', name: 'Yam', localName: 'Bayer', desc: 'Climbing vines and mounded tubers', imageKey: 'yam' },
  { id: 'Cowpea', name: 'Cowpea / Beans', localName: 'Adua', desc: 'Fast-growing legume pods', imageKey: 'cowpea' },
  { id: 'Soybean', name: 'Soybean', localName: 'Soybean', desc: 'High cash market for poultry feed', imageKey: 'soybean' },
  { id: 'Groundnut', name: 'Groundnut / Peanuts', localName: 'Nkate', desc: 'Underground pods & lush ground cover', imageKey: 'groundnut' },
  { id: 'Rice', name: 'Rice', localName: 'Emo', desc: 'Paddy grain in moist valley soils', imageKey: 'rice' },
  { id: 'Plantain', name: 'Plantain', localName: 'Borode', desc: 'Hardy perennial staple in forest fringe', imageKey: 'plantain' },
  { id: 'Pepper', name: 'Hot Pepper', localName: 'Mako', desc: 'High-value quick cash garden crop', imageKey: 'pepper' },
  { id: 'Tomato', name: 'Tomato', localName: 'Ntosi', desc: 'Demands fertile loam and regular moisture', imageKey: 'tomato' },
];

const SOILS = [
  { id: 'Sandy Loam', title: 'Sandy Loam', desc: 'Light brown soil that drains easily (Common across Ejura)', typeKey: 'sandy loam' },
  { id: 'Clay Loam', title: 'Red Clay', desc: 'Reddish soil that holds moisture and feels sticky when wet', typeKey: 'red clay' },
  { id: 'Loam', title: 'Black Loam', desc: 'Dark, fertile black earth found near river valleys', typeKey: 'black loam' },
];

const FARM_SIZES = [
  { label: 'Small Plot', acres: 2, ha: 0.8 },
  { label: 'Medium Farm', acres: 5, ha: 2.0 },
  { label: 'Large Farm', acres: 10, ha: 4.0 },
];

export default function GuidedFarmQuestions({
  profile,
  farmer,
  cropInMind,
  onCropInMindChange,
  onCropSelect,
  onSoilSelect,
  onSizeChange,
  onGpsRecord,
  onAddCustomCrop,
  onFarmUsageChange,
  isLoading,
}) {
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  const currentAcres = Math.round(profile.farm_size_hectares * 2.471);

  const handleAcresDelta = (delta) => {
    const nextAcres = Math.max(1, Math.min(50, currentAcres + delta));
    const nextHa = parseFloat((nextAcres / 2.471).toFixed(1));
    onSizeChange(nextHa);
  };

  const handleAddCropSubmit = (e) => {
    e.preventDefault();
    if (!newCropName.trim()) return;
    onAddCustomCrop(newCropName.trim());
    setNewCropName('');
    setShowAddCropModal(false);
  };

  const handleLiveGpsCapture = () => {
    if (!navigator.geolocation) {
      setGpsStatus({ error: 'GPS is not supported by your browser.' });
      return;
    }

    setGpsLoading(true);
    setGpsStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        onGpsRecord({
          latitude: parseFloat(latitude.toFixed(5)),
          longitude: parseFloat(longitude.toFixed(5)),
          accuracy_meters: Math.round(accuracy),
          recorded_on_farm: true,
        });
        setGpsLoading(false);
        setGpsStatus({
          success: true,
          lat: latitude.toFixed(4),
          lon: longitude.toFixed(4),
          accuracy: Math.round(accuracy),
        });
      },
      (err) => {
        setGpsLoading(false);
        setGpsStatus({
          error: 'Could not access GPS. Please allow location permissions in your browser.',
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Merge base crops with farmer's custom crops
  const customList = (farmer?.custom_crops || []).map((c) => ({
    id: c,
    name: c,
    localName: 'Farmer Added',
    desc: 'Custom crop registered in your Digital Twin',
    imageKey: c.toLowerCase(),
    isCustom: true,
  }));

  const combinedCrops = [
    ...BASE_CROPS,
    ...customList.filter((cc) => !BASE_CROPS.some((bc) => bc.id.toLowerCase() === cc.id.toLowerCase())),
  ];

  return (
    <div className="space-y-8">
      {/* ========================================================
          ON-FARM LIVE GPS & DIGITAL TWIN LOCATION
          ======================================================== */}
      <section className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-3xl p-5 sm:p-7 shadow-sm border border-emerald-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-800 border-2 border-emerald-400 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Are you currently standing on your farm?
                </h2>
                {profile.gps_recorded_on_farm ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-emerald-950">
                    <CheckCircle2 className="w-3 h-3" /> Live Farm GPS Locked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-emerald-950">
                    Ejura District Baseline
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                If you are on your farm right now, we can capture your exact satellite coordinates to match NASA soil and rainfall data directly to your soil.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLiveGpsCapture}
              disabled={gpsLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs sm:text-sm transition shadow-sm disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Reading Device GPS...' : '📍 Record Exact Farm GPS'}</span>
            </button>
          </div>
        </div>

        {/* GPS Status feedback */}
        {gpsStatus?.success && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-800/80 border border-emerald-500 text-xs text-emerald-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>
              <strong>GPS Connected:</strong> Latitude {gpsStatus.lat}° N, Longitude {gpsStatus.lon}° W (Accuracy ±{gpsStatus.accuracy}m). Synced with NASA POWER & GPM!
            </span>
          </div>
        )}

        {gpsStatus?.error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-900/60 border border-rose-500 text-xs text-rose-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span>{gpsStatus.error} (Using default Ejura coordinates: 7.3856° N, 1.3562° W)</span>
          </div>
        )}
      </section>

      {/* ========================================================
          STEP 1: CURRENT CROPS CULTIVATED + REAL PHOTOS
          ======================================================== */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm transition hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white font-black text-sm sm:text-base shrink-0">
              1
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                What crop do you currently have on this field?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Tap the standing or recently harvested crop. We show actual photos from Ejura farms.
              </p>
            </div>
          </div>

          {/* Add Other Crop Button */}
          <button
            type="button"
            onClick={() => setShowAddCropModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold transition self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>+ Add Other Crop</span>
          </button>
        </div>

        {/* Real Photographic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mt-5">
          {combinedCrops.map((crop) => {
            const isSelected = profile.current_crop === crop.id;
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => onCropSelect(crop.id)}
                className={`relative flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all duration-150 group cursor-pointer ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/80 ring-4 ring-emerald-100 shadow-md transform -translate-y-0.5'
                    : 'border-slate-200 bg-slate-50/50 hover:border-emerald-300 hover:bg-white hover:shadow-xs'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white shadow-xs z-10">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}

                {/* Real Photographic Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-2 flex items-center justify-center overflow-hidden rounded-2xl">
                  <CropImage
                    name={crop.imageKey}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                    alt={crop.name}
                  />
                </div>

                <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-tight">
                  {crop.name}
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 italic mt-0.5">
                  ({crop.localName})
                </span>
              </button>
            );
          })}
        </div>

        {/* Modal: Add Custom Crop */}
        {showAddCropModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border border-emerald-200">
              <h3 className="font-black text-base text-slate-900 mb-1">
                Add Missing Crop to Farm Twin
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Type the name of any other crop you grow in Ejura (e.g. Watermelon, Ginger, Garden Eggs).
              </p>
              <form onSubmit={handleAddCropSubmit} className="space-y-4">
                <input
                  type="text"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  placeholder="e.g. Watermelon"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  autoFocus
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCropModal(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-600"
                  >
                    Save & Select Crop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================
          STEP 2: TARGET CROP IN MIND + FARM HISTORY
          ======================================================== */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-emerald-100 shadow-sm transition hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white font-black text-sm sm:text-base shrink-0">
            2
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Do you already have a crop in mind for the upcoming season?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              We check your idea against NASA soil & weather data to approve it or suggest safer choices.
            </p>
          </div>
        </div>

        {/* Choice Toggle: Have a crop in mind vs Recommend for me */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => onCropInMindChange('Maize')}
            className={`p-4 rounded-2xl border-2 text-left transition ${
              cropInMind !== null
                ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-200'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <span className="font-extrabold text-sm text-slate-900 block flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600" />
              Yes, I have a specific crop in mind
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              I want to test if my planned crop matches my field and weather.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onCropInMindChange(null)}
            className={`p-4 rounded-2xl border-2 text-left transition ${
              cropInMind === null
                ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-200'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <span className="font-extrabold text-sm text-slate-900 block flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              No, I am not sure — Recommend for me
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Suggest the best crops to maximize income, cut fertilizer, and avoid pests.
            </span>
          </button>
        </div>

        {/* If farmer has a crop in mind: show selector */}
        {cropInMind !== null && (
          <div className="mt-5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
            <label className="block text-xs font-black text-emerald-950 mb-2">
              Select the crop you are planning to plant next:
            </label>
            <div className="flex flex-wrap gap-2">
              {combinedCrops.map((c) => {
                const isSelected = cropInMind?.toLowerCase() === c.id.toLowerCase();
                return (
                  <button
                    key={`mind-${c.id}`}
                    type="button"
                    onClick={() => onCropInMindChange(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-400'
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-200" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Farm Usage & Field History Questions */}
        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Consecutive seasons */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-extrabold text-slate-900 block mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Seasons of {profile.current_crop} on this plot
            </span>
            <select
              value={profile.monocropping_seasons || 2}
              onChange={(e) => onFarmUsageChange({ monocropping_seasons: parseInt(e.target.value) })}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
            >
              <option value={1}>1 season (First time planting here)</option>
              <option value={2}>2 seasons in a row</option>
              <option value={3}>3+ seasons in a row (Continuous)</option>
            </select>
          </div>

          {/* Armyworm pest attack */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-extrabold text-slate-900 block mb-1 flex items-center gap-1.5">
              <Bug className="w-3.5 h-3.5 text-rose-500" />
              Fall Armyworm attacks recently?
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => onFarmUsageChange({ armyworm_attacks: true })}
                className={`py-1.5 px-3 rounded-lg font-bold text-center border transition ${
                  profile.armyworm_attacks
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                Yes, worms attacked
              </button>
              <button
                type="button"
                onClick={() => onFarmUsageChange({ armyworm_attacks: false })}
                className={`py-1.5 px-3 rounded-lg font-bold text-center border transition ${
                  !profile.armyworm_attacks
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                No worm issues
              </button>
            </div>
          </div>

          {/* Fertilizer usage */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="font-extrabold text-slate-900 block mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Fertilizer used on this field
            </span>
            <select
              value={profile.fertilizer_used || 'Chemical NPK'}
              onChange={(e) => onFarmUsageChange({ fertilizer_used: e.target.value })}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
            >
              <option value="Chemical NPK">Chemical NPK / Urea</option>
              <option value="Animal Manure">Animal Manure / Compost</option>
              <option value="None">None (Unfertilized)</option>
            </select>
          </div>
        </div>
      </section>

      {/* ========================================================
          STEP 3: SOIL TEXTURE & FARM SIZE
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
              Pick the soil texture closest to your farm field
            </p>
          </div>
        </div>

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
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}

                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                  <SoilImage
                    type={soil.typeKey}
                    className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm group-hover:scale-105"
                    alt={soil.title}
                  />
                </div>

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

        {/* Farm Size Picker */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              How big is your planting land?
            </h3>
            <p className="text-xs text-slate-500">
              Used to calculate expected harvest earnings and seed requirements
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
