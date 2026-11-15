import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, HelpCircle, RefreshCw, MapPin, CheckCircle2, 
  User, Sparkles, LogOut, Layers, ExternalLink, HelpCircle as QuestionIcon
} from 'lucide-react';

export default function Header({ 
  onRefresh, 
  isRefreshing = false, 
  farmer, 
  onOpenAuthModal, 
  onLogout 
}) {
  const [open, setOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside (as in template)
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
    if (onLogout) {
      onLogout();
    }
  };

  const handleAuth = (type) => {
    if (onOpenAuthModal) {
      onOpenAuthModal(type);
    }
  };

  const navLink = (href, label, onClick = null) => {
    return (
      <a
        href={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        className="px-3 py-2 text-sm text-zinc-600 hover:text-emerald-800 font-medium transition-colors"
      >
        {label}
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Logo & Brand Identity */}
        <a
          href="/"
          className="flex items-center py-1"
          aria-label="AgroHelp Home"
        >
          <img
            src="/logo.png"
            alt="AgroHelp - Smarter Farming. Better Harvest."
            className="h-10 sm:h-12 w-auto max-w-[220px] sm:max-w-[280px] object-contain"
          />
        </a>

        {/* Center Navigation Links (visible when signed in or desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLink('#questions-section', 'Farm Questions')}
          {navLink('#solutions-section', 'Solutions')}
          {navLink('/Space2Soil/web/index.html', 'NASA Space2Soil')}
          {navLink('#help', 'How To Use', () => setShowHelpModal(!showHelpModal))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Refresh / Update Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-zinc-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-zinc-200 transition-colors disabled:opacity-50"
              title="Update Advice"
              aria-label="Update Advice"
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
                <div className="absolute right-0 top-12 sm:top-13 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  
                  {/* User Information */}
                  <div className="px-4 py-3 border-b border-zinc-100 bg-emerald-50/40">
                    <p className="text-sm font-bold text-zinc-900 truncate">
                      {farmer.full_name || 'Kofi Mensah'}
                    </p>

                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {farmer.phone_number} &bull; {farmer.location?.district || 'Ejura'}
                    </p>

                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Farm Digital Twin Active</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    
                    {/* My Farm Twin Profile */}
                    <button
                      type="button"
                      onClick={() => { setOpen(false); handleAuth('profile'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>My Farm Twin Profile</span>
                    </button>

                    {/* Field Questions */}
                    <a
                      href="#questions-section"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                    >
                      <Layers className="w-4 h-4 text-emerald-600" />
                      <span>Field Crops & Soil</span>
                    </a>

                    {/* Solutions */}
                    <a
                      href="#solutions-section"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                    >
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      <span>Rotation Solutions</span>
                    </a>

                    {/* Space2Soil NASA Intelligence */}
                    <a
                      href="/Space2Soil/web/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>NASA Space2Soil Portal</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </a>

                    {/* How To Use Guide */}
                    <button
                      type="button"
                      onClick={() => { setOpen(false); setShowHelpModal(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-zinc-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-left"
                    >
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                      <span>How To Use Guide</span>
                    </button>
                  </div>

                  {/* Sign Out */}
                  <div className="p-1.5 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Sign In */}
              <button
                type="button"
                onClick={() => handleAuth('login')}
                className="px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Sign In
              </button>

              {/* Get Started */}
              <button
                type="button"
                onClick={() => handleAuth('register')}
                className="px-4 py-2 rounded-xl bg-emerald-800 text-white text-sm font-medium hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Get Started
              </button>
            </>
          )}
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
                <span className="font-bold text-amber-300 block mb-1">Step 2: Have a Crop in Mind?</span>
                <p className="text-emerald-100">Tell us what you plan to plant or let our ML engine recommend the top crops based on NASA satellite data.</p>
              </div>

              <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-700">
                <span className="font-bold text-amber-300 block mb-1">Step 3: Clear Solutions</span>
                <p className="text-emerald-100">Get honest advice on whether your plan is safe or risky, with up to 3 practical alternatives.</p>
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
