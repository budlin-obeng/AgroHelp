import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Sparkles, DollarSign, 
  Droplets, ShieldCheck, Clock, ChevronDown, ChevronUp, 
  Printer, Share2, HelpCircle, Check, XCircle, AlertCircle, ArrowRight,
  Sprout, Leaf
} from 'lucide-react';
import { CropImage } from './CropVisuals';

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
  maize: {
    localName: 'Aburo',
    daysToHarvest: '100 – 120 days (Field grain staple)',
    advantages: [
      'Guaranteed high household consumption and market demand across Ghana',
      'Familiar agronomy for almost all Ejura farmers',
      'Rapid sale to local aggregators and poultry millers',
    ],
    tradeoffs: [
      'Continuous planting exhausts soil nitrogen and invites Armyworms',
      'High chemical fertilizer requirement if planted without legumes',
    ],
    plantingTip: 'Plant 2 seeds per hole at 75 cm by 40 cm. Rotate with cowpea or soybean to maintain yield.',
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

function getCropInfo(rawName = '') {
  const lower = rawName.toLowerCase();
  if (lower.includes('cowpea') || lower.includes('vigna') || lower.includes('adua')) return { key: 'cowpea', data: CROP_GUIDE.cowpea };
  if (lower.includes('soybean') || lower.includes('glycine')) return { key: 'soybean', data: CROP_GUIDE.soybean };
  if (lower.includes('cassava') || lower.includes('bankye')) return { key: 'cassava', data: CROP_GUIDE.cassava };
  if (lower.includes('groundnut') || lower.includes('peanut') || lower.includes('nkate')) return { key: 'groundnut', data: CROP_GUIDE.groundnut };
  if (lower.includes('pigeon') || lower.includes('cajanus')) return { key: 'pigeonpea', data: CROP_GUIDE.pigeonpea };
  if (lower.includes('yam') || lower.includes('bayere') || lower.includes('bayer')) return { key: 'yam', data: CROP_GUIDE.yam };
  if (lower.includes('rice') || lower.includes('emo')) return { key: 'rice', data: CROP_GUIDE.rice };
  if (lower.includes('maize') || lower.includes('aburo')) return { key: 'maize', data: CROP_GUIDE.maize };
  return { key: 'cowpea', data: CROP_GUIDE.cowpea };
}

export default function ThreeSolutions({
  feasibilityResult,
  isLoading,
  farmSizeHa = 2.0,
  currentCrop = 'Maize',
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const farmSizeAcres = Math.round(farmSizeHa * 2.471);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-10 border-2 border-emerald-200 shadow-sm flex flex-col items-center justify-center min-h-[380px] text-center">
        <div className="relative flex items-center justify-center w-20 h-20 mb-4">
          <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <Sprout className="w-8 h-8 text-emerald-600 animate-pulse absolute" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">
          Running ML Engine & NASA Weather Calibration...
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          Evaluating soil texture, Fall Armyworm pest cycles, and decadal satellite observations for your farm in Ejura...
        </p>
      </div>
    );
  }

  const hasCropInMind = feasibilityResult?.has_crop_in_mind;
  const verdict = feasibilityResult?.verdict;
  const recommendations = feasibilityResult?.recommendations || [];

  return (
    <div className="space-y-8">
      {/* ========================================================
          FEASIBILITY VERDICT (When Farmer Has Crop In Mind)
          ======================================================== */}
      {hasCropInMind && verdict && (
        <div
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-md transition-all ${
            verdict.is_approved
              ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border-emerald-500'
              : 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white border-rose-500'
          }`}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/20">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Crop Photographic Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 p-1.5 border border-white/30 shadow-md shrink-0 flex items-center justify-center">
                <CropImage
                  name={verdict.crop_name}
                  className="w-full h-full object-cover rounded-xl"
                  alt={verdict.crop_name}
                />
              </div>

              <div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-xs ${
                    verdict.is_approved
                      ? 'bg-emerald-400 text-emerald-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {verdict.is_approved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-white" />
                  )}
                  <span>{verdict.verdict_badge}</span>
                </span>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {verdict.verdict_headline}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1 leading-relaxed">
                  {verdict.explanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/30 border border-white/15 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-200 shrink-0">
              <span>Your Plot:</span>
              <span className="text-emerald-300 font-extrabold">{farmSizeAcres} Acres (~{farmSizeHa} Ha)</span>
            </div>
          </div>

          {/* 3 Agronomic Reasons */}
          <div className="pt-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-200 mb-3">
              {verdict.is_approved ? 'Why This Crop Matches Your Farm:' : 'Agronomic Concerns on This Field:'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {verdict.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                    verdict.is_approved
                      ? 'bg-white/10 border-white/15 text-emerald-50'
                      : 'bg-white/10 border-white/15 text-rose-100'
                  }`}
                >
                  {verdict.is_approved ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            {/* Agronomic Guidance Pill */}
            <div className="mt-4 p-3.5 rounded-2xl bg-black/25 border border-white/15 text-xs text-white/90 flex items-center gap-2">
              <span className="font-black text-emerald-300 shrink-0">Agronomist Tip:</span>
              <span>{verdict.agronomic_guidance}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DYNAMIC RECOMMENDATION CARDS (MAXIMUM OF 3)
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {hasCropInMind && verdict?.is_approved
                  ? 'Complementary & Companion Crop Options'
                  : hasCropInMind && !verdict?.is_approved
                  ? 'Recommended Alternative Crops for This Plot (Max 3)'
                  : 'Your Top Crop Rotation Solutions (Max 3)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {hasCropInMind && verdict?.is_approved
                ? 'These companion crops pair well with your planned crop or offer secondary rotation options.'
                : hasCropInMind && !verdict?.is_approved
                ? 'These crops heal your soil, break the armyworm cycle, and protect your family income.'
                : 'Selected by the ML engine using decadal NASA weather and soil health indices.'}
            </p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border-2 border-slate-200 text-center text-slate-600 font-bold">
            No alternative crops required. Your planned crop is suitable!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {recommendations.slice(0, 3).map((rec, idx) => {
              const { key, data } = getCropInfo(rec.crop_name);
              const cleanCropName = rec.crop_name.split('(')[0].trim();
              const isDrawerOpen = expandedIndex === idx;

              const estimatedMargin = Math.round(rec.expected_gross_margin_ghs_ha * farmSizeHa);
              const formattedMoney = estimatedMargin.toLocaleString('en-US');

              const isTop = idx === 0;

              return (
                <div
                  key={rec.crop_name}
                  className={`bg-white rounded-3xl border-2 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ${
                    isTop ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header Banner */}
                    <div
                      className={`px-5 py-3.5 flex items-center justify-between ${
                        isTop ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-white'
                      }`}
                    >
                      <span className="text-sm font-black tracking-wide">
                        Option {idx + 1}: {isTop ? 'Top Recommendation' : 'Strong Alternative'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                        {rec.suitability_score}% Match
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Crop Photo & Title */}
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-inner flex items-center justify-center">
                          <CropImage
                            name={key}
                            className="w-full h-full object-cover"
                            alt={cleanCropName}
                          />
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-slate-900 leading-tight">
                            {cleanCropName}
                          </h4>
                          <span className="inline-block text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-200">
                            Local: {data.localName}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            Harvest in {data.daysToHarvest.split('(')[0]}
                          </span>
                        </div>
                      </div>

                      {/* Financial Projection */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Estimated Harvest Sales
                        </span>
                        <span className="text-lg font-black text-emerald-700 block mt-0.5">
                          ~GH₵ {formattedMoney}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          for your {farmSizeAcres} acres
                        </span>
                      </div>

                      {/* Main Advantages */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Key Benefits for Soil & Pocket
                        </span>
                        {data.advantages.slice(0, 2).map((adv, aIdx) => (
                          <div key={aIdx} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{adv}</span>
                          </div>
                        ))}
                      </div>

                      {/* Trade-off / Watch Out */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span><strong>Thing to Know:</strong> {data.tradeoffs[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Planting Tip */}
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => setExpandedIndex(isDrawerOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-950 transition"
                    >
                      <span>{isDrawerOpen ? 'Hide Planting Tip' : 'Show Planting Advice'}</span>
                      {isDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isDrawerOpen && (
                      <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-900 block mb-1">
                          Agronomic Spacing & Care:
                        </span>
                        <p>{data.plantingTip}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
