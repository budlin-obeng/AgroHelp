import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Sparkles, DollarSign, 
  Droplets, ShieldCheck, Clock, ChevronDown, ChevronUp, 
  Printer, Share2, HelpCircle 
} from 'lucide-react';
import { CropImage } from './CropVisuals';

/**
 * Localized knowledge dictionary with farmer-centric advantages, trade-offs, and planting tips.
 */
const CROP_GUIDE = {
  cowpea: {
    localName: 'Adua / Ase',
    daysToHarvest: '60 – 70 days (Fast cash turnaround)',
    advantages: [
      'Saves ~45% to 65% on fertilizer bills (puts natural nitrogen back into your soil)',
      'Starves Fall Armyworm worms completely so they cannot attack your next maize',
      'Fast harvest in just 2 months — brings quick money to your home',
    ],
    tradeoffs: [
      'Store dried beans in airtight PICS bags or sealed drums to keep out weevils',
      'Requires hand labor to pick pods as they ripen over 2 to 3 harvests',
    ],
    plantingTip: 'Plant 2 seeds per hole at 20 cm spacing along rows 60 cm apart. No chemical nitrogen fertilizer needed.',
  },
  soybean: {
    localName: 'Soybean',
    daysToHarvest: '90 – 105 days (Main season crop)',
    advantages: [
      'Very high cash demand from poultry feed buyers in Kumasi and Techiman',
      'Leaves rich organic fertilizer in the ground for your subsequent maize crop',
      'Broadleaf foliage destroys Fall Armyworm survival pathways',
    ],
    tradeoffs: [
      'Needs steady rainfall during flowering and pod filling',
      'Requires threshing sticks or community thresher machine to shell grains cleanly',
    ],
    plantingTip: 'Plant at 50 cm between rows and 10 cm between plants. Inoculate seeds before planting if new to field.',
  },
  cassava: {
    localName: 'Bankye',
    daysToHarvest: '9 – 12 months (Continuous food & cash reserve)',
    advantages: [
      'Toughest survivor: stays green and alive even when the rains stop for weeks',
      'Armyworms cannot eat cassava leaves at all (100% pest disruption)',
      'Flexible harvest: leave tubers in the ground until market prices are high',
    ],
    tradeoffs: [
      'Takes 9 to 12 months to mature, occupying your land longer',
      'Requires heavy hand digging labor to lift tubers from the soil',
    ],
    plantingTip: 'Plant healthy stem cuttings 25 cm long at a slant, spaced 1 meter by 1 meter apart.',
  },
  groundnut: {
    localName: 'Nkate / Nkatie',
    daysToHarvest: '90 – 100 days (Mid-season cash crop)',
    advantages: [
      'High price per bag in Ejura and Techiman markets',
      'Lush canopy covers the soil, cooling the ground and stopping weed growth',
      'Naturally fertilizes the soil with legume nodules',
    ],
    tradeoffs: [
      'Dry harvested pods well on clean tarpaulins to prevent damp mold',
      'Best suited for loose, sandy soil so pods lift out without breaking',
    ],
    plantingTip: 'Sow 1 seed per hole at 15 cm spacing along rows 50 cm apart. Weed early before canopy closes.',
  },
  pigeonpea: {
    localName: 'Adua Fufuo',
    daysToHarvest: '120 – 150 days (Hardy perennial hedge)',
    advantages: [
      'Deep roots go 2 meters down to break compacted soil and find water',
      'Massive fertilizer generation: fixes over 65 kg of natural nitrogen per hectare',
      'Withstands the severe dry Harmattan heat without wilting',
    ],
    tradeoffs: [
      'Takes 4 to 5 months to produce full grain yield',
      'Taller bushy growth requires wide field spacing or border planting',
    ],
    plantingTip: 'Plant along field boundaries or intercropped every 4 maize rows to act as a pest shield and windbreak.',
  },
  yam: {
    localName: 'Bayere',
    daysToHarvest: '180 – 240 days (Premium staple tuber)',
    advantages: [
      'Highest gross money per acre among traditional Ejura crops',
      'High household food security and cultural staple',
      'Deep tuber growth loosens compact soil layers',
    ],
    tradeoffs: [
      'Seed yams require high starting money to purchase',
      'Requires hard labor for making large mounds and cutting staking poles',
    ],
    plantingTip: 'Make large mounds 1 meter high, spaced 1 meter apart. Stake with strong poles to support vine growth.',
  },
  sorghum: {
    localName: 'Aburo Koko / Sorghum',
    daysToHarvest: '100 – 115 days (Drought cereal)',
    advantages: [
      'Thrives in extreme heat and low rainfall when maize withers',
      'Naturally suppresses stubborn Striga witchweed in your field',
      'Strong local market for brewing and morning porridge',
    ],
    tradeoffs: [
      'Requires bird scaring as grain heads ripen before harvest',
      'Market price per bag is usually lower than white maize',
    ],
    plantingTip: 'Sow 3 to 4 seeds per hill at 75 cm by 25 cm spacing. Thin to 2 plants per stand after 2 weeks.',
  },
  rice: {
    localName: 'Emo',
    daysToHarvest: '105 – 125 days (Valley cereal)',
    advantages: [
      'Excellent market demand in urban centers',
      'Thrives in lowland valley bottoms with heavy clay soil',
      'High harvest volume when water is adequate',
    ],
    tradeoffs: [
      'Needs consistent moisture or standing water during early growth',
      'Does not break grass-family insect cycles as cleanly as legumes',
    ],
    plantingTip: 'Best for valley plots that collect water. Dibble seeds at 20 cm by 20 cm spacing.',
  },
};

