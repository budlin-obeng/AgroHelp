import React from 'react';
import { ArrowRight, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ onGetStarted, onExploreSolutions, farmer }) {
  return (
    <section id="hero-section" className="bg-gradient-to-b from-[#F0FDF4] via-[#FFFBEB] to-[#F8FAFC] w-full border-b border-emerald-100 overflow-hidden">
      <div className="flex flex-col md:flex-row items-center max-md:text-center justify-between py-12 md:py-18 px-6 sm:px-10 md:px-16 lg:px-24 max-w-7xl mx-auto w-full gap-10">
        
        {/* Left Column: Headline, Description & Calls to Action */}
        <div className="flex flex-col items-center md:items-start max-w-xl">
          {/* Top Pill Badge */}
          <button
            onClick={onExploreSolutions}
            type="button"
            className="mb-6 flex items-center space-x-2 border border-emerald-600 text-emerald-800 text-xs font-semibold rounded-full px-4 pr-1.5 py-1.5 bg-emerald-50/90 hover:bg-emerald-100 transition shadow-2xs group"
          >
            <span>
              NASA Earth Observations & Soil Intelligence for Ejura
            </span>
            <span className="flex items-center justify-center size-6 p-1 rounded-full bg-emerald-700 group-hover:bg-emerald-600 transition text-white">
              <svg width="14" height="11" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 6.5h14M9.5 1 15 6.5 9.5 12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {/* Main Headline */}
          <h1 className="text-slate-900 font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight leading-[1.15]">
            Smarter crop rotations for{' '}
            <span className="text-emerald-700">
              better soil & harvest
            </span>
          </h1>

          {/* Subtitle / Description */}
          <p className="mt-4 text-slate-600 max-w-lg text-sm sm:text-base leading-relaxed">
            Break the Fall Armyworm pest cycle, cut expensive chemical fertilizer bills, and discover the exact crops that thrive on your soil in Ejura-Sekyedumase.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center mt-8 gap-3.5 w-full sm:w-auto">
            <button
              onClick={onExploreSolutions}
              className="w-full sm:w-auto bg-emerald-700 text-white px-6 pr-3.5 py-3 rounded-full text-sm font-bold flex items-center justify-center space-x-2 hover:bg-emerald-600 transition shadow-md active:scale-95"
              type="button"
            >
              <span>Get Rotation Advice</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.821 11.999h13.43m0 0-6.714-6.715m6.715 6.715-6.715 6.715" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-6 py-3 rounded-full text-sm font-bold hover:bg-emerald-200 transition text-center active:scale-95"
              type="button"
            >
              {farmer ? 'View My Farm Twin' : 'Create Farm Account'}
            </button>
          </div>

          {/* Localized trust note */}
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Calibrated with decadal rainfall & local agricultural extension in Ashanti</span>
          </div>
        </div>

        {/* Right Column: 2x2 Grid of Real Photographs of Soil & Crops in Soil */}
        <div aria-label="Real photos of soils and crops planted on soils" className="mt-8 md:mt-0 grid grid-cols-2 gap-4 sm:gap-6 pb-2 shrink-0">
          
          {/* Photo 1: Rich Loam Soil Sprout */}
          <div className="relative group w-36 sm:w-44 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition duration-300 flex-shrink-0">
            <img
              alt="Rich dark fertile loam soil"
              className="w-full h-full object-cover"
              src="/crops/soil-rich-earth.jpg"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                Fertile Loam Soil
              </span>
            </div>
          </div>

          {/* Photo 2: Maize Crop in Field Soil */}
          <div className="relative group w-36 sm:w-44 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition duration-300 flex-shrink-0 mt-4 sm:mt-6">
            <img
              alt="Maize growing in farm soil"
              className="w-full h-full object-cover"
              src="/crops/crop-maize-field.jpg"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                Maize in Field Soil
              </span>
            </div>
          </div>

          {/* Photo 3: Cassava Harvest Pulled from Soil */}
          <div className="relative group w-36 sm:w-44 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition duration-300 flex-shrink-0 -mt-2">
            <img
              alt="Cassava tubers freshly dug from soil"
              className="w-full h-full object-cover"
              src="/crops/crop-harvest-soil.jpg"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                Harvested Tubers
              </span>
            </div>
          </div>

          {/* Photo 4: Sandy Loam Farm Soil Landscape */}
          <div className="relative group w-36 sm:w-44 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-lg border-2 border-white hover:scale-105 transition duration-300 flex-shrink-0 mt-2 sm:mt-4">
            <img
              alt="Sandy loam farm soil field"
              className="w-full h-full object-cover"
              src="/crops/soil-sandy-loam.jpg"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                Sandy Loam Soil
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
