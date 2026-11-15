import React, { useState } from 'react';
import { Sprout, HelpCircle, RefreshCw, MapPin, CheckCircle2, PhoneCall } from 'lucide-react';

export default function Header({ onRefresh, isRefreshing = false }) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm text-slate-800 shadow-xs border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-22">
          {/* Logo & Farmer Emblem */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <img
                src="/logo-icon.png"
                alt="AgroHelp Farmer Emblem"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-1 bg-emerald-50 border-2 border-emerald-500 shadow-xs object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <img
                src="/logo.png"
                alt="AgroHelp - Smarter Farming. Better Harvest."
                className="h-9 sm:h-11 w-auto max-w-[190px] sm:max-w-[260px] object-contain"
              />
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] sm:text-xs text-emerald-800 font-bold tracking-wide">
                  Farming Companion &bull; Ejura-Sekyedumase
                </span>
              </div>
            </div>
          </div>

          {/* Right Toolbar: Help & Refresh */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Friendly Location Badge */}
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-800 border border-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>Ejura, Ashanti Region</span>
            </div>

            {/* How It Works / Help Button */}
            <button
              type="button"
              onClick={() => setShowHelpModal(!showHelpModal)}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm transition shadow-xs"
              title="Click for simple farming tips"
            >
              <HelpCircle className="w-4 h-4 text-emerald-950" />
              <span>How To Use</span>
            </button>

            {/* Refresh / Update Button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition disabled:opacity-50"
                title="Update Advice"
                aria-label="Update Advice"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Guide Drawer / Modal */}
      {showHelpModal && (
        <div className="bg-emerald-950 text-white border-t border-emerald-800 px-4 py-5 sm:px-8">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-800">
              <h3 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                Welcome to AgroHelp &bull; Akwaaba!
              </h3>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-emerald-300 hover:text-white text-xs font-bold px-3 py-1 rounded bg-emerald-900 border border-emerald-700"
              >
                Close &times;
              </button>
            </div>

            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              When we plant maize year after year on the same field, the soil loses its strength, fertilizer becomes very expensive, and Fall Armyworms keep coming back to destroy our harvest. 
              <strong> AgroHelp shows you the best crops to plant next to heal your soil, save money, and harvest more food and cash.</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700">
                <span className="font-bold text-amber-300 block mb-1">Step 1: Your Current Crop</span>
                <p className="text-emerald-100">Tap the crop you currently have on your farm (like Maize, Cassava, or Yam).</p>
              </div>

              <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700">
                <span className="font-bold text-amber-300 block mb-1">Step 2: Your Goal</span>
                <p className="text-emerald-100">Tap what matters most right now: earning good cash, cutting fertilizer bills, beating worms, or surviving dry spells.</p>
              </div>

              <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700">
                <span className="font-bold text-amber-300 block mb-1">Step 3: Your 3 Solutions</span>
                <p className="text-emerald-100">See 3 practical crop choices with pictures, expected cash earnings, simple benefits, and things to know.</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-emerald-300 border-t border-emerald-800/80">
              <span>🌾 Calibrated with local farming knowledge and weather observations in Ejura.</span>
              <span className="font-bold text-amber-300">Free companion for all farmers</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
