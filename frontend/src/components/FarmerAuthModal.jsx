import React, { useState } from 'react';
import { User, Phone, Lock, MapPin, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, X } from 'lucide-react';

const GHANA_REGIONS = [
  'Ashanti',
  'Ahafo',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'Northern',
  'North East',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
];

const ASHANTI_DISTRICTS = [
  'Ejura-Sekyedumase',
  'Mampong Municipal',
  'Kumasi Metropolitan',
  'Asante Akim Central',
  'Offinso North',
  'Sekyere Central',
  'Afigya Kwabre North',
];

export default function FarmerAuthModal({ isOpen, onClose, onAuthSuccess, currentFarmer, initialMode = 'login' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [phoneNumber, setPhoneNumber] = useState(currentFarmer?.phone_number || '');
  const [pin, setPin] = useState('');
  const [fullName, setFullName] = useState(currentFarmer?.full_name || '');
  const [country, setCountry] = useState('Ghana');
  const [region, setRegion] = useState('Ashanti');
  const [district, setDistrict] = useState('Ejura-Sekyedumase');
  const [community, setCommunity] = useState(currentFarmer?.location?.community || 'Ejura Central');
  const [farmSize, setFarmSize] = useState(2.0);
  const [soilType, setSoilType] = useState('Sandy Loam');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync mode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsRegister(initialMode === 'register');
      setError(null);
      if (currentFarmer) {
        setPhoneNumber(currentFarmer.phone_number || '');
        setFullName(currentFarmer.full_name || '');
        if (currentFarmer.location) {
          setCountry(currentFarmer.location.country || 'Ghana');
          setRegion(currentFarmer.location.region || 'Ashanti');
          setDistrict(currentFarmer.location.district || 'Ejura-Sekyedumase');
          setCommunity(currentFarmer.location.community || 'Ejura Central');
        }
      }
    }
  }, [isOpen, initialMode, currentFarmer]);

  if (!isOpen) return null;

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const demoData = {
        phone_number: '0241234567',
        pin: '1234',
      };
      await onAuthSuccess(demoData, false);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Please enter a valid Ghana phone number (e.g. 0241234567).');
      return;
    }
    if (!pin || pin.length !== 4) {
      setError('Please enter a 4-digit PIN.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName.trim()) {
          setError('Please provide your full name.');
          setLoading(false);
          return;
        }

        const regData = {
          phone_number: phoneNumber.trim(),
          pin: pin.trim(),
          full_name: fullName.trim(),
          location: {
            country,
            region,
            district,
            community: community.trim() || 'Ejura Central',
          },
          farm_size_hectares: parseFloat(farmSize) || 2.0,
          soil_type: soilType,
          cultivated_crops: ['Maize', 'Cassava', 'Cowpea'],
        };
        await onAuthSuccess(regData, true);
      } else {
        const loginData = {
          phone_number: phoneNumber.trim(),
          pin: pin.trim(),
        };
        await onAuthSuccess(loginData, false);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden my-8">
        {/* Header & Logo */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full bg-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <img
              src="/logo-icon.png"
              alt="AgroHelp"
              className="w-12 h-12 rounded-2xl bg-white p-1 object-contain shadow-xs shrink-0"
            />
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                AgroHelp Digital Twin
              </h2>
              <p className="text-xs text-emerald-200">
                Your Personal Farm Profile & Soil Intelligence
              </p>
            </div>
          </div>

          {/* Quick Demo Button */}
          <div className="mt-4 pt-3 border-t border-emerald-700/80 flex items-center justify-between">
            <span className="text-[11px] text-emerald-200">Testing or evaluating?</span>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>1-Tap Demo: Kofi Mensah (Ejura)</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-sm font-bold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`py-3.5 text-center transition ${
              !isRegister
                ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In to Farm Twin
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`py-3.5 text-center transition ${
              isRegister
                ? 'border-b-2 border-emerald-600 text-emerald-800 bg-emerald-50/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Farm Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Registration Fields */}
          {isRegister && (
            <>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Farmer Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kofi Mensah"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Location Cascading Hierarchy: Ghana -> Region -> District */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
                <span className="font-black text-emerald-900 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Farm Location in Ghana
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Country */}
                  <div>
                    <label className="block font-bold text-[10px] text-slate-600 mb-0.5">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-[11px]"
                    >
                      <option value="Ghana">Ghana</option>
                    </select>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block font-bold text-[10px] text-slate-600 mb-0.5">Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 text-[11px]"
                    >
                      {GHANA_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r} {r === 'Ashanti' ? '(Primary Region)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block font-bold text-[10px] text-slate-600 mb-0.5">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-emerald-900 text-[11px]"
                    >
                      {ASHANTI_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d} {d === 'Ejura-Sekyedumase' ? '(Pilot Site)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="block font-bold text-[10px] text-slate-600 mb-0.5">Community / Village</label>
                  <input
                    type="text"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    placeholder="e.g. Babaso, Sekyedumase, Ejura Central"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px]"
                  />
                </div>
              </div>
            </>
          )}

          {/* Phone Number */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghanaian Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0241234567"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 font-medium"
                required
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Used to access your digital farm twin anytime
            </span>
          </div>

          {/* 4-digit PIN */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">4-Digit Security PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 font-mono tracking-widest text-center text-sm"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isRegister ? 'Create Farm Digital Twin' : 'Sign In to Farm Twin'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
