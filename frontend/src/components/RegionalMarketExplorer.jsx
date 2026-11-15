import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Globe, Store, ArrowRight, DollarSign, Sprout,
  ShieldCheck, AlertCircle, BarChart3, Filter, MapPin, CheckCircle2,
  Calendar, Layers, RefreshCw, ExternalLink
} from 'lucide-react';
import {
  getMarketCountries,
  getMarkets,
  compareMarketPrices,
  getFaostatBenchmark
} from '../services/api';

export default function RegionalMarketExplorer() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Ghana');
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState('gh-ejura');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchCrop, setSearchCrop] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('market'); // 'market' or 'compare'
  const [comparisonData, setComparisonData] = useState(null);
  const [faostatQuery, setFaostatQuery] = useState(null);
  const [loadingFaostat, setLoadingFaostat] = useState(false);

  // Load countries on mount
  useEffect(() => {
    let mounted = true;
    getMarketCountries().then((data) => {
      if (mounted) setCountries(data || []);
    });
    return () => { mounted = false; };
  }, []);

  // Load markets when selected country changes
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getMarkets({ country: selectedCountry }).then((data) => {
      if (mounted) {
        setMarkets(data || []);
        if (data && data.length > 0) {
          setSelectedMarketId(data[0].market_id);
        }
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [selectedCountry]);

  // Load comparison data when switching to compare view
  useEffect(() => {
    if (viewMode === 'compare') {
      compareMarketPrices(['Maize', 'Cowpea', 'Soybean', 'White Yam', 'Cassava']).then((data) => {
        setComparisonData(data);
      });
    }
  }, [viewMode]);

  const activeMarket = markets.find((m) => m.market_id === selectedMarketId) || markets[0];

  const filteredProduce = (activeMarket?.produce_list || []).filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchCrop || item.crop_name.toLowerCase().includes(searchCrop.toLowerCase()) || item.primary_produce.toLowerCase().includes(searchCrop.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQueryFaostat = (cropName) => {
    setLoadingFaostat(true);
    getFaostatBenchmark(selectedCountry, cropName).then((res) => {
      setFaostatQuery(res);
      setLoadingFaostat(false);
    });
  };

  return (
    <section id="african-market-intelligence" className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-8 scroll-mt-24">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0 mt-0.5">
            <Store className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                African Regional Crop & Market Intelligence
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-700 text-white font-mono">
                West & Pan-Africa
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                UN FAOSTAT + Local Markets
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Find crops grown, local farmgate/wholesale prices, and seasonal selling windows across major African agricultural hubs.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start lg:self-auto text-xs font-semibold">
          <button
            onClick={() => setViewMode('market')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'market' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Local Market Hubs
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'compare' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pan-African Price Compare (USD)
          </button>
        </div>
      </div>

      {viewMode === 'market' ? (
        <>
          {/* COUNTRY & MARKET SELECTORS */}
          <div className="space-y-4">
            {/* Country Selector Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                1. Select African Agricultural Country
              </label>
              <div className="flex flex-wrap gap-2">
                {countries.map((c) => {
                  const isSelected = selectedCountry.toLowerCase() === c.country.toLowerCase();
                  return (
                    <button
                      key={c.country}
                      onClick={() => setSelectedCountry(c.country)}
                      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{c.country}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {c.currency}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Market Hub Selector */}
            {markets.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5">
                  2. Select Major Agricultural Market Hub / District
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {markets.map((m) => {
                    const isSelected = selectedMarketId === m.market_id;
                    return (
                      <button
                        key={m.market_id}
                        onClick={() => setSelectedMarketId(m.market_id)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{m.market_name}</span>
                          {m.fao_reporting_center && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                              FAO Hub
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{m.sub_region}</p>
                        <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{m.major_trading_days.split('(')[0]}</span>
                        </p>
                      </button>
                    );
                  })}
                </div>

                {activeMarket && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                    <p className="italic">
                      <strong className="text-slate-700">Catchment:</strong> {activeMarket.catchment_description}
                    </p>
                    <span className="shrink-0 text-slate-400 font-mono text-[11px]">
                      GPS: {activeMarket.latitude.toFixed(4)}° N, {activeMarket.longitude.toFixed(4)}° E
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CROP FILTERS & SEARCH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
              {['all', 'Cereal', 'Legume / Pulse', 'Root & Tuber'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Produce' : cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Filter by crop (e.g. Maize, Cowpea)..."
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full sm:w-64 pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* PRODUCE CARDS GRID */}
          {filteredProduce.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No produce matches your current filter.</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchCrop(''); }}
                className="mt-3 text-xs text-emerald-700 font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProduce.map((item, idx) => (
                <div
                  key={`${item.crop_name}-${idx}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Tag & Category */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        item.category.includes('Legume')
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.category.includes('Cereal')
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-purple-100 text-purple-900'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {item.market_liquidity} Liquidity
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-tight">
                      {item.crop_name}
                    </h3>
                    <p className="text-xs text-slate-400 italic mb-3">
                      {item.scientific_name} • {item.primary_produce}
                    </p>

                    {/* PRICING STAT BOX */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 mb-3.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-slate-600">Wholesale Price:</span>
                        <span className="text-base font-black text-slate-900">
                          {item.currency} {item.wholesale_price_local.toLocaleString()}{' '}
                          <span className="text-xs font-normal text-slate-500">/{item.unit}</span>
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="text-slate-500">Farmgate Price:</span>
                        <span className="font-bold text-slate-700">
                          {item.currency} {item.farmgate_price_local.toLocaleString()} /{item.unit}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">Normalized USD Price:</span>
                        <span className="font-extrabold text-emerald-700">
                          ${item.price_per_tonne_usd.toLocaleString()} / tonne
                        </span>
                      </div>
                    </div>

                    {/* TIMING & SEASONS */}
                    <div className="space-y-1.5 text-xs text-slate-600 mb-3.5">
                      <div className="flex items-start gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Peak Selling Window:</strong>{' '}
                          <span className="text-slate-600">{item.peak_price_window}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-800">Harvest Glut Dip:</strong>{' '}
                          <span className="text-slate-600">{item.harvest_dip_window}</span>
                        </div>
                      </div>
                    </div>

                    {/* AGRONOMIC & SOIL ADVANTAGE */}
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 text-xs text-emerald-900 space-y-1">
                      <p>
                        <strong>Soil Contribution:</strong> {item.soil_fertility_impact}
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        <strong>Pest Disruption:</strong> {item.faw_pest_break}
                      </p>
                    </div>
                  </div>

                  {/* BOTTOM ACTION & FAO YIELD BENCHMARK */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">FAO Benchmark Yield:</span>
                      <span className="font-bold text-slate-700">
                        {item.fao_national_yield_tonnes_ha} t/ha{' '}
                        <span className="text-emerald-700 font-semibold">(Up to {item.potential_yield_tonnes_ha} t/ha)</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleQueryFaostat(item.crop_name)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>FAO Data</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* PAN-AFRICAN PRICE COMPARISON VIEW */
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Cross-Border Agricultural Price Arbitrage (Normalized to USD / Metric Tonne)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Comparing grain and pulse prices across West and East Africa reveals where crops are valued highest and highlights trade opportunities between production basins and consumption hubs.
            </p>
          </div>

          {comparisonData && (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Crop Produce</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Market Hub</th>
                    <th className="py-3 px-4">Country</th>
                    <th className="py-3 px-4">Local Price</th>
                    <th className="py-3 px-4 bg-emerald-950 text-emerald-400">USD / Tonne</th>
                    <th className="py-3 px-4">FAO National Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonData.comparisons.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.crop_name}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {row.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 font-semibold">{row.market_name}</td>
                      <td className="py-3 px-4 text-slate-600">{row.country}</td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {row.currency} {row.wholesale_price_local.toLocaleString()} /{row.unit}
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-700 bg-emerald-50/50 font-mono">
                        ${row.price_per_tonne_usd.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{row.fao_yield_tonnes_ha} t/ha</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Economic Takeaway for Smallholder Crop Rotation:
            </h4>
            <p>
              Across West Africa (from Ghana to Nigeria and Senegal), high-protein legumes such as <strong>Cowpea ($763 - $1,100 / tonne)</strong> and <strong>Groundnut ($900 - $1,150 / tonne)</strong> consistently command <strong>2.5x to 4x higher prices per tonne</strong> than continuous cereal maize ($230 - $390 / tonne). Rotating legumes into cereal lands simultaneously maximizes cash income and eliminates synthetic nitrogen purchases.
            </p>
          </div>
        </div>
      )}

      {/* FAOSTAT LIVE QUERY MODAL / DRAWER */}
      {faostatQuery && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">
                  UN FAOSTAT Data ({faostatQuery.crop} - {faostatQuery.country})
                </h3>
              </div>
              <button
                onClick={() => setFaostatQuery(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2">
              <p>
                <strong>Source:</strong> {faostatQuery.source}
              </p>
              {faostatQuery.records_found && (
                <p>
                  <strong>Records retrieved:</strong> {faostatQuery.records_found} historical years
                </p>
              )}
              {faostatQuery.note && (
                <p className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 italic">
                  {faostatQuery.note}
                </p>
              )}
            </div>

            <button
              onClick={() => setFaostatQuery(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