/**
 * Normalizes crop names to guide dictionary keys
 */
function getCropInfo(rawName = '') {
  const lower = rawName.toLowerCase();
  if (lower.includes('cowpea') || lower.includes('vigna')) return { key: 'cowpea', data: CROP_GUIDE.cowpea };
  if (lower.includes('soybean') || lower.includes('glycine')) return { key: 'soybean', data: CROP_GUIDE.soybean };
  if (lower.includes('cassava') || lower.includes('manihot')) return { key: 'cassava', data: CROP_GUIDE.cassava };
  if (lower.includes('groundnut') || lower.includes('peanut') || lower.includes('arachis')) return { key: 'groundnut', data: CROP_GUIDE.groundnut };
  if (lower.includes('pigeon') || lower.includes('cajanus')) return { key: 'pigeonpea', data: CROP_GUIDE.pigeonpea };
  if (lower.includes('yam') || lower.includes('dioscorea')) return { key: 'yam', data: CROP_GUIDE.yam };
  if (lower.includes('sorghum')) return { key: 'sorghum', data: CROP_GUIDE.sorghum };
  if (lower.includes('rice') || lower.includes('oryza')) return { key: 'rice', data: CROP_GUIDE.rice };
  return { key: 'cowpea', data: CROP_GUIDE.cowpea };
}

