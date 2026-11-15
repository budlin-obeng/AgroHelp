import React, { useState, useEffect, useRef } from 'react';
import {
  Sprout, HelpCircle, RefreshCw, MapPin, CheckCircle2,
  User, Sparkles, LogOut, Layers, ExternalLink, Satellite,
  CloudRain, Droplets, Sun, Activity, Store, AlertTriangle
} from 'lucide-react';

export default function Header({
  onRefresh,
  isRefreshing = false,
  farmer,
  onOpenAuthModal,
  onLogout,
  currentLocation,
  activeTab = 'farm',
  onSelectTab,
}) {
  const [open, setOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
  };

  const handleAuth = (type) => {
    if (onOpenAuthModal) onOpenAuthModal(type);
  };

  const navLink = (href, label, icon = null, onClick = null) => {
    return (
      <a
        href={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className="px-2.5 py-1.5 text-xs lg:text-sm text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg font-semibold transition-colors flex items-center gap-1.5"
      >
        {icon}
        <span>{label}</span>
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* MAIN NAV BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo & Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('farm')}
            className="flex items-center py-1 cursor-pointer focus:outline-none"
            aria-label="AgroHelp Home"
          >
            <img
              src="/logo.png"
              alt="AgroHelp - Smarter Farming. Better Harvest."
              className="h-10 sm:h-12 w-auto max-w-[190px] sm:max-w-[240px] object-contain"
            />
          </button>

          {/* NASA Partnership Badge */}
          <div className="hidden sm:flex flex-col border-l border-slate-200 pl-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#0B3D91] flex items-center gap-1">
              <Satellite className="w-3 h-3 text-[#0B3D91]" />
              NASA Space Satellites
            </span>
            <span className="text-[9px] text-slate-500 font-medium">
              10-Year Records &bull; {currentLocation?.town || farmer?.location?.district || 'Global'}
            </span>
          </div>
        </div>

        {/* Streamlined Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('farm')}
            className={`px-3 py-1.5 text-xs lg:text-sm rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'farm'
                ? 'bg-white text-emerald-800 shadow-2xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sprout className={`w-3.5 h-3.5 ${activeTab === 'farm' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Farm &amp; Advice</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('market')}
            className={`px-3 py-1.5 text-xs lg:text-sm rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'market'
                ? 'bg-white text-emerald-800 shadow-2xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Store className={`w-3.5 h-3.5 ${activeTab === 'market' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Market Prices</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('nasa')}
            className={`px-3 py-1.5 text-xs lg:text-sm rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'nasa'
                ? 'bg-white text-[#0B3D91] shadow-2xs border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Satellite className={`w-3.5 h-3.5 ${activeTab === 'nasa' ? 'text-[#0B3D91]' : 'text-slate-400'}`} />
            <span>NASA Space Data</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('alerts')}
            className={`px-3 py-1.5 text-xs lg:text-sm rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'alerts'
                ? 'bg-white text-rose-700 shadow-2xs border border-rose-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${activeTab === 'alerts' ? 'text-rose-500' : 'text-slate-400'}`} />
            <span>Threat Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setShowHelpModal(!showHelpModal)}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded-lg font-medium transition-colors flex items-center gap-1 ml-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </button>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh / Update Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
              title="Check farm advice again"
              aria-label="Check farm advice again"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}

          {/* User State */}
          {farmer ? (
            <div ref={menuRef} className="relative">
              {/* Avatar Button */}
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center text-sm font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                aria-label="Farmer profile menu"
              >
                {farmer.full_name?.charAt(0).toUpperCase() || 'K'}
              </button>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute right-0 top-12 sm:top-13 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* User Information */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-emerald-50/40">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {farmer.full_name || 'Kofi Mensah'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {farmer.phone_number} &bull; {farmer.location?.district || 'Ejura'}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Your farm record is saved</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        const el = document.getElementById('questions-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>My Farm Setup</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        const el = document.getElementById('nasa-telemetry');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
                    >
                      <Satellite className="w-4 h-4 text-[#0B3D91]" />
                      <span>NASA Rain &amp; Weather Records</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleAuth('login')}
                className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => handleAuth('register')}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Start Free
              </button>
            </>
          )}
        </div>
      </div>

      {/* Helpful Guide Drawer / Modal in Simple Ghanaian English */}
      {showHelpModal && (
        <div className="bg-slate-900 text-white border-t border-slate-800 px-4 py-5 sm:px-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base sm:text-lg font-bold text-emerald-300 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                Akwaaba! How AgroHelp and NASA Help Your Farm
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-300 hover:text-white text-xs font-bold px-3 py-1 rounded bg-slate-800 border border-slate-700"
              >
                Close &times;
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              When you plant maize on the same farm year after year, the soil gets tired and hungry. Fertilizer becomes too expensive, and armyworms keep coming back to chew your young plants.
              <strong> AgroHelp looks at 10 years of rain, sun, and soil water records from NASA satellites to tell you which crops will do well next, so you stop the worms, feed your soil for free, and make more money.</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
                <span className="font-bold text-sky-300 block mb-1">1. Rain &amp; Soil Water from NASA</span>
                <p className="text-slate-300">NASA satellites in the sky track when the rain starts and when dry spells come in {currentLocation?.town || 'your area'}, so you plant at the right time.</p>
              </div>

              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
                <span className="font-bold text-amber-300 block mb-1">2. Sun &amp; Heat Stress</span>
                <p className="text-slate-300">Satellites track extreme heat and dry spells so you don't waste seeds when the ground is too hot for tender plants.</p>
              </div>

              <div className="bg-slate-800/90 p-3.5 rounded-2xl border border-slate-700">
                <span className="font-bold text-teal-300 block mb-1">3. Clear Farm Advice</span>
                <p className="text-slate-300">We advise you on 3 good crops to rotate—like cowpea, soyabean, or cassava—to kill worms naturally and make profit.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-emerald-300 border-t border-slate-800">
              <span className="flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5 text-emerald-400" /> Powered by NASA Earth Observations for farmers across Africa &amp; globally.</span>
              <span className="font-bold text-emerald-300">Free for every farmer</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
