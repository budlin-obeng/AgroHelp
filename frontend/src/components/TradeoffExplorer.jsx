import React, { useState } from 'react';
import { Scale, TrendingUp, ShieldAlert, Droplets, Leaf, Award, Check, AlertTriangle, ArrowRight, Satellite, CloudRain, Sun } from 'lucide-react';

const COMPARISON_DATA = [
  {
    name: 'Maize Every Year (What 88% of Farmers Do Now)',
    badge: 'High Risk • Worms & Costly Fertilizer',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    incomeScore: 68,
    soilOmScore: 22,
    fawBreakScore: 12,
    droughtScore: 48,
    fertilizerCostIndex: 100, // 100% full synthetic spend
    fawVulnerability: 'Danger (Armyworms hide in old maize and multiply)',
    soilDegradation: 'Soil gets poor and hungry (-75 kg nitrogen lost)',
    farmerVerdict: 'High debt buying fertilizer; worms eat your harvest if dry spells come',
    nasaMatch: 'Dries up when rains stop; maize tassels burn in hot sun',
  },
  {
    name: 'Maize to Cowpea Rotation (Best Choice for Ejura)',
    badge: 'Best Pick • Free Soil Food & Kills Worms',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    incomeScore: 78,
    soilOmScore: 84,
    fawBreakScore: 94,
    droughtScore: 88,
    fertilizerCostIndex: 56, // 44% savings
    fawVulnerability: 'Worms Starve (Armyworms cannot eat beans, so they die)',
    soilDegradation: 'Feeds soil (+42 kg free nitrogen for your next maize)',
    farmerVerdict: 'Quick cash in 65 days; cuts your chemical fertilizer bill by 44%',
    nasaMatch: 'Fits minor rains (Sept–Nov); roots thrive in Ejura soil water',
  },
  {
    name: 'Maize to Soyabean Commercial',
    badge: 'Commercial Cash • Feed Mill Buyers',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    incomeScore: 88,
    soilOmScore: 82,
    fawBreakScore: 91,
    droughtScore: 78,
    fertilizerCostIndex: 60, // 40% savings
    fawVulnerability: 'Worms Die (Broad leaves kill caterpillars naturally)',
    soilDegradation: 'Restored (+55 kg free nitrogen left in ground)',
    farmerVerdict: 'Highest cash sale to poultry feed buyers in Kumasi and Techiman',
    nasaMatch: 'Plant early in April to catch the big rainy season',
  },
  {
    name: 'Maize to Pigeonpea Border Buffer',
    badge: 'Deep Roots • Drought & Wind Shield',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    incomeScore: 65,
    soilOmScore: 96,
    fawBreakScore: 96,
    droughtScore: 95,
    fertilizerCostIndex: 48, // 52% savings
    fawVulnerability: 'Strong Shield (Blocks worms and stops bushfire/wind)',
    soilDegradation: 'Best soil food (+65 kg nitrogen; loosens hard ground)',
    farmerVerdict: 'Best shield against hot Harmattan wind and dry spells',
    nasaMatch: 'Taproots go 2 metres deep to drink water where other crops fail',
  },
  {
    name: 'Maize to Cassava Break',
    badge: 'Safe Food & Money in Ground',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    incomeScore: 82,
    soilOmScore: 62,
    fawBreakScore: 98,
    droughtScore: 92,
    fertilizerCostIndex: 78, // 22% savings
    fawVulnerability: 'Zero Worms (Caterpillars cannot eat cassava at all)',
    soilDegradation: 'Good (Leaves keep ground covered and shaded all year)',
    farmerVerdict: 'Tough crop; harvest when market price in Ejura is high',
    nasaMatch: 'Survives the longest dry spells recorded by NASA in 10 years',
  },
];

