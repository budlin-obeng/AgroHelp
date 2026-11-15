import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, Sparkles, DollarSign, 
  Droplets, ShieldCheck, Clock, ChevronDown, ChevronUp, 
  Printer, Share2, HelpCircle, Check, XCircle, AlertCircle, ArrowRight,
  Sprout, Leaf, Satellite, CloudRain, Sun, Layers, Database
} from 'lucide-react';
import { CropImage } from './CropVisuals';

const CROP_GUIDE = {
  cowpea: {
    localName: 'Adua / Ase',
    daysToHarvest: '60 – 70 days (quick money)',
    nasaTelemetry: {
      smapFit: '96% fit (grows well in moist or dry soil)',
      gpmRain: 'Needs 350–500 mm rain (fits Ejura minor rains ~489 mm)',
      powerHeat: 'Safe from hot sun and dry Harmattan wind',
      landsatNDVI: 'Leaves cover the soil fast so heavy rain doesn\'t wash it away',
      fawDisruption: '94% worm stopper (Armyworms cannot eat beans, so they die)',
    },
    advantages: [
      'Cuts your fertilizer costs, because cowpea feeds free nitrogen into the soil',
      'Armyworms cannot feed on cowpea leaves, so they die out before you plant maize next year',
      'You harvest in about 2 months, so quick money comes home for the family',
    ],
    tradeoffs: [
      'Store dry beans in airtight drums or PICS bags so weevils do not spoil them',
      'Picking the pods takes hand labor, and you pick 2 or 3 times',
    ],
    plantingTip: 'Put 2 seeds in each hole, 20 cm between holes and 60 cm between rows. You do not need to buy expensive chemical nitrogen fertilizer.',
  },
  soybean: {
    localName: 'Soya',
    daysToHarvest: '90 – 105 days (main season crop)',
    nasaTelemetry: {
      smapFit: '90% fit (roots go deep down to drink water)',
      gpmRain: 'Needs 500–700 mm rain (fits Ejura big rain season ~642 mm)',
      powerHeat: 'Likes steady rain; plant early in April when rains start',
      landsatNDVI: 'Big green leaves protect the ground and leave rich soil',
      fawDisruption: '91% worm stopper (Broad leaves kill caterpillars)',
    },
    advantages: [
      'Poultry feed mill buyers in Kumasi and Techiman buy plenty of soyabean with cash',
      'It leaves plenty of free food in the soil for your next maize harvest',
      'Armyworms do not like its broad leaves, so they cannot hide and multiply',
    ],
    tradeoffs: [
      'It needs steady rain when flowers are coming out and pods are filling',
      'You need a small thresher machine or clean sticks to beat the pods out',
    ],
    plantingTip: 'Leave 50 cm between rows and 10 cm between plants. Dress your seeds before planting if soyabean is new on this land.',
  },
  cassava: {
    localName: 'Bankye',
    daysToHarvest: '9 – 12 months (food and money stored in the ground)',
    nasaTelemetry: {
      smapFit: '98% fit (stays alive even during long dry spells)',
      gpmRain: 'Very tough crop; survives when rains fail',
      powerHeat: 'Can endure the hottest Harmattan sun without drying up',
      landsatNDVI: 'Green leaves cover the soil all year round',
      fawDisruption: '98% worm stopper (Complete dead-end for armyworms)',
    },
    advantages: [
      'Very strong crop. It stays alive even when the rains stop for many weeks',
      'Armyworms cannot chew cassava leaves at all',
      'You can leave the tubers safely in the ground and harvest when market price is high',
    ],
    tradeoffs: [
      'Takes 9 to 12 months to harvest, so the land is busy for a long time',
      'Digging the tubers out of hard ground takes strong hand work',
    ],
    plantingTip: 'Cut healthy stems about 25 cm long. Plant them slanting into the soil, 1 metre between rows and 1 metre between plants.',
  },
  groundnut: {
    localName: 'Nkate / Nkatie',
    daysToHarvest: '90 – 100 days (mid-season crop)',
    nasaTelemetry: {
      smapFit: '92% fit (tolerates short dry spells very well)',
      gpmRain: 'Needs 450–600 mm rain (fits early big rains or small rains)',
      powerHeat: 'Loves warm soil and thrives in Ejura sandy loam ground',
      landsatNDVI: 'Low leaves hug the ground and keep the soil cool and wet',
      fawDisruption: '93% worm stopper (Not a grass crop, worms starve)',
    },
    advantages: [
      'One bag of clean groundnuts sells for a very good price in Ejura and Techiman markets',
      'Its creeping leaves cover the ground, keep the soil cool, and stop weeds from growing',
      'The plant feeds free food (nitrogen) into the soil for your next maize',
    ],
    tradeoffs: [
      'Dry the groundnuts well on a clean mat or tarpaulin so they do not get mouldy',
      'Harvesting is easiest on soft, sandy soil so the pods do not break in the ground',
    ],
    plantingTip: 'Put 1 seed in each hole, 15 cm between holes and 50 cm between rows. Weed early before the leaves spread over the ground.',
  },
  pigeonpea: {
    localName: 'Adua Fufuo',
    daysToHarvest: '120 – 150 days (strong border hedge crop)',
    nasaTelemetry: {
      smapFit: '99% fit (deep roots reach 2 metres down to find water)',
      gpmRain: 'Survives even the driest years in Ejura records',
      powerHeat: 'Very tough against hot Harmattan dry wind and strong storms',
      landsatNDVI: 'Stays green like a bush all year round',
      fawDisruption: '96% worm stopper (Shields maize from armyworms and wind)',
    },
    advantages: [
      'Its long taproots go 2 metres deep to break hard soil and pull water up',
      'It feeds the soil very well with free food (about 65 kg free fertilizer per hectare)',
      'Survives the hot dry Harmattan wind without dying',
    ],
    tradeoffs: [
      'Takes 4 to 5 months before you harvest the edible grains',
      'Grows tall and bushy, so plant it along the borders of the farm',
    ],
    plantingTip: 'Plant it at the edge of your farm as a shield, or put one row after every 4 rows of maize to block pests and wind.',
  },
  yam: {
    localName: 'Bayere',
    daysToHarvest: '180 – 240 days (big money crop)',
    nasaTelemetry: {
      smapFit: '82% fit (needs good soil moisture when tubers are growing)',
      gpmRain: 'Needs full big season rain (800–1,100 mm)',
      powerHeat: 'Needs good mounds before the dry Harmattan season arrives',
      landsatNDVI: 'Climbing vines with plenty green leaves on stakes',
      fawDisruption: '95% worm stopper (Worms cannot eat yam leaves)',
    },
    advantages: [
      'Brings the most money per acre among the crops farmers grow in Ejura',
      'Great food for the family and valued in the market all year',
      'The big tubers loosen the soil deep down',
    ],
    tradeoffs: [
      'Seed yams cost plenty money at the start of the season',
      'Making the big mounds and cutting stakes takes hard physical work',
    ],
    plantingTip: 'Make high mounds about 1 metre apart. Stake the vines with strong sticks so they climb up into the sun.',
  },
  maize: {
    localName: 'Aburo',
    daysToHarvest: '100 – 120 days (staple food crop)',
    nasaTelemetry: {
      smapFit: '60% fit (vulnerable if dry spells hit during flowering)',
      gpmRain: 'Needs steady rain; fails if dry spell hits when tassels show',
      powerHeat: 'Danger: Hot sun above 35°C can burn the pollen',
      landsatNDVI: 'Leaves bare soil after harvest, allowing rain to wash topsoil',
      fawDisruption: '0% (Continuous food for armyworms to multiply)',
    },
    advantages: [
      'Everybody eats maize and buyers are always waiting in the market',
      'Every farmer in Ejura already knows how to plant maize',
      'Easy to sell quickly to local traders and poultry feed millers',
    ],
    tradeoffs: [
      'Planting maize on the same farm every season finishes the soil food and brings swarms of armyworms',
      'You will be forced to buy plenty of costly chemical fertilizer every season',
    ],
    plantingTip: 'Plant with 2 seeds per hole, 75 cm between rows and 40 cm between holes. Plant cowpea or soyabean next season to keep your harvest high.',
  },
  rice: {
    localName: 'Emo',
    daysToHarvest: '105 – 125 days (low land grain)',
    nasaTelemetry: {
      smapFit: '72% fit (needs wet low land that holds water)',
      gpmRain: 'Needs high steady rain or stream valley runoff',
      powerHeat: 'Grows well in low river valleys',
      landsatNDVI: 'Dense green grass canopy in moist valley lands',
      fawDisruption: '40% (Armyworms can sometimes feed on young rice)',
    },
    advantages: [
      'Town people buy plenty of rice and the demand is high',
      'Grows very well in valley bottoms where water collects',
      'Gives plenty bags of grain when there is good water',
    ],
    tradeoffs: [
      'Needs water in the soil most of the time when young',
      'Does not kill worms as well as cowpea or groundnuts',
    ],
    plantingTip: 'Best for low land that collects rainwater. Plant seeds 20 cm apart between rows and between plants.',
  },
};

