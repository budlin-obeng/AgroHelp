import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GuidedFarmQuestions from './components/GuidedFarmQuestions';
import ThreeSolutions from './components/ThreeSolutions';
import Footer from './components/Footer';
import { predictRotations } from './services/api';
import { Sprout, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState({
    soil_type: 'Sandy Loam',
    current_crop: 'Maize',
    farm_size_hectares: 2.0,
    target_season: 'Major Rainy Season',
    market_priority: 0.70,
    fertilizer_savings_priority: 0.10,
    faw_disruption_priority: 0.10,
    drought_resilience_priority: 0.10,
    latitude: 7.3856,
    longitude: -1.3562,
  });

  const [activePriority, setActivePriority] = useState('income');
  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch dynamic rotation predictions from backend
  const fetchPredictions = useCallback(async (currentSettings) => {
    setIsLoading(true);
    try {
      const data = await predictRotations({
        soil_type: currentSettings.soil_type,
        current_crop: currentSettings.current_crop,
        farm_size_hectares: currentSettings.farm_size_hectares,
        target_season: currentSettings.target_season,
        market_priority: currentSettings.market_priority,
        fertilizer_savings_priority: currentSettings.fertilizer_savings_priority,
        faw_disruption_priority: currentSettings.faw_disruption_priority,
        drought_resilience_priority: currentSettings.drought_resilience_priority,
      });
      setPredictions(data);
    } catch (err) {
      console.error('Failed to get predictions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when settings change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPredictions(profile);
    }, 200);

    return () => clearTimeout(timer);
  }, [
    profile.soil_type,
    profile.current_crop,
    profile.farm_size_hectares,
    profile.target_season,
    profile.market_priority,
    profile.fertilizer_savings_priority,
    profile.faw_disruption_priority,
    profile.drought_resilience_priority,
    fetchPredictions,
  ]);

  const handleCropSelect = (cropId) => {
    setProfile((prev) => ({ ...prev, current_crop: cropId }));
    showNotification(`Selected ${cropId} as current crop`);
  };

  const handlePrioritySelect = (priorityId, weights) => {
    setActivePriority(priorityId);
    setProfile((prev) => ({
      ...prev,
      market_priority: weights.market,
      fertilizer_savings_priority: weights.fertilizer,
      faw_disruption_priority: weights.faw,
      drought_resilience_priority: weights.drought,
    }));
    showNotification(`Goal updated: Finding best options for your farm`);
  };

  const handleSoilSelect = (soilId) => {
    setProfile((prev) => ({ ...prev, soil_type: soilId }));
    showNotification(`Soil updated to ${soilId}`);
  };

  const handleSizeChange = (ha) => {
    setProfile((prev) => ({ ...prev, farm_size_hectares: ha }));
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Warm & Respectful Header */}
      <Header
        onRefresh={() => fetchPredictions(profile)}
        isRefreshing={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Warm Welcome Companion Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-600/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-emerald-950 text-xs font-black uppercase tracking-wider">
              <span>🌾 Simple Farming Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Akwaaba! Welcome to Your Farm Companion
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Continuous maize in Ejura invites Fall Armyworm pests and drains your soil. 
              Tap the 3 simple questions below to discover your <strong>3 best crop rotation solutions</strong> to save money on fertilizer, protect your harvest, and boost your family income.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold bg-white/10 px-3.5 py-2 rounded-2xl border border-white/20">
              <MapPin className="w-4 h-4 text-amber-300" />
              <span>Ejura-Sekyedumase, Ghana</span>
            </div>
            <span className="text-[11px] text-emerald-200">
              Calibrated for local soils & rainfall
            </span>
          </div>
        </div>

        {/* Guided 3 Questions (HCI & Gestalt Design) */}
        <GuidedFarmQuestions
          profile={profile}
          activePriority={activePriority}
          onCropSelect={handleCropSelect}
          onPrioritySelect={handlePrioritySelect}
          onSoilSelect={handleSoilSelect}
          onSizeChange={handleSizeChange}
          isLoading={isLoading}
        />

        {/* Exactly Three Solutions */}
        <section id="solutions-section">
          <ThreeSolutions
            predictions={predictions}
            isLoading={isLoading}
            farmSizeHa={profile.farm_size_hectares}
            currentCrop={profile.current_crop}
          />
        </section>
      </main>

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