export default function TradeoffExplorer({ recommendations = [] }) {
  const [selectedCrop, setSelectedCrop] = useState(1); // default to Cowpea

  const activeStrategy = COMPARISON_DATA[selectedCrop];

  return (
    <section id="tradeoff-section" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6 scroll-mt-24">
      {/* Title & Description in Simple Ghanaian English */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0B3D91]/10 text-[#0B3D91] rounded-2xl shrink-0">
            <Scale className="w-6 h-6 text-[#0B3D91]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                See What You Gain: Profit, Free Soil Food, and Worm-Free Harvests
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0B3D91] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                Tested with NASA Data
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare what happens when you plant maize after maize vs rotating with beans, cassava, or groundnuts
            </p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
          <Satellite className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ejura Farm Records</span>
        </span>
      </div>

      {/* Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {COMPARISON_DATA.map((item, idx) => (
          <button
            key={item.name}
            onClick={() => setSelectedCrop(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedCrop === idx
                ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {item.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Selected Practice Deep Dive Banner */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              {activeStrategy.name}
            </h3>
            <span className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${activeStrategy.badgeColor}`}>
              {activeStrategy.badge}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Chemical Fertilizer Cost</span>
            <span className={`font-mono text-base font-black ${activeStrategy.fertilizerCostIndex < 60 ? 'text-emerald-700' : 'text-slate-800'}`}>
              {activeStrategy.fertilizerCostIndex}% of standard cost {activeStrategy.fertilizerCostIndex < 100 ? `(saves ${100 - activeStrategy.fertilizerCostIndex}%)` : '(full expensive cost)'}
            </span>
          </div>
        </div>

        {/* 4 Multi-Metric Progress Bars in Simple Ghanaian English */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Income vs FAW */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Cash Profit in Your Pocket
                </span>
                <span className="font-mono font-bold text-slate-900">{activeStrategy.incomeScore}/100 score</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeStrategy.incomeScore}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Stopping the Armyworms
                </span>
                <span className="font-mono font-bold text-rose-700">{activeStrategy.fawBreakScore}% worms killed</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeStrategy.fawBreakScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Soil Health vs Drought */}
          <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  Free Food Added to Soil (Nitrogen)
                </span>
                <span className="font-mono font-bold text-emerald-700">{activeStrategy.soilOmScore}/100 score</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${activeStrategy.soilOmScore}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Surviving Dry Spells (NASA Satellite Records)
                </span>
                <span className="font-mono font-bold text-sky-700">{activeStrategy.droughtScore}/100 tough</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeStrategy.droughtScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Smallholder Agronomic Verdict in Simple Ghanaian English */}
        <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-900">NASA Satellite &amp; Farmer Verdict: </span>
            <span className="text-[#0B3D91] font-semibold">{activeStrategy.nasaMatch} &bull; </span>
            <span className="text-slate-700">{activeStrategy.farmerVerdict}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">Ejura Weather Model</span>
        </div>
      </div>

      {/* Side-by-Side Table in Simple Ghanaian English */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border border-slate-200 rounded-2xl overflow-hidden">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3.5">Cropping Plan</th>
              <th className="py-3 px-3.5">Profit</th>
              <th className="py-3 px-3.5">Fertilizer Cost</th>
              <th className="py-3 px-3.5">Stops Worms</th>
              <th className="py-3 px-3.5">Dry Weather Defense</th>
              <th className="py-3 px-3.5">Soil Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {COMPARISON_DATA.map((row, idx) => (
              <tr
                key={row.name}
                onClick={() => setSelectedCrop(idx)}
                className={`cursor-pointer transition hover:bg-slate-50 ${
                  selectedCrop === idx ? 'bg-sky-50/70 font-semibold text-slate-900' : ''
                }`}
              >
                <td className="py-3 px-3.5 font-medium text-slate-900 flex items-center gap-1.5">
                  {selectedCrop === idx && <Check className="w-3.5 h-3.5 text-[#0B3D91] shrink-0" />}
                  {row.name.split(' (')[0]}
                </td>
                <td className="py-3 px-3.5 font-mono">{row.incomeScore}/100</td>
                <td className="py-3 px-3.5">
                  <span className={`font-mono px-2 py-0.5 rounded text-[10px] font-bold ${row.fertilizerCostIndex <= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                    {row.fertilizerCostIndex}%
                  </span>
                </td>
                <td className="py-3 px-3.5">
                  <span className={`font-mono font-bold ${row.fawBreakScore >= 90 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {row.fawBreakScore}%
                  </span>
                </td>
                <td className="py-3 px-3.5 font-mono">{row.droughtScore}/100</td>
                <td className="py-3 px-3.5 text-[11px]">{row.soilDegradation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