export default function ThreeSolutions({ predictions, isLoading, farmSizeHa = 2.0, currentCrop = 'Maize' }) {
  const [expandedIndex, setExpandedIndex] = useState(null); // which card has guide drawer open

  const farmSizeAcres = Math.round(farmSizeHa * 2.471);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-10 border-2 border-emerald-200 shadow-sm flex flex-col items-center justify-center min-h-[380px] text-center">
        <div className="relative flex items-center justify-center w-20 h-20 mb-4">
          <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-2xl absolute">🌱</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">
          Finding the best 3 solutions for your farm...
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          Comparing local weather patterns, soil conditions, and pest prevention for Ejura-Sekyedumase...
        </p>
      </div>
    );
  }

  const rawRecs = predictions?.recommendations || [];

  if (rawRecs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border-2 border-slate-200 text-center">
        <p className="text-base text-slate-600 font-bold">
          No crop options found. Tap one of the questions above to refresh.
        </p>
      </div>
    );
  }

  // =========================================================================
  // EXTRACT EXACTLY THREE DISTINCT SOLUTIONS
  // Solution 1: Best Overall (ranked #1 by suitability)
  // Solution 2: Commercial Income (highest gross margin among remaining)
  // Solution 3: Drought Shield (highest drought resilience among remaining)
  // =========================================================================
  const sol1 = rawRecs[0];

  const poolAfter1 = rawRecs.filter((r) => r.crop_name !== sol1.crop_name);
  
  // Sort pool by expected gross margin descending
  const incomeSorted = [...poolAfter1].sort(
    (a, b) => (b.expected_gross_margin_ghs_ha || 0) - (a.expected_gross_margin_ghs_ha || 0)
  );
  const sol2 = incomeSorted[0] || rawRecs[1] || sol1;

  const poolAfter2 = poolAfter1.filter((r) => r.crop_name !== sol2.crop_name);
  
  // Sort remaining by drought resilience descending
  const droughtSorted = [...poolAfter2].sort(
    (a, b) => (b.drought_resilience_score || 0) - (a.drought_resilience_score || 0)
  );
  const sol3 = droughtSorted[0] || poolAfter1[1] || rawRecs[2] || sol2;

  const solutions = [
    {
      slotTitle: 'Solution 1: Best Overall',
      slotBadge: 'Recommended Choice',
      badgeClass: 'bg-emerald-600 text-white',
      accentBorder: 'border-emerald-500 ring-4 ring-emerald-100',
      headerBg: 'bg-emerald-800 text-white',
      subCaption: 'Best balance to heal your soil, stop armyworms, and give a healthy harvest',
      rec: sol1,
    },
    {
      slotTitle: 'Solution 2: Commercial Income',
      slotBadge: 'Highest Market Cash',
      badgeClass: 'bg-amber-500 text-slate-950',
      accentBorder: 'border-amber-400 ring-4 ring-amber-100',
      headerBg: 'bg-amber-600 text-white',
      subCaption: 'Top commercial earnings for wholesale market buyers and grain traders',
      rec: sol2,
    },
    {
      slotTitle: 'Solution 3: Drought Shield',
      slotBadge: 'Toughest in Dry Weather',
      badgeClass: 'bg-sky-600 text-white',
      accentBorder: 'border-sky-400 ring-4 ring-sky-100',
      headerBg: 'bg-sky-800 text-white',
      subCaption: 'Withstands irregular rains, mid-season dry spells, and hot sunshine',
      rec: sol3,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Friendly Section Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Your 3 Best Crop Rotation Solutions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
            Based on your field in Ejura, rotating after <strong className="text-amber-300">{currentCrop}</strong> on{' '}
            <strong className="text-amber-300">{predictions?.soil_type || 'Sandy Loam'}</strong> soil.
            Pick the one that fits your household best:
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/60 px-4 py-2 rounded-2xl text-xs font-bold text-emerald-200 self-start md:self-auto">
          <span>Plot Size:</span>
          <span className="text-amber-300 font-extrabold">{farmSizeAcres} Acres (~{farmSizeHa} Ha)</span>
        </div>
      </div>

      {/* Exactly Three Solution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {solutions.map((item, idx) => {
          const rec = item.rec;
          const { key, data } = getCropInfo(rec.crop_name);
          const isDrawerOpen = expandedIndex === idx;

          // Estimated total gross money for the farmer's plot
          const estimatedMargin = Math.round(rec.expected_gross_margin_ghs_ha * farmSizeHa);
          const formattedMoney = estimatedMargin.toLocaleString('en-US');

          // Clean simple crop title
          const cleanCropName = rec.crop_name.split('(')[0].trim();

          return (
            <div
              key={item.slotTitle}
              className={`bg-white rounded-3xl border-2 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${item.accentBorder}`}
            >
              {/* Card Banner */}
              <div>
                <div className={`${item.headerBg} px-5 py-3.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-wide">
                      {item.slotTitle}
                    </span>
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${item.badgeClass}`}>
                    {item.slotBadge}
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {/* Top: Crop Illustration & Name */}
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 rounded-2xl p-2 border border-slate-200 shrink-0 flex items-center justify-center shadow-inner">
                      <CropImage
                        name={key}
                        className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-sm"
                        alt={cleanCropName}
                      />
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                        {cleanCropName}
                      </h3>
                      <span className="inline-block text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                        Local: {data.localName}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {item.subCaption}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Time Metrics (Farmer Friendly) */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-center">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Estimated Harvest Sales
                      </span>
                      <span className="text-base sm:text-lg font-black text-emerald-700 block mt-0.5">
                        ~GH₵ {formattedMoney}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        for your {farmSizeAcres} acres
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Growing Period
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-800 block mt-1">
                        {data.daysToHarvest.split('(')[0]}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Quick rotation
                      </span>
                    </div>
                  </div>

                  {/* ADVANTAGES LIST (Large, Clean Checkmarks) */}
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Key Advantages for You
                    </h4>
                    <ul className="space-y-2">
                      {data.advantages.map((adv, aIdx) => (
                        <li key={aIdx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5 font-bold text-[10px]">
                            ✓
                          </span>
                          <span className="leading-snug">{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* TRADE-OFFS / THINGS TO KNOW */}
                  <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Things to Know / Trade-offs
                    </h4>
                    <ul className="space-y-1.5">
                      {data.tradeoffs.map((t, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2 text-xs text-amber-950">
                          <span className="text-amber-600 font-black shrink-0 mt-0.5">&bull;</span>
                          <span className="leading-snug">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Planting Guide Toggle Drawer */}
                  {isDrawerOpen && (
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2 animate-fadeIn">
                      <h5 className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-700" />
                        Practical Planting & Spacing Tip
                      </h5>
                      <p className="leading-relaxed">
                        {data.plantingTip}
                      </p>
                      <div className="pt-2 border-t border-emerald-200 text-[11px] text-emerald-800 font-medium">
                        Advisor Note: {rec.agronomic_guidance}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="p-4 sm:p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setExpandedIndex(isDrawerOpen ? null : idx)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-slate-800 hover:text-emerald-900 font-bold text-xs sm:text-sm transition"
                >
                  <span>{isDrawerOpen ? 'Hide Planting Tips' : 'Show Planting Tips'}</span>
                  {isDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helpful Companion Footer Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
              Need to share this with your local Extension Officer or farming group?
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              You can print or save this advice sheet to take to the Ministry of Food and Agriculture (MoFA) office in Ejura.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition shadow-sm shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-200" />
          <span>Print / Save Advice</span>
        </button>
      </div>
    </div>
  );
}
