import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GuidedFarmQuestions from './components/GuidedFarmQuestions';
import ThreeSolutions from './components/ThreeSolutions';
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
      showNotification(`Welcome to AgroHelp, ${result.full_name}! Digital Twin created.`);
    } else {
      result = await loginFarmer(authData);
      showNotification(`Akwaaba, ${result.full_name}! Farm Twin loaded.`);
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
    showNotification(`Live Farm GPS locked: ${gpsData.latitude}° N, ${gpsData.longitude}° W`);
  };

  // Add custom crop to Digital Twin
  const handleAddCustomCrop = async (cropName) => {
    let updatedFarmer = farmer;
    if (farmer?.phone_number) {
      updatedFarmer = await addCustomCrop(farmer.phone_number, cropName);
      setFarmer(updatedFarmer);
    }
    setProfile((prev) => ({ ...prev, current_crop: cropName }));
    showNotification(`Added ${cropName} to your Digital Twin crop inventory!`);
  };

  // Current crop selection
  const handleCropSelect = (cropId) => {
    setProfile((prev) => ({ ...prev, current_crop: cropId }));
    showNotification(`Selected ${cropId} as current standing crop`);
  };

  const handleLogout = () => {
    localStorage.removeItem('agrohelp_farmer');
    setFarmer(null);
    showNotification('Signed out of Farm Digital Twin.');
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode === 'register' ? 'register' : 'login');
    setIsAuthModalOpen(true);
  };

  // Soil type selection
  const handleSoilSelect = (soilId) => {
    setProfile((prev) => ({ ...prev, soil_type: soilId }));
    showNotification(`Soil updated to ${soilId}`);
  };

  // Farm size change
  const handleSizeChange = (ha) => {
    setProfile((prev) => ({ ...prev, farm_size_hectares: ha }));
  };

  // Farm usage & pest history changes
  const handleFarmUsageChange = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    showNotification('Field history updated');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* High-Contrast Responsive Header */}
      <Header
        onRefresh={() => runEvaluation(profile, cropInMind, farmer)}
        isRefreshing={isLoading}
        farmer={farmer}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Farm Digital Twin Status Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-600/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6">
            <img 
              src="/logo-icon.png" 
              alt="AgroHelp Farmer" 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-1 bg-white/10 border border-white/20 shadow-inner object-contain shrink-0 hidden sm:block"
            />
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider">
                <span>🌾 Farm Digital Twin &bull; {farmer?.full_name || 'Kofi Mensah'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Akwaaba! Welcome to Your Farm Companion
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                Registered in <strong className="text-amber-300">{farmer?.location?.community || 'Ejura'}</strong>, {farmer?.location?.district || 'Ejura-Sekyedumase'}, {farmer?.location?.region || 'Ashanti Region'}. 
                Your field is monitored against decadal NASA Earth Observations to prevent armyworms and preserve your soil.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-2 rounded-2xl border border-white/20">
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>{farmer?.location?.district || 'Ejura-Sekyedumase'}, Ghana</span>
            </div>
            <span className="text-[11px] text-emerald-200">
              {profile.gps_recorded_on_farm ? '✓ Live Farm GPS Active' : 'Calibrated District Grid'}
            </span>
          </div>
        </div>

        {/* Guided Farm Questions & History Flow */}
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

        {/* Feasibility Verdict & Dynamic Solutions (Max 3) */}
        <section id="solutions-section">
          <ThreeSolutions
            feasibilityResult={feasibilityResult}
            isLoading={isLoading}
            farmSizeHa={profile.farm_size_hectares}
            currentCrop={profile.current_crop}
          />
        </section>
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
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