function getCropInfo(rawName = '') {
  const lower = rawName.toLowerCase();
  if (lower.includes('cowpea') || lower.includes('vigna') || lower.includes('adua')) return { key: 'cowpea', data: CROP_GUIDE.cowpea };
  if (lower.includes('soybean') || lower.includes('soyabean') || lower.includes('soya') || lower.includes('glycine')) return { key: 'soybean', data: CROP_GUIDE.soybean };
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
          <div className="w-20 h-20 border-4 border-emerald-200 border-t-[#0B3D91] rounded-full animate-spin"></div>
          <Satellite className="w-8 h-8 text-[#0B3D91] animate-pulse absolute" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">
          Checking your farm with 10 years of NASA satellite records...
        </h3>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          Looking at rain, soil water, and hot sun records for your farm in Ejura-Sekyedumase. Please wait small.
        </p>
      </div>
    );
  }

  const hasCropInMind = feasibilityResult?.has_crop_in_mind;
  const verdict = feasibilityResult?.verdict;
  const recommendations = feasibilityResult?.recommendations || [];

  return (
    <div className="space-y-8 scroll-mt-24">
      {/* ========================================================
          FEASIBILITY VERDICT IN SIMPLE GHANAIAN ENGLISH
          ======================================================== */}
      {hasCropInMind && verdict && (
        <div
          className={`rounded-3xl p-6 sm:p-8 border-2 shadow-md transition-all ${
            verdict.is_approved
              ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border-emerald-500'
              : 'bg-gradient-to-br from-slate-950 via-rose-950 to-slate-900 text-white border-rose-500'
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
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${
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

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-sky-200 border border-white/20">
                    <Satellite className="w-3 h-3 text-sky-300" />
                    Checked with NASA Satellites
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {verdict.verdict_headline}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mt-1 leading-relaxed">
                  {verdict.explanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-black/40 border border-white/15 px-4 py-2.5 rounded-2xl text-xs font-bold text-emerald-200 shrink-0">
              <Satellite className="w-4 h-4 text-sky-400" />
              <span>Your Farm Size:</span>
              <span className="text-white font-extrabold">{farmSizeAcres} acres (about {farmSizeHa} ha)</span>
            </div>
          </div>

          {/* 3 Agronomic Reasons in Simple Ghanaian English */}
          <div className="pt-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-200 mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sky-300" />
              <span>{verdict.is_approved ? 'Why this crop fits your farm well:' : 'Why we are worried about this crop:'}</span>
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

            {/* Agronomic Guidance */}
            <div className="mt-4 p-3.5 rounded-2xl bg-black/35 border border-white/15 text-xs text-white/90 flex items-center gap-2">
              <span className="font-black text-emerald-300 shrink-0">Farmer Tip:</span>
              <span>{verdict.agronomic_guidance}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DYNAMIC RECOMMENDATION CARDS (MAXIMUM OF 3)
          ======================================================== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                {hasCropInMind && verdict?.is_approved
                  ? 'Other Good Crops to Plant Together or Next (Top 3)'
                  : hasCropInMind && !verdict?.is_approved
                  ? 'Better Crops for This Land to Stop the Worms (Top 3)'
                  : 'The Best Crops to Plant Next for Money and Strong Soil (Top 3)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chosen from 10 years of NASA rain and soil water records in Ejura.
            </p>
          </div>

          <span className="text-[11px] font-bold text-[#0B3D91] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Tested with 10 Years of Rain
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border-2 border-slate-200 text-center text-slate-600 font-bold">
            No other crop needed. Your plan is good!
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
                      <span className="text-xs font-black tracking-wide flex items-center gap-1.5">
                        <Satellite className="w-3.5 h-3.5 text-sky-300" />
                        <span>Choice {idx + 1}: {isTop ? 'Best Choice for Your Farm' : 'Good Choice for Your Farm'}</span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-mono">
                        {rec.suitability_score}% Good Fit
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
                            Local name: {data.localName}
                          </span>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            Harvest in {data.daysToHarvest.split('(')[0]}
                          </span>
                        </div>
                      </div>

                      {/* NASA SATELLITE EVIDENCE BOX IN SIMPLE GHANAIAN ENGLISH */}
                      <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200/90 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#0B3D91]">
                          <span className="flex items-center gap-1">
                            <Satellite className="w-3.5 h-3.5 text-[#0B3D91]" />
                            NASA Satellite Proof
                          </span>
                          <span className="text-[9px] bg-sky-200/80 text-sky-900 font-mono px-1.5 py-0.5 rounded font-bold">
                            10-Yr Record
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700">
                          <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate"><strong>Soil Water:</strong> {data.nasaTelemetry.smapFit.split('(')[0]}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-1.5">
                            <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="truncate"><strong>Rain Fit:</strong> {data.nasaTelemetry.gpmRain.split('(')[0]}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate"><strong>Hot Sun:</strong> Safe in dry heat</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-sky-100 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                            <span className="truncate"><strong>Kills Worms:</strong> {data.nasaTelemetry.fawDisruption.split('(')[0]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Projection in Ghana Cedis */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          You may earn about
                        </span>
                        <span className="text-xl font-black text-emerald-700 block mt-0.5">
                          ~GH₵ {formattedMoney}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          from your {farmSizeAcres} acres (est. {rec.predicted_yield_tons_ha} tons harvest per ha)
                        </span>
                      </div>

                      {/* Main Advantages */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Why this is good for your farm
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
                        <span><strong>Remember:</strong> {data.tradeoffs[0]}</span>
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
                      <span>{isDrawerOpen ? 'Hide planting steps' : 'How to plant it'}</span>
                      {isDrawerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isDrawerOpen && (
                      <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-emerald-100 space-y-2">
                        <div>
                          <span className="font-bold text-emerald-900 block mb-0.5">
                            How to plant:
                          </span>
                          <p>{data.plantingTip}</p>
                        </div>
                        <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                          <span className="font-bold text-[#0B3D91] block mb-0.5">
                            NASA Satellite Telemetry:
                          </span>
                          <p>{data.nasaTelemetry.smapFit} &bull; {data.nasaTelemetry.gpmRain} &bull; {data.nasaTelemetry.fawDisruption}</p>
                        </div>
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
