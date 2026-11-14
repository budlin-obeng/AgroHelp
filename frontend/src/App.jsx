import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FarmMap from './components/FarmMap';
import FarmProfileControls from './components/FarmProfileControls';
import MLPredictionCards from './components/MLPredictionCards';
import TradeoffExplorer from './components/TradeoffExplorer';
import NasaIndicatorsDashboard from './components/NasaIndicatorsDashboard';
import Footer from './components/Footer';
import { predictRotations } from './services/api';
import { Sparkles, MapPin, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState({
    soil_type: 'Sandy Loam',
    current_crop: 'Maize',
    farm_size_hectares: 2.0,
    target_season: 'Major Rainy Season',
    market_priority: 0.35,
    fertilizer_savings_priority: 0.25,
    faw_disruption_priority: 0.20,
    drought_resilience_priority: 0.20,
    latitude: 7.3856,
    longitude: -1.3562,
  });

  const [predictions, setPredictions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Function to execute dynamic ML prediction
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

  // Fetch predictions on initial load and whenever profile changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPredictions(profile);
    }, 250);

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
    fetchPredictions
  ]);

  // Handler for partial profile updates
  const handleProfileChange = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  // Handler for map location changes
  const handleLocationChange = (lat, lng) => {
    setProfile((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    showNotification(`Farm pin updated: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° W`);
  };

  // Handler for applying quick goal presets
  const handleApplyPreset = (weights) => {
    setProfile((prev) => ({
      ...prev,
      market_priority: weights.market,
      fertilizer_savings_priority: weights.fertilizer,
      faw_disruption_priority: weights.faw,
      drought_resilience_priority: weights.drought,
    }));
    showNotification('Goal preset applied: recalculating ML models...');
  };

  // Toast notification helper
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans">
      {/* Header with Space2Soil branding & telemetry */}
      <Header
        pipelineStatus="online"
        onRefresh={() => fetchPredictions(profile)}
        isRefreshing={isLoading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Pilot Context Alert Banner */}
        <div className="bg-gradient-to-r from-agro-900 via-agro-800 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-agro-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Ejura-Sekyedumase Smallholder Pilot: Overcoming Monoculture Vulnerability
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Critical Challenge
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Ejura is Ghana's premier maize belt, where continuous monoculture has triggered recurring Fall Armyworm
                (<em>Spodoptera frugiperda</em>) devastation and steep synthetic fertilizer expenditure.
                AgroHelp ingests 10 years of NASA satellite observations to generate optimized, resilient crop rotation regimes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-white/10 px-3 py-2 rounded-xl shrink-0 border border-white/10 self-start md:self-center">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>7.3856&deg; N, -1.3562&deg; W</span>
          </div>
        </div>

        {/* Top Grid: Interactive Map + Farm Profile & Priority Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Map & Controls (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Interactive Leaflet Map */}
            <FarmMap
              latitude={profile.latitude}
              longitude={profile.longitude}
              onLocationChange={handleLocationChange}
            />

            {/* Farm Profile & Optimization Controls */}
            <FarmProfileControls
              profile={profile}
              onChange={handleProfileChange}
              onApplyPreset={handleApplyPreset}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: ML-Predicted Rotation Cards (5 cols on lg) */}
          <div className="lg:col-span-5">
            <MLPredictionCards
              predictions={predictions}
              isLoading={isLoading}
              currentCrop={profile.current_crop}
              farmSizeHa={profile.farm_size_hectares}
            />
          </div>
        </div>

        {/* Full-width Section: Trade-off Explorer */}
        <section>
          <TradeoffExplorer recommendations={predictions?.recommendations} />
        </section>

        {/* Full-width Section: NASA Indicators Dashboard */}
        <section>
          <NasaIndicatorsDashboard />
        </section>
      </main>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
