import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import NasaIndicatorsDashboard from './components/NasaIndicatorsDashboard';
import GuidedFarmQuestions from './components/GuidedFarmQuestions';
import FarmMap from './components/FarmMap';
import ThreeSolutions from './components/ThreeSolutions';
import TradeoffExplorer from './components/TradeoffExplorer';
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
import { Sprout, CheckCircle2, ShieldCheck, MapPin, Compass, Navigation } from 'lucide-react';

// Friendly names farmers recognise for each soil type
const SOIL_LABELS = {
  'Sandy Loam': 'Sandy Loam',
  'Clay Loam': 'Red Clay',
  'Loam': 'Black Loam',
};

export default function App() {
  // 1. Farmer Digital Twin Account
  const [farmer, setFarmer] = useState(() => getStoredFarmer() || getDemoFarmerProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // 2. Field profile & Land Usage State
  const [profile, setProfile] = useState({
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* High-Contrast Responsive Header with Live NASA Telemetry Ticker */}
      <Header
        onRefresh={() => runEvaluation(profile, cropInMind, farmer)}
        isRefreshing={isLoading}
        farmer={farmer}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Hero Section Prioritizing NASA Datasets & Multi-Sensor Missions */}
      <HeroSection
        onGetStarted={() => handleOpenAuth('register')}
        onExploreSolutions={() => {
          const el = document.getElementById('questions-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        farmer={farmer}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* 1. NASA Earth Observation Matrix & Decadal Indicators Dashboard */}
        <NasaIndicatorsDashboard />

        {/* 2. Interactive Farm Pin Locator & 30m Landsat NDVI Geospatial Map */}
        <FarmMap
          latitude={profile.latitude}
          longitude={profile.longitude}
          onLocationChange={handleLocationChange}
        />

        {/* 3. Guided Farm Questions & Farmer History Flow */}
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
          />
        </div>

        {/* 4. Feasibility Verdict & Dynamic Solutions with NASA Satellite Telemetry Proof */}
        <section id="solutions-section">
          <ThreeSolutions
            feasibilityResult={feasibilityResult}
            isLoading={isLoading}
            farmSizeHa={profile.farm_size_hectares}
            currentCrop={profile.current_crop}
          />
        </section>

        {/* 5. Agronomic Trade-off & Pareto Frontier Explorer */}
        <TradeoffExplorer recommendations={feasibilityResult?.recommendations || []} />

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
