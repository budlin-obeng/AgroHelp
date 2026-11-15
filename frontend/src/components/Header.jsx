import React, { useState } from 'react';
import { Sprout, HelpCircle, RefreshCw, MapPin, CheckCircle2, User, Sparkles } from 'lucide-react';

export default function Header({ onRefresh, isRefreshing = false, farmer, onOpenAuthModal }) {
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
                className="h-8 sm:h-10 w-auto max-w-[180px] sm:max-w-[240px] object-contain"
              />
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] sm:text-xs text-emerald-800 font-bold tracking-wide">
                  Farming Companion &bull; Ejura-Sekyedumase
                </span>
              </div>
            </div>
          </div>

          {/* Right Toolbar: Digital Twin Pill & Help */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Farmer Digital Twin Badge */}
            {farmer ? (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-2xl text-left transition"
                title="View / Edit your Farm Digital Twin"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                  {farmer.full_name?.charAt(0) || 'K'}
                </div>
                <div className="hidden sm:block">
                  <span className="text-xs font-black text-emerald-950 block leading-tight">
                    {farmer.full_name || 'Kofi Mensah'}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Farm Twin Synced
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition"
              >
                <User className="w-3.5 h-3.5" />
                <span>Create Farm Twin</span>
              </button>
            )}

            {/* How It Works / Help Button */}
            <button
              type="button"
              onClick={() => setShowHelpModal(!showHelpModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm transition shadow-xs"
              title="Click for simple farming tips"
            >
              <HelpCircle className="w-4 h-4 text-emerald-950" />
              <span className="hidden sm:inline">How To Use</span>
            </button>

            {/* Refresh / Update Button */}
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition disabled:opacity-50"
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
