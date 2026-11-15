import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, ShieldAlert, Send, Globe, MapPin, CheckCircle2,
  Users, MessageSquare, Flame, Droplets, Bug, AlertCircle, RefreshCw
} from 'lucide-react';
import { submitFarmerChallenge, getFarmerChallenges } from '../services/api';

export default function FarmerChallengesNetwork({ currentLocation }) {
  const [challengesData, setChallengesData] = useState({
    total_challenges: 0,
    active_threat_clusters: [],
    challenges: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    farmer_name: '',
    phone_number: '',
    crop_affected: 'Maize',
    challenge_type: 'Pest Outbreak',
    description: '',
    severity: 'High / Urgent',
  });

  const [activeFilter, setActiveFilter] = useState('all');

  const loadChallenges = () => {
    setLoading(true);
    getFarmerChallenges().then((data) => {
      setChallengesData(data || { total_challenges: 0, active_threat_clusters: [], challenges: [] });
      setLoading(false);
    });
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    setSubmitting(true);
    const payload = {
      ...formData,
      country: currentLocation?.country || 'Ghana',
      town: currentLocation?.town || 'Local Farm',
      latitude: currentLocation?.latitude || 7.3856,
      longitude: currentLocation?.longitude || -1.3562,
    };

    try {
      await submitFarmerChallenge(payload);
      setSubmitSuccess(true);
      setFormData({
        farmer_name: '',
        phone_number: '',
        crop_affected: 'Maize',
        challenge_type: 'Pest Outbreak',
        description: '',
        severity: 'High / Urgent',
      });
      loadChallenges();
      setTimeout(() => setSubmitSuccess(false), 4500);
    } catch (err) {
      console.error('Error submitting challenge:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const threatClusters = challengesData.active_threat_clusters || [];
  const globalThreats = threatClusters.filter((c) => c.threat_level === 'Global Threat');
  const regionalAlerts = threatClusters.filter((c) => c.threat_level === 'Regional Alert');

  const filteredChallenges = (challengesData.challenges || []).filter((ch) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'global') return ch.threat_scope?.includes('Global');
    if (activeFilter === 'current_country') return ch.country?.toLowerCase() === (currentLocation?.country || '').toLowerCase();
    return true;
  });

  return (
    <section id="challenges-network" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8 scroll-mt-24">
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Farmer Challenges & Global Threat Detection
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white font-mono">
                Crowdsourced Warning Network
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Log real-time field problems. Our engine aggregates reports across communities and nations to detect whether an outbreak is local or a cross-border epidemic.
            </p>
          </div>
        </div>

        <button
          onClick={loadChallenges}
          className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-xl transition-colors self-start lg:self-auto flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Alerts</span>
        </button>
      </div>

      {/* ACTIVE GLOBAL / REGIONAL THREAT RADAR */}
      {threatClusters.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-rose-600" />
            Detected Cross-Border & Regional Epidemic Radar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {globalThreats.map((gt, idx) => (
              <div
                key={`gt-${idx}`}
                className="bg-rose-50/80 border-2 border-rose-200 rounded-2xl p-4 space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                    🚨 Active Cross-Border / Global Threat
                  </span>
                  <span className="text-xs font-bold text-rose-800">
                    {gt.total_reports} Farm Reports ({gt.countries_affected.length} Nations)
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {gt.challenge_type} on {gt.crop_affected}
                </h4>
                <p className="text-xs text-rose-950 leading-relaxed font-medium">
                  {gt.summary_advisory}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-bold text-rose-900">
                  <span>Countries affected:</span>
                  {gt.countries_affected.map((c) => (
                    <span key={c} className="bg-white/80 px-2 py-0.5 rounded-md border border-rose-200">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {regionalAlerts.map((ra, idx) => (
              <div
                key={`ra-${idx}`}
                className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-600 text-white">
                    ⚠️ Regional Multi-Town Alert
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    {ra.total_reports} Reports
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  {ra.challenge_type} on {ra.crop_affected}
                </h4>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {ra.summary_advisory}
                </p>
                <div className="flex flex-wrap gap-1 text-[11px] font-semibold text-amber-900 pt-1">
                  <span>Clusters in:</span>
                  {ra.towns_affected.map((t) => (
                    <span key={t} className="bg-white/70 px-1.5 py-0.5 rounded border border-amber-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TWO COLUMN WORKFLOW: SUBMIT FORM & LIVE COMMUNITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
        {/* LEFT COLUMN: REPORT CHALLENGE FORM (5 COLS) */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Report Your Field Challenge
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Currently logging for <strong className="text-slate-800">{currentLocation?.town || 'Local Community'}</strong>, <strong className="text-slate-800">{currentLocation?.country || 'Ghana'}</strong>.
            </p>
          </div>

          {submitSuccess && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Thank you! Your challenge has been stored and fed into the global threat radar.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Farmer Name & Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Kwabena Mensah"
                  value={formData.farmer_name}
                  onChange={(e) => setFormData({ ...formData, farmer_name: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="For extension alerts"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Crop Affected & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Crop Affected *</label>
                <select
                  value={formData.crop_affected}
                  onChange={(e) => setFormData({ ...formData, crop_affected: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                >
                  <option value="Maize">Maize (Cereal)</option>
                  <option value="Cowpea">Cowpea / Beans</option>
                  <option value="Cassava">Cassava</option>
                  <option value="White Yam">White Yam</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Rice">Rice</option>
                  <option value="Sorghum">Sorghum</option>
                  <option value="Vegetables">Vegetables (Tomato/Pepper)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Challenge Category *</label>
                <select
                  value={formData.challenge_type}
                  onChange={(e) => setFormData({ ...formData, challenge_type: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800"
                >
                  <option value="Pest Outbreak">Pest Outbreak (e.g. Armyworm)</option>
                  <option value="Drought / Water Stress">Drought / Dry Spell</option>
                  <option value="Soil Depletion">Soil Depletion / Hardpan</option>
                  <option value="Input Cost Spikes">Fertilizer / Chemical Cost</option>
                  <option value="Disease / Blight">Disease / Leaf Blight</option>
                  <option value="Extreme Weather">Extreme Rain / Flood</option>
                </select>
              </div>
            </div>

            {/* Problem Description */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Describe the Challenge in Your Own Words *
              </label>
              <textarea
                rows={3}
                required
                placeholder="What symptoms do you observe? How much of the field is affected? Are chemical sprays working?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity Rating</label>
              <div className="grid grid-cols-3 gap-2">
                {['High / Urgent', 'Moderate', 'Emerging'].map((sev) => (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setFormData({ ...formData, severity: sev })}
                    className={`py-1.5 px-2 rounded-lg font-bold border transition-all text-center ${
                      formData.severity === sev
                        ? sev.includes('High')
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting to Network...' : 'Submit Field Report'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: LIVE COMMUNITY FEED & GLOBAL RADAR (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Live Community & Global Problem Feed
              </h3>
              <p className="text-xs text-slate-500">
                {challengesData.total_challenges} total farmer reports registered across the network.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-bold self-start sm:self-auto">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2 py-1 rounded-md transition-all ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                All Reports
              </button>
              <button
                onClick={() => setActiveFilter('global')}
                className={`px-2 py-1 rounded-md transition-all ${activeFilter === 'global' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Global / Cross-Border
              </button>
              <button
                onClick={() => setActiveFilter('current_country')}
                className={`px-2 py-1 rounded-md transition-all ${activeFilter === 'current_country' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                {currentLocation?.country || 'Local'} Only
              </button>
            </div>
          </div>

          {/* LIST OF FARMER REPORTS */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredChallenges.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
                No challenges matching current filter.
              </div>
            ) : (
              filteredChallenges.map((ch, idx) => (
                <div
                  key={ch.challenge_id || idx}
                  className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{ch.crop_affected}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {ch.challenge_type}
                      </span>
                    </div>

                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      ch.threat_scope?.includes('Global')
                        ? 'bg-rose-100 text-rose-800'
                        : ch.threat_scope?.includes('Regional')
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ch.threat_scope || 'Local'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    "{ch.description}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {ch.town}, {ch.country}
                    </span>
                    <span>{ch.farmer_name} • {new Date(ch.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
