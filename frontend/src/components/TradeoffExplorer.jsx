import React, { useState } from 'react';
import { Scale, TrendingUp, ShieldAlert, Droplets, Leaf, Award, Check, AlertTriangle, ArrowRight } from 'lucide-react';

const COMPARISON_DATA = [
  {
    name: 'Continuous Maize (Status Quo)',
    badge: 'High Risk Baseline',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    incomeScore: 68,
    soilOmScore: 22,
    fawBreakScore: 12,
    droughtScore: 48,
    fertilizerCostIndex: 100, // 100% full synthetic spend (~GHS 900/ha)
    fawVulnerability: 'Critical (Severe larval shelter in green whorls)',
    soilDegradation: 'Depleted N and depleted organic matter',
    farmerVerdict: 'Vulnerable to pest shocks and high input debts',
  },
  {
    name: 'Maize to Cowpea Rotation',
    badge: 'Optimal Nitrogen & Pest Break',
    badgeColor: 'bg-agro-100 text-agro-800 border-agro-300',
    incomeScore: 78,
    soilOmScore: 84,
    fawBreakScore: 94,
    droughtScore: 86,
    fertilizerCostIndex: 56, // 44% savings
    fawVulnerability: 'Broken (Cowpea terminates Spodoptera cycle)',
    soilDegradation: 'Restored (+42 kg N/ha biological fixation)',
    farmerVerdict: 'Fast cash turnaround, major cost reduction',
  },
  {
    name: 'Maize to Soybean Commercial',
    badge: 'High Market Value',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    incomeScore: 88,
    soilOmScore: 82,
    fawBreakScore: 91,
    droughtScore: 76,
    fertilizerCostIndex: 60, // 40% savings
    fawVulnerability: 'Broken (Broadleaf foliage kills larvae)',
    soilDegradation: 'Restored (+55 kg N/ha fixed)',
    farmerVerdict: 'Highest commercial gross margin for feed mills',
  },
  {
    name: 'Maize to Pigeonpea Buffer',
    badge: 'Maximum Soil & Drought Shield',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    incomeScore: 65,
    soilOmScore: 96,
    fawBreakScore: 96,
    droughtScore: 95,
    fertilizerCostIndex: 48, // 52% savings
    fawVulnerability: 'Terminated (Long duration non-host canopy)',
    soilDegradation: 'Exceptional (Subsoil taproot phosphorus pump)',
    farmerVerdict: 'Ultimate climate hedge against dry spells',
  },
  {
    name: 'Maize to Cassava Break',
    badge: 'Starch Security & Non-Host',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    incomeScore: 82,
    soilOmScore: 62,
    fawBreakScore: 98,
    droughtScore: 92,
    fertilizerCostIndex: 78, // 22% savings
    fawVulnerability: '100% Non-host (No FAW feeding possible)',
    soilDegradation: 'Moderate (Nutrient scavenger; covers ground)',
    farmerVerdict: 'Drought-proof insurance crop with local market',
  },
];

export default function TradeoffExplorer({ recommendations = [] }) {
  const [selectedCrop, setSelectedCrop] = useState(1); // default to Cowpea

  const activeStrategy = COMPARISON_DATA[selectedCrop];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 space-y-6">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-agro-100 text-agro-700 rounded-xl">
            <Scale className="w-5 h-5 text-agro-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Trade-off Explorer & Practice Comparator</h2>
            <p className="text-xs text-slate-500">
              Evaluate economic vs agro-ecological trade-offs across cropping practices
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-agro-800 bg-agro-50 px-3 py-1 rounded-full border border-agro-200 self-start sm:self-auto">
          Pareto Frontier Verified
        </span>
      </div>

      {/* Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {COMPARISON_DATA.map((item, idx) => (
          <button
            key={item.name}
            onClick={() => setSelectedCrop(idx)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
              selectedCrop === idx
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {item.name.replace('Maize to ', '')}
          </button>
        ))}
      </div>

      {/* Selected Practice Deep Dive Banner */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 sm:p-5 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              {activeStrategy.name}
            </h3>
            <span className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${activeStrategy.badgeColor}`}>
              {activeStrategy.badge}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Relative Fertilizer Cost</span>
            <span className={`font-mono text-base font-black ${activeStrategy.fertilizerCostIndex < 60 ? 'text-agro-600' : 'text-slate-800'}`}>
              {activeStrategy.fertilizerCostIndex}% of standard spend
            </span>
          </div>
        </div>

        {/* 4 Multi-Metric Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Income vs FAW */}
          <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Short-Term Net Income Potential
                </span>
                <span className="font-mono font-bold text-slate-900">{activeStrategy.incomeScore}/100</span>
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
                <span className="text-slate-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  Fall Armyworm (FAW) Lifecycle Interruption
                </span>
                <span className="font-mono font-bold text-rose-700">{activeStrategy.fawBreakScore}%</span>
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
          <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1">
                  <Leaf className="w-3.5 h-3.5 text-agro-600" />
                  Soil Organic Matter & Nitrogen Build
                </span>
                <span className="font-mono font-bold text-agro-700">{activeStrategy.soilOmScore}/100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-agro-500 rounded-full transition-all duration-500"
                  style={{ width: `${activeStrategy.soilOmScore}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Drought & Climate Resilience (NASA SMAP)
                </span>
                <span className="font-mono font-bold text-sky-700">{activeStrategy.droughtScore}/100</span>
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

        {/* Smallholder Agronomic Verdict */}
        <div className="mt-3.5 p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-800">Agronomic Assessment: </span>
            <span className="text-slate-600">{activeStrategy.farmerVerdict}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Ejura District Model</span>
        </div>
      </div>

      {/* Side-by-Side Trade-off Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 border border-slate-200 rounded-xl overflow-hidden">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Practice</th>
              <th className="py-2.5 px-3">Income</th>
              <th className="py-2.5 px-3">Fertilizer Spend</th>
              <th className="py-2.5 px-3">FAW Interruption</th>
              <th className="py-2.5 px-3">Drought Defense</th>
              <th className="py-2.5 px-3">Soil OM Benefit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {COMPARISON_DATA.map((row, idx) => (
              <tr
                key={row.name}
                onClick={() => setSelectedCrop(idx)}
                className={`cursor-pointer transition hover:bg-slate-50 ${
                  selectedCrop === idx ? 'bg-agro-50/60 font-semibold text-slate-900' : ''
                }`}
              >
                <td className="py-2.5 px-3 font-medium text-slate-900 flex items-center gap-1.5">
                  {selectedCrop === idx && <Check className="w-3.5 h-3.5 text-agro-600 shrink-0" />}
                  {row.name}
                </td>
                <td className="py-2.5 px-3 font-mono">{row.incomeScore}/100</td>
                <td className="py-2.5 px-3">
                  <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-bold ${row.fertilizerCostIndex <= 60 ? 'bg-agro-100 text-agro-800' : 'bg-slate-100 text-slate-700'}`}>
                    {row.fertilizerCostIndex}%
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`font-mono font-bold ${row.fawBreakScore >= 90 ? 'text-rose-600' : 'text-slate-500'}`}>
                    {row.fawBreakScore}%
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono">{row.droughtScore}/100</td>
                <td className="py-2.5 px-3 text-[11px]">{row.soilDegradation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
