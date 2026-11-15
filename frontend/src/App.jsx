import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import NasaIndicatorsDashboard from './components/NasaIndicatorsDashboard';
import GuidedFarmQuestions from './components/GuidedFarmQuestions';
import FarmMap from './components/FarmMap';
import ThreeSolutions from './components/ThreeSolutions';
import TradeoffExplorer from './components/TradeoffExplorer';
import RegionalMarketExplorer from './components/RegionalMarketExplorer';
import FarmerChallengesNetwork from './components/FarmerChallengesNetwork';
import Footer from './components/Footer';
import FarmerAuthModal from './components/FarmerAuthModal';
import {
  getStoredFarmer,
  getDemoFarmerProfile,
  loginFarmer,
  registerFarmer,
  addCustomCrop,
  recordFarmGPS,
  evaluateCropFeasibility
} from './services/api';
import {
  Sprout, CheckCircle2, ShieldCheck, MapPin, Compass, Navigation,
  Store, Satellite, AlertTriangle, ArrowRight, Layers
} from 'lucide-react';

// Friendly names farmers recognise for each soil type
const SOIL_LABELS = {
  'Sandy Loam': 'Sandy Loam',
  'Clay Loam': 'Red Clay',
  'Loam': 'Black Loam',
};

export default function App() {
  // Navigation / View state: 'farm' (minimal home), 'market', 'nasa', 'alerts'
  const [activeTab, setActiveTab] = useState('farm');

  // 1. Farmer Digital Twin Account
  const [farmer, setFarmer] = useState(() => getStoredFarmer() || getDemoFarmerProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // 2. Field profile & Land Usage State
  const [profile, setProfile] = useState({
    country: farmer?.location?.country || 'Ghana',
    town: farmer?.location?.community || farmer?.location?.district || 'Ejura Central',
    soil_type: farmer?.soil_type || 'Sandy Loam',
    current_crop: farmer?.cultivated_crops?.[0] || 'Maize',
    farm_size_hectares: farmer?.farm_size_hectares || 2.0,
    target_season: farmer?.target_season || 'Major Rainy Season',
    latitude: farmer?.latitude || 7.3856,
    longitude: farmer?.longitude || -1.3562,
    gps_recorded_on_farm: farmer?.gps_recorded_on_farm || false,
    monocropping_seasons: farmer?.farm_usage?.monocropping_seasons || 2,
    fertilizer_used: farmer?.farm_usage?.fertilizer_used || 'Chemical NPK',
    armyworm_attacks: farmer?.farm_usage?.armyworm_attacks !== undefined ? farmer.farm_usage.armyworm_attacks : true,
    water_source: farmer?.farm_usage?.water_source || 'Rainfed',
  });

  // 3. Crop in mind for upcoming season
  const [cropInMind, setCropInMind] = useState(farmer?.crop_in_mind || 'Maize');

  // 4. ML Feasibility & Recommendations Result
  const [feasibilityResult, setFeasibilityResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Run Crop Feasibility & Dynamic ML Evaluation
  const runEvaluation = useCallback(async (currentSettings, targetCrop, currentFarmer) => {
    setIsLoading(true);
    try {
      const data = await evaluateCropFeasibility({
        phone_number: currentFarmer?.phone_number,
        crop_in_mind: targetCrop,
        current_crop: currentSettings.current_crop,
        soil_type: currentSettings.soil_type,
        target_season: currentSettings.target_season,
        farm_size_hectares: currentSettings.farm_size_hectares,
        latitude: currentSettings.latitude,
        longitude: currentSettings.longitude,
        gps_recorded_on_farm: currentSettings.gps_recorded_on_farm,
        monocropping_seasons: currentSettings.monocropping_seasons,
        fertilizer_used: currentSettings.fertilizer_used,
        armyworm_attacks: currentSettings.armyworm_attacks,
        custom_crops: currentFarmer?.custom_crops,
      });
      setFeasibilityResult(data);
    } catch (err) {
      console.error('Failed to run crop feasibility:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Trigger evaluation on profile or crop in mind change
  useEffect(() => {
    const timer = setTimeout(() => {
      runEvaluation(profile, cropInMind, farmer);
    }, 250);

    return () => clearTimeout(timer);
  }, [
    profile.soil_type,
    profile.current_crop,
    profile.farm_size_hectares,
    profile.target_season,
    profile.latitude,
    profile.longitude,
    profile.monocropping_seasons,
    profile.fertilizer_used,
    profile.armyworm_attacks,
    cropInMind,
    farmer,
    runEvaluation,
  ]);

  // Auth handler (Login / Register)
  const handleAuthSuccess = async (authData, isRegister) => {
    let result;
    if (isRegister) {
      result = await registerFarmer(authData);
      showNotification(`Akwaaba, ${result.full_name}! Your farm record is ready.`);
    } else {
      result = await loginFarmer(authData);
      showNotification(`Welcome back, ${result.full_name}! Your farm record has loaded.`);
    }

    setFarmer(result);
    setProfile((prev) => ({
      ...prev,
      soil_type: result.soil_type || prev.soil_type,
      current_crop: result.cultivated_crops?.[0] || prev.current_crop,
      farm_size_hectares: result.farm_size_hectares || prev.farm_size_hectares,
      latitude: result.latitude || prev.latitude,
      longitude: result.longitude || prev.longitude,
      gps_recorded_on_farm: result.gps_recorded_on_farm || false,
      monocropping_seasons: result.farm_usage?.monocropping_seasons || prev.monocropping_seasons,
      fertilizer_used: result.farm_usage?.fertilizer_used || prev.fertilizer_used,
      armyworm_attacks: result.farm_usage?.armyworm_attacks !== undefined ? result.farm_usage.armyworm_attacks : prev.armyworm_attacks,
    }));
    setCropInMind(result.crop_in_mind || null);
  };

  // Live GPS capture on farm
  const handleGpsRecord = async (gpsData) => {
    setProfile((prev) => ({
      ...prev,
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
      gps_recorded_on_farm: gpsData.recorded_on_farm,
    }));

    if (farmer?.phone_number) {
      const updated = await recordFarmGPS(farmer.phone_number, gpsData);
      setFarmer(updated);
    }
    showNotification(`Farm location saved: ${gpsData.latitude}° N, ${gpsData.longitude}° W`);
  };

  // Location change from Map
  const handleLocationChange = (lat, lng) => {
    setProfile((prev) => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(4)),
      longitude: parseFloat(lng.toFixed(4)),
    }));
    showNotification(`Farm coordinates updated: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° W`);
  };

  // Add custom crop to Digital Twin
  const handleAddCustomCrop = async (cropName) => {
    let updatedFarmer = farmer;
    if (farmer?.phone_number) {
      updatedFarmer = await addCustomCrop(farmer.phone_number, cropName);
      setFarmer(updatedFarmer);
    }
    setProfile((prev) => ({ ...prev, current_crop: cropName }));
    showNotification(`${cropName} has been added to your crops.`);
  };

  // Current crop selection
  const handleCropSelect = (cropId) => {
    setProfile((prev) => ({ ...prev, current_crop: cropId }));
    showNotification(`${cropId} is now the crop on your farm.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('agrohelp_farmer');
    setFarmer(null);
    showNotification('You have logged out.');
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode === 'register' ? 'register' : 'login');
    setIsAuthModalOpen(true);
  };

  // Soil type selection
  const handleSoilSelect = (soilId) => {
    setProfile((prev) => ({ ...prev, soil_type: soilId }));
    showNotification(`Your soil is now set to ${SOIL_LABELS[soilId] || soilId}.`);
  };

  // Farm size change
  const handleSizeChange = (ha) => {
    setProfile((prev) => ({ ...prev, farm_size_hectares: ha }));
  };

  // Farm usage & pest history changes
  const handleFarmUsageChange = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    showNotification('Your farm history is updated.');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const currentLocation = {
    country: profile.country || 'Ghana',
    town: profile.town || 'Local Farm',
    latitude: profile.latitude,
    longitude: profile.longitude,
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* High-Contrast Responsive Header with Live Location and View Navigation */}
      <Header
        onRefresh={() => runEvaluation(profile, cropInMind, farmer)}
        isRefreshing={isLoading}
        farmer={farmer}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
        currentLocation={currentLocation}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* Main View Switcher Tabs Bar */}
      <div className="sticky top-18 sm:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleSelectTab('farm')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'farm'
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>🌾 My Farm &amp; Advice</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === 'farm' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
              }`}>
                Home
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('market')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'market'
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>📈 African Market Prices</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === 'market' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
              }`}>
                6 Nations
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('nasa')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'nasa'
                  ? 'bg-[#0B3D91] text-white shadow-sm ring-2 ring-blue-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Satellite className="w-4 h-4" />
              <span>🛰️ NASA Space Hub</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === 'nasa' ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-600'
              }`}>
                10-Yr Data
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('alerts')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-rose-700 text-white shadow-sm ring-2 ring-rose-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>🚨 Alert Network</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                activeTab === 'alerts' ? 'bg-rose-900 text-rose-100' : 'bg-slate-200 text-slate-600'
              }`}>
                Threat Radar
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <strong>{currentLocation.town}</strong>, {currentLocation.country}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section: Rendered on the Main Farm Home Tab for a Clean, Focused Experience */}
      {activeTab === 'farm' && (
        <HeroSection
          onGetStarted={() => handleOpenAuth('register')}
          onExploreSolutions={() => {
            const el = document.getElementById('questions-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          farmer={farmer}
          currentLocation={currentLocation}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* -------------------- TAB 1: MINIMAL FARM HOME PAGE -------------------- */}
        {activeTab === 'farm' && (
          <div className="space-y-12">
            {/* Guided Farm Questions & Farmer History Flow */}
            <div id="questions-section">
              <GuidedFarmQuestions
                profile={profile}
                farmer={farmer}
                cropInMind={cropInMind}
                onCropInMindChange={setCropInMind}
                onCropSelect={handleCropSelect}
                onSoilSelect={handleSoilSelect}
                onSizeChange={handleSizeChange}
                onGpsRecord={handleGpsRecord}
                onAddCustomCrop={handleAddCustomCrop}
                onFarmUsageChange={handleFarmUsageChange}
                isLoading={isLoading}
                currentLocation={currentLocation}
              />
            </div>

            {/* Feasibility Verdict & Dynamic Solutions */}
            <section id="solutions-section">
              <ThreeSolutions
                feasibilityResult={feasibilityResult}
                isLoading={isLoading}
                farmSizeHa={profile.farm_size_hectares}
                currentCrop={profile.current_crop}
                currentLocation={currentLocation}
              />
            </section>

            {/* Minimal Gateway Cards to In-Depth Datasets */}
            <section className="bg-gradient-to-br from-slate-100 via-white to-emerald-50/40 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-2xs">
              <div className="max-w-3xl mb-6">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block mb-2">
                  Specialized Dashboards
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Looking for In-Depth Market Prices or Space Telemetry?
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  We've organized advanced scientific and economic tools into dedicated dashboards so this farm advice page stays clean and fast.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gateway Card 1: Market Intelligence */}
                <div
                  onClick={() => handleSelectTab('market')}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <Store className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                      African Market Prices
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Compare farmgate and wholesale commodity prices across 6 African countries and view live UN FAO benchmarks.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition">
                    <span>Explore Market Data</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Gateway Card 2: NASA Space Hub */}
                <div
                  onClick={() => handleSelectTab('nasa')}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B3D91] flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <Satellite className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-[#0B3D91] transition">
                      NASA Space Hub
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Inspect 10-year GPM rainfall records, SMAP soil moisture grids, and interactive 30m Landsat satellite maps.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-[#0B3D91] group-hover:translate-x-1 transition">
                    <span>View Space Observations</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Gateway Card 3: Threat Radar */}
                <div
                  onClick={() => handleSelectTab('alerts')}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition">
                      Farmer Alert Network
                    </h4>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Report armyworm attacks or crop stress to alert neighbors and view cross-border threat outbreak clusters.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-bold text-rose-600 group-hover:translate-x-1 transition">
                    <span>Open Threat Radar</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* -------------------- TAB 2: REGIONAL MARKET INTELLIGENCE -------------------- */}
        {activeTab === 'market' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-emerald-100 backdrop-blur-xs inline-flex items-center gap-1.5 mb-2">
                  <Store className="w-3.5 h-3.5" />
                  Pan-African Produce Markets
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  African Regional Crop &amp; Market Price Intelligence
                </h2>
                <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
                  Grounded farmgate &amp; wholesale prices across Ghana, Nigeria, Côte d'Ivoire, Kenya, Senegal, and Mali, benchmarked with live UN FAO FAOSTAT datasets.
                </p>
              </div>
              <button
                onClick={() => handleSelectTab('farm')}
                className="px-4 py-2 bg-white text-emerald-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-50 transition shrink-0 cursor-pointer shadow-xs"
              >
                &larr; Back to My Farm Advice
              </button>
            </div>

            <RegionalMarketExplorer currentLocation={currentLocation} />
          </div>
        )}

        {/* -------------------- TAB 3: NASA SATELLITE & CLIMATE HUB -------------------- */}
        {activeTab === 'nasa' && (
          <div className="space-y-10">
            <div className="bg-gradient-to-r from-[#0B3D91] to-sky-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-sky-100 backdrop-blur-xs inline-flex items-center gap-1.5 mb-2">
                  <Satellite className="w-3.5 h-3.5" />
                  NASA Earth Observations &amp; Climate Telemetry
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Decadal Agroclimatology &amp; Satellite Geospatial Matrix
                </h2>
                <p className="text-sky-100 text-sm mt-1 max-w-2xl">
                  10-year decadal records from NASA GPM IMERG (precipitation), MERRA-2 (thermal heat regimes), SMAP L4 (rootzone soil wetness), and Landsat 30m NDVI vegetation tracking.
                </p>
              </div>
              <button
                onClick={() => handleSelectTab('farm')}
                className="px-4 py-2 bg-white text-[#0B3D91] rounded-xl font-bold text-xs sm:text-sm hover:bg-sky-50 transition shrink-0 cursor-pointer shadow-xs"
              >
                &larr; Back to My Farm Advice
              </button>
            </div>

            {/* NASA Decadal Indicators */}
            <NasaIndicatorsDashboard currentLocation={currentLocation} />

            {/* Farm Satellite Map */}
            <FarmMap
              latitude={profile.latitude}
              longitude={profile.longitude}
              onLocationChange={handleLocationChange}
              currentLocation={currentLocation}
            />

            {/* Tradeoff Frontier */}
            <TradeoffExplorer
              recommendations={feasibilityResult?.recommendations || []}
              currentLocation={currentLocation}
            />
          </div>
        )}

        {/* -------------------- TAB 4: FARMER ALERT NETWORK & THREAT RADAR -------------------- */}
        {activeTab === 'alerts' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-rose-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-rose-100 backdrop-blur-xs inline-flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Crowdsourced Early Warning System
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Farmer Challenges &amp; Global Threat Detection Radar
                </h2>
                <p className="text-rose-100 text-sm mt-1 max-w-2xl">
                  Log farm issues, alert neighboring farmers, and utilize automated spatial clustering to determine if a pest or crop problem is local, regional, or cross-border.
                </p>
              </div>
              <button
                onClick={() => handleSelectTab('farm')}
                className="px-4 py-2 bg-white text-rose-900 rounded-xl font-bold text-xs sm:text-sm hover:bg-rose-50 transition shrink-0 cursor-pointer shadow-xs"
              >
                &larr; Back to My Farm Advice
              </button>
            </div>

            <FarmerChallengesNetwork currentLocation={currentLocation} />
          </div>
        )}

      </main>

      {/* Farmer Account & Location Cascading Modal */}
      <FarmerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        currentFarmer={farmer}
        initialMode={authMode}
      />

      {/* Friendly Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
