import React from 'react';
import { Sprout, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-14 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Project info */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-800 text-white shadow-xs">
            <Sprout className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm block">
              AgroHelp &bull; Your Practical Farming Companion
            </span>
            <p className="text-[11px] text-slate-500">
              Supporting smallholder farmers in Ejura-Sekyedumase with healthy soils and better harvests.
            </p>
          </div>
        </div>

        {/* Location & Community note */}
        <div className="text-center md:text-right text-[11px]">
          <div className="flex items-center justify-center md:justify-end gap-1.5 font-bold text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ejura-Sekyedumase District, Ashanti Region, Ghana</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Built with local extension advice &bull; Akwaaba &bull; Free for all farmers
          </p>
        </div>
      </div>
    </footer>
  );
}
