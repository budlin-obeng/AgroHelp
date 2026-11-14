import React from 'react';
import { Sprout, Satellite, ExternalLink, Heart, Globe2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Project info */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-agro-700 text-white">
            <Sprout className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm">AgroHelp &bull; Space2Soil</span>
            <p className="text-[11px] text-slate-400">
              NASA Space Apps Challenge 2026 &bull; Climate-Resilient Agricultural Rotation Intelligence
            </p>
          </div>
        </div>

        {/* Pilot coordinates and missions */}
        <div className="text-center md:text-right">
          <div className="font-mono text-[11px] text-slate-600">
            Pilot Location: Ejura-Sekyedumase Municipal District (Lat 7.3856&deg; N, Lon -1.3562&deg; W)
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Powered by NASA POWER, NASA GPM IMERG, NASA SMAP, and USGS/NASA Landsat 8/9 Decadal Data
          </p>
        </div>
      </div>
    </footer>
  );
}
