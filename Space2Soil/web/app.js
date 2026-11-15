/**
 * Space2Soil: Interactive Agricultural Intelligence Controller
 * NASA Space Apps Challenge - Field Shift: Adapting Farms with NASA Data
 */

let appData = null;
let sensorBounds = null;
let farmGeojson = null;

let map = null;
let tileLayer = null;
let farmLayer = null;
let ndviOverlayLayer = null;
let powerGridLayer = null;
let gpmGridLayer = null;
let smapGridLayer = null;

let climatologyChartInstance = null;
let radarChartInstance = null;
let financialChartInstance = null;

let currentScenarioId = 'Scenario_1';

// Default Multi-Criteria Decision Weights (AHP Baseline)
let weights = {
  resilience: 0.30,
  soil: 0.25,
  profit: 0.25,
  nutrition: 0.20
};

// 1. Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  
  await loadDatasets();
  initClimatologyChart();
  initDecisionEngine();
  initLeafletMap();
  updateAdvisoryView();
});

// 2. Load Local Datasets
async function loadDatasets() {
  try {
    const [fullRes, boundsRes, farmRes] = await Promise.all([
      fetch('assets/space2soil_full_data.json'),
      fetch('assets/sensor_bounds.json'),
      fetch('assets/farm_boundary.geojson')
    ]);
    
    appData = await fullRes.json();
    sensorBounds = await boundsRes.json();
    farmGeojson = await farmRes.json();
    console.log('Space2Soil datasets loaded successfully:', appData);
  } catch (err) {
    console.error('Error loading JSON datasets:', err);
  }
}

// 3. Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.add('hidden');
  });
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('bg-slate-800', 'text-white', 'border', 'border-slate-600');
    btn.classList.add('text-slate-300');
  });

  const targetView = document.getElementById(`view-${tabId}`);
  const targetBtn = document.getElementById(`tab-${tabId}`);

  if (targetView) targetView.classList.remove('hidden');
  if (targetBtn) {
    targetBtn.classList.add('bg-slate-800', 'text-white', 'border', 'border-slate-600');
    targetBtn.classList.remove('text-slate-300');
  }

  // Refresh map dimensions when entering Map tab
  if (tabId === 'map-explorer' && map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }

  if (window.lucide) lucide.createIcons();
}

// 4. Climatology Mixed Chart (NASA GPM + SMAP + Landsat)
function initClimatologyChart() {
  const ctx = document.getElementById('climatologyChart');
  if (!ctx) return;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // Decadal Climatological 10-year monthly averages for Ejura, Ghana
  const rainfallData = [12.4, 38.6, 118.2, 142.5, 178.4, 212.8, 115.6, 92.4, 226.5, 194.2, 62.8, 14.5];
  const rootzoneMoisture = [0.18, 0.16, 0.22, 0.26, 0.28, 0.29, 0.25, 0.23, 0.29, 0.28, 0.22, 0.19];
  const ndviData = [0.32, 0.28, 0.42, 0.58, 0.68, 0.74, 0.69, 0.65, 0.71, 0.66, 0.48, 0.35];

  climatologyChartInstance = new Chart(ctx, {
    data: {
      labels: months,
      datasets: [
        {
          type: 'bar',
          label: 'NASA GPM IMERG Precipitation (mm)',
          data: rainfallData,
          backgroundColor: 'rgba(56, 189, 248, 0.55)',
          borderColor: '#0284c7',
          borderWidth: 1.5,
          yAxisID: 'yRainfall',
          borderRadius: 4
        },
        {
          type: 'line',
          label: 'NASA SMAP Root-Zone Moisture (m³/m³)',
          data: rootzoneMoisture,
          borderColor: '#10b981',
          backgroundColor: '#10b981',
          borderWidth: 2.5,
          pointRadius: 4,
          tension: 0.3,
          yAxisID: 'yMoisture'
        },
        {
          type: 'line',
          label: 'Landsat 8/9 Mean NDVI Canopy Vigor',
          data: ndviData,
          borderColor: '#f59e0b',
          backgroundColor: '#f59e0b',
          borderWidth: 2.5,
          borderDash: [5, 5],
          pointRadius: 4,
          tension: 0.3,
          yAxisID: 'yNdvi'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 11, family: 'Inter' } }
        },
        tooltip: {
          padding: 10,
          titleFont: { size: 12, weight: 'bold' }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        yRainfall: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Rainfall (mm)', font: { size: 11 } },
          min: 0,
          max: 260
        },
        yMoisture: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'Soil Moisture (m³/m³)', font: { size: 11 } },
          min: 0.10,
          max: 0.35,
          grid: { drawOnChartArea: false }
        },
        yNdvi: {
          type: 'linear',
          position: 'right',
          title: { display: false },
          min: 0.0,
          max: 1.0,
          display: false
        }
      }
    }
  });
}

// 5. Leaflet Map Initialization
function initLeafletMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement) return;

  const ejuraCoords = [7.3856, -1.3562];

  map = L.map('map', {
    center: ejuraCoords,
    zoom: 13,
    zoomControl: true
  });

  // Esri Satellite Basemap default
  const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  });

  const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  });

  esriSatellite.addTo(map);

  // Basemap switcher listener
  document.getElementById('basemapSelect')?.addEventListener('change', (e) => {
    if (e.target.value === 'osm') {
      map.removeLayer(esriSatellite);
      osmStandard.addTo(map);
    } else {
      map.removeLayer(osmStandard);
      esriSatellite.addTo(map);
    }
  });

  // Add 25-hectare Pilot Farm Boundary
  if (farmGeojson) {
    farmLayer = L.geoJSON(farmGeojson, {
      style: {
        color: '#22c55e',
        weight: 3,
        fillColor: '#16a34a',
        fillOpacity: 0.25,
        dashArray: '4, 4'
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`
          <div class="p-2 text-xs">
            <div class="font-bold text-slate-900 text-sm">${feature.properties.name}</div>
            <div class="text-slate-600 mt-1"><strong>District:</strong> ${feature.properties.district}</div>
            <div class="text-slate-600"><strong>Parcel Size:</strong> ${feature.properties.area_ha} Hectares</div>
            <div class="text-slate-600"><strong>Soil Class:</strong> ${feature.properties.soil_type}</div>
            <div class="text-emerald-700 font-semibold mt-1"><strong>Active System:</strong> ${feature.properties.current_rotation}</div>
          </div>
        `);
      }
    }).addTo(map);
  }

  // Add Landsat 30m NDVI Raster Overlays
  const rasterBounds = [
    [7.35185, -1.39025],
    [7.41935, -1.32215]
  ];

  ndviOverlayLayer = L.imageOverlay('assets/ndvi_major_peak.png', rasterBounds, {
    opacity: 0.85,
    interactive: true
  }).addTo(map);

  // Handle NDVI Layer Switcher Radio Buttons
  document.querySelectorAll('input[name="ndviLayer"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (ndviOverlayLayer) {
        map.removeLayer(ndviOverlayLayer);
      }
      if (e.target.value === 'major') {
        ndviOverlayLayer = L.imageOverlay('assets/ndvi_major_peak.png', rasterBounds, { opacity: 0.85 }).addTo(map);
      } else if (e.target.value === 'minor') {
        ndviOverlayLayer = L.imageOverlay('assets/ndvi_minor_peak.png', rasterBounds, { opacity: 0.85 }).addTo(map);
      } else if (e.target.value === 'dry') {
        ndviOverlayLayer = L.imageOverlay('assets/ndvi_dry_harmattan.png', rasterBounds, { opacity: 0.85 }).addTo(map);
      }
    });
  });

  // Sensor Footprint Grids
  setupSensorFootprints(ejuraCoords);
}

function setupSensorFootprints(center) {
  // NASA POWER ~50 km grid box
  const powerBounds = [[center[0] - 0.25, center[1] - 0.3125], [center[0] + 0.25, center[1] + 0.3125]];
  powerGridLayer = L.rectangle(powerBounds, {
    color: '#f59e0b',
    weight: 2,
    fillOpacity: 0.05,
    dashArray: '6, 6'
  }).bindTooltip('NASA POWER MERRA-2 Grid (~50 km × 60 km)', { sticky: true });

  // NASA GPM 10 km grid box
  const gpmBounds = [[center[0] - 0.045, center[1] - 0.045], [center[0] + 0.045, center[1] + 0.045]];
  gpmGridLayer = L.rectangle(gpmBounds, {
    color: '#0284c7',
    weight: 2,
    fillOpacity: 0.08,
    dashArray: '4, 4'
  }).bindTooltip('NASA GPM IMERG Footprint (10 km × 10 km)', { sticky: true });

  // NASA SMAP 9 km grid box
  const smapBounds = [[center[0] - 0.0405, center[1] - 0.0408], [center[0] + 0.0405, center[1] + 0.0408]];
  smapGridLayer = L.rectangle(smapBounds, {
    color: '#10b981',
    weight: 2,
    fillOpacity: 0.08,
    dashArray: '2, 4'
  }).bindTooltip('NASA SMAP Radiometer/Assimilation Grid (9 km × 9 km)', { sticky: true });

  document.getElementById('togglePowerGrid')?.addEventListener('change', (e) => {
    if (e.target.checked) powerGridLayer.addTo(map);
    else map.removeLayer(powerGridLayer);
  });
  document.getElementById('toggleGpmGrid')?.addEventListener('change', (e) => {
    if (e.target.checked) gpmGridLayer.addTo(map);
    else map.removeLayer(gpmGridLayer);
  });
  document.getElementById('toggleSmapGrid')?.addEventListener('change', (e) => {
    if (e.target.checked) smapGridLayer.addTo(map);
    else map.removeLayer(smapGridLayer);
  });
}

function centerOnFarm() {
  if (map) {
    map.flyTo([7.3856, -1.3562], 14, { duration: 1.2 });
  }
}

// 6. Recommendation Engine & Charts
function initDecisionEngine() {
  initRadarChart();
  initFinancialChart();
}

function initRadarChart() {
  const ctx = document.getElementById('radarChart');
  if (!ctx) return;

  radarChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Climate Resilience (30%)', 'Soil Regeneration (25%)', 'Economic Profit (25%)', 'Food Security (20%)'],
      datasets: [
        {
          label: 'Scenario 1 (Regenerative)',
          data: [95.7, 93.5, 100.0, 100.0],
          backgroundColor: 'rgba(16, 185, 129, 0.25)',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981',
          borderWidth: 2
        },
        {
          label: 'Scenario 2 (Commercial)',
          data: [82.3, 77.5, 100.0, 100.0],
          backgroundColor: 'rgba(2, 132, 199, 0.2)',
          borderColor: '#0284c7',
          pointBackgroundColor: '#0284c7',
          borderWidth: 2
        },
        {
          label: 'Baseline (Monoculture)',
          data: [49.2, 20.0, 51.9, 92.2],
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          borderColor: '#94a3b8',
          pointBackgroundColor: '#94a3b8',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 20, font: { size: 10 } },
          pointLabels: { font: { size: 11, weight: 'bold' } }
        }
      },
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 } } }
      }
    }
  });
}

function initFinancialChart() {
  const ctx = document.getElementById('financialChart');
  if (!ctx) return;

  financialChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Scenario 1 (Regenerative)', 'Scenario 2 (Commercial)', 'Baseline Monoculture'],
      datasets: [
        {
          label: 'Gross Revenue (GHS)',
          data: [27964.0, 43020.0, 10800.0],
          backgroundColor: 'rgba(14, 165, 233, 0.7)',
          borderRadius: 4
        },
        {
          label: 'Production Costs (GHS)',
          data: [4312.0, 7290.0, 3800.0],
          backgroundColor: 'rgba(244, 63, 94, 0.7)',
          borderRadius: 4
        },
        {
          label: 'Net Farm Profit (GHS)',
          data: [23652.0, 35730.0, 7000.0],
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: { display: true, text: 'Ghana Cedis (GHS / Hectare)', font: { size: 11 } },
          beginAtZero: true
        }
      },
      plugins: {
        legend: { position: 'top', labels: { font: { size: 11 } } }
      }
    }
  });
}

// 7. Scenario Selection Handler
function selectScenario(scenarioKey) {
  currentScenarioId = scenarioKey;

  document.querySelectorAll('.scenario-card').forEach(card => {
    card.classList.remove('border-2', 'border-emerald-500', 'bg-emerald-50/40');
    card.classList.add('border-slate-200', 'bg-white');
  });

  const selectedCard = document.getElementById(`card-${scenarioKey}`);
  if (selectedCard) {
    selectedCard.classList.remove('border-slate-200', 'bg-white');
    selectedCard.classList.add('border-2', 'border-emerald-500', 'bg-emerald-50/40');
  }

  updateAdvisoryView();
}

// 8. Update Farmer Advisory View
function updateAdvisoryView() {
  if (!appData || !appData.recommendation_cards) return;

  const cardMap = {
    'Scenario_1': appData.recommendation_cards[1],
    'Scenario_2': appData.recommendation_cards[2],
    'Baseline': appData.recommendation_cards[0]
  };

  const current = cardMap[currentScenarioId] || appData.recommendation_cards[1];

  const titleEl = document.getElementById('advisory-title');
  const stratEl = document.getElementById('advisory-strategy');
  const whyWinsEl = document.getElementById('advisory-why-wins');
  const triggersEl = document.getElementById('advisory-triggers');

  if (titleEl) titleEl.innerText = `${current.title} (${current.composite_score}/100)`;
  if (stratEl) stratEl.innerText = current.core_strategy || current.verdict;

  // Render Why It Wins / Key Evidence
  if (whyWinsEl) {
    const list = current.why_it_wins || current.nasa_evidence;
    whyWinsEl.innerHTML = list.map(item => `
      <div class="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
        <span>${item}</span>
      </div>
    `).join('');
  }

  // Render Operational NASA Triggers
  if (triggersEl) {
    if (current.nasa_decision_triggers) {
      const t = current.nasa_decision_triggers;
      triggersEl.innerHTML = `
        <div class="bg-sky-50 border border-sky-200 p-4 rounded-xl">
          <div class="font-bold text-sky-900 text-xs uppercase mb-1 flex items-center gap-1.5">
            <i data-lucide="cloud-rain" class="w-4 h-4 text-sky-600"></i>
            <span>Sowing Trigger</span>
          </div>
          <p class="text-xs text-sky-800">${t.planting_trigger}</p>
        </div>
        <div class="bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <div class="font-bold text-amber-900 text-xs uppercase mb-1 flex items-center gap-1.5">
            <i data-lucide="shield-alert" class="w-4 h-4 text-amber-600"></i>
            <span>Dry-Spell Defense</span>
          </div>
          <p class="text-xs text-amber-800">${t.dry_spell_mitigation}</p>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
          <div class="font-bold text-emerald-900 text-xs uppercase mb-1 flex items-center gap-1.5">
            <i data-lucide="clock" class="w-4 h-4 text-emerald-600"></i>
            <span>Minor Season Exit</span>
          </div>
          <p class="text-xs text-emerald-800">${t.minor_season_trigger}</p>
        </div>
      `;
    } else {
      triggersEl.innerHTML = current.agronomic_vulnerabilities.map(v => `
        <div class="bg-red-50 border border-red-200 p-4 rounded-xl">
          <div class="font-bold text-red-900 text-xs uppercase mb-1 flex items-center gap-1.5">
            <i data-lucide="alert-octagon" class="w-4 h-4 text-red-600"></i>
            <span>Vulnerability Risk</span>
          </div>
          <p class="text-xs text-red-800">${v}</p>
        </div>
      `).join('');
    }
  }

  if (window.lucide) lucide.createIcons();
}

// 9. Dynamic Custom Weight Adjuster
function recalculateCustomScores() {
  const wRes = parseFloat(document.getElementById('slider-resilience').value) / 100;
  const wSoil = parseFloat(document.getElementById('slider-soil').value) / 100;
  const wProfit = parseFloat(document.getElementById('slider-profit').value) / 100;
  const wNutri = parseFloat(document.getElementById('slider-nutrition').value) / 100;

  document.getElementById('weight-resilience-val').innerText = `${Math.round(wRes * 100)}%`;
  document.getElementById('weight-soil-val').innerText = `${Math.round(wSoil * 100)}%`;
  document.getElementById('weight-profit-val').innerText = `${Math.round(wProfit * 100)}%`;
  document.getElementById('weight-nutrition-val').innerText = `${Math.round(wNutri * 100)}%`;

  // Normalization
  const sum = wRes + wSoil + wProfit + wNutri;
  if (sum === 0) return;

  const nwRes = wRes / sum;
  const nwSoil = wSoil / sum;
  const nwProfit = wProfit / sum;
  const nwNutri = wNutri / sum;

  // Subscores from analytical model:
  // S1: Res 95.7, Soil 93.5, Profit 100, Nutri 100
  // S2: Res 82.3, Soil 77.5, Profit 100, Nutri 100
  // Base: Res 49.2, Soil 20.0, Profit 51.9, Nutri 92.2
  const s1 = (95.7 * nwRes) + (93.5 * nwSoil) + (100.0 * nwProfit) + (100.0 * nwNutri);
  const s2 = (82.3 * nwRes) + (77.5 * nwSoil) + (100.0 * nwProfit) + (100.0 * nwNutri);
  const base = (49.2 * nwRes) + (20.0 * nwSoil) + (51.9 * nwProfit) + (92.2 * nwNutri);

  const card1 = document.querySelector('#card-Scenario_1 .text-2xl');
  const card2 = document.querySelector('#card-Scenario_2 .text-2xl');
  const cardBase = document.querySelector('#card-Baseline .text-2xl');

  if (card1) card1.innerHTML = `${s1.toFixed(1)} <span class="text-xs font-semibold text-slate-500">/ 100</span>`;
  if (card2) card2.innerHTML = `${s2.toFixed(1)} <span class="text-xs font-semibold text-slate-500">/ 100</span>`;
  if (cardBase) cardBase.innerHTML = `${base.toFixed(1)} <span class="text-xs font-semibold text-slate-500">/ 100</span>`;
}

function resetWeights() {
  document.getElementById('slider-resilience').value = 30;
  document.getElementById('slider-soil').value = 25;
  document.getElementById('slider-profit').value = 25;
  document.getElementById('slider-nutrition').value = 20;
  recalculateCustomScores();
}

// ============================================================
// 10. What-If Climate Scenario Simulator
// ============================================================

const baselineMonthlyRainfall = [12.4, 38.6, 118.2, 142.5, 178.4, 212.8, 115.6, 92.4, 226.5, 194.2, 62.8, 14.5];

const CROP_PARAMS = {
  Maize:   { tempThreshold: 25, tempSensitivity: -8,  droughtSensitivity: -6  },
  Cassava: { tempThreshold: 30, tempSensitivity: -3,  droughtSensitivity: -2  },
  Cowpea:  { tempThreshold: 28, tempSensitivity: -5,  droughtSensitivity: -4  },
  Yam:     { tempThreshold: 28, tempSensitivity: -6,  droughtSensitivity: -5  },
  Soybean: { tempThreshold: 27, tempSensitivity: -7,  droughtSensitivity: -5  }
};

// Baseline current temperature at Ejura
const BASE_TEMP_C = 26.83;

let whatifChartInstance = null;

function runWhatIfSimulation() {
  const tempChange     = parseFloat(document.getElementById('wi-temp').value);
  const rainfallPct    = parseFloat(document.getElementById('wi-rain').value);
  const co2Effect      = parseFloat(document.getElementById('wi-co2').value);
  const cropName       = document.getElementById('wi-crop').value;

  // --- Derived climate metrics ---
  const newRainfall    = +(1408.9 * (1 + rainfallPct / 100)).toFixed(1);
  const newHeatDays    = Math.max(0, Math.round(34 + tempChange * 8.5));
  const newGDD         = Math.round(2847 + tempChange * 180);

  // --- Monthly scenario rainfall ---
  const scaleFactor = 1 + rainfallPct / 100;
  const scenarioMonthly = baselineMonthlyRainfall.map(v => +(v * scaleFactor).toFixed(1));

  // --- Crop yield change ---
  const crop = CROP_PARAMS[cropName];
  const newTemp = BASE_TEMP_C + tempChange;
  const excessTemp = Math.max(0, newTemp - crop.tempThreshold);
  const tempImpact = excessTemp * crop.tempSensitivity;           // % change from heat
  const rainfallDropUnits = Math.min(0, rainfallPct) / 10;        // only negative rainfall matters for drought
  const droughtImpact = rainfallDropUnits * crop.droughtSensitivity; // % change from drought
  const totalYieldChange = +(tempImpact + droughtImpact + co2Effect).toFixed(1);

  // --- Score impact on rotation scenarios ---
  // Climate resilience sub-score drops proportionally with stress
  const climateStressFactor = Math.max(0, 1 - (Math.abs(tempChange) * 0.04 + Math.abs(rainfallPct) * 0.004));
  const baselineScores = { Scenario_1: 97.1, Scenario_2: 89.1, Baseline: 51.2 };
  const climateWeightFactor = 0.30; // 30% of score is climate resilience
  const simScores = {};
  for (const [key, score] of Object.entries(baselineScores)) {
    // Only the climate resilience portion is penalised
    const climatePortion = score * climateWeightFactor;
    const otherPortion   = score * (1 - climateWeightFactor);
    simScores[key] = +(climatePortion * climateStressFactor + otherPortion).toFixed(1);
  }

  // --- Update KPI cards ---
  _wiSetKPI('wi-kpi-rain', newRainfall.toLocaleString(), newRainfall - 1408.9, 'mm', 'wi-kpi-rain-delta');
  _wiSetKPI('wi-kpi-heat', newHeatDays, newHeatDays - 34, 'days', 'wi-kpi-heat-delta', true);
  _wiSetKPI('wi-kpi-gdd', newGDD.toLocaleString(), newGDD - 2847, 'GDD', 'wi-kpi-gdd-delta');

  const yieldEl = document.getElementById('wi-kpi-yield');
  const yieldLabel = document.getElementById('wi-kpi-yield-label');
  if (yieldEl) yieldEl.textContent = (totalYieldChange >= 0 ? '+' : '') + totalYieldChange;
  if (yieldLabel) {
    yieldLabel.textContent = cropName;
    yieldLabel.className = 'mt-1 text-xs font-semibold ' + (totalYieldChange >= 0 ? 'text-emerald-600' : 'text-red-600');
  }

  // --- Update monthly rainfall chart ---
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const ctx = document.getElementById('whatifRainfallChart');
  if (ctx) {
    if (whatifChartInstance) {
      whatifChartInstance.destroy();
    }
    whatifChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Baseline Rainfall (mm)',
            data: baselineMonthlyRainfall,
            backgroundColor: 'rgba(56, 189, 248, 0.45)',
            borderColor: '#0284c7',
            borderWidth: 1.5,
            borderRadius: 3
          },
          {
            label: `Scenario Rainfall (mm) [${rainfallPct >= 0 ? '+' : ''}${rainfallPct}%]`,
            data: scenarioMonthly,
            backgroundColor: rainfallPct >= 0 ? 'rgba(167,139,250,0.55)' : 'rgba(251,113,133,0.55)',
            borderColor: rainfallPct >= 0 ? '#7c3aed' : '#e11d48',
            borderWidth: 1.5,
            borderRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 } } },
          tooltip: { padding: 10 }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            title: { display: true, text: 'Rainfall (mm)', font: { size: 11 } },
            beginAtZero: true
          }
        }
      }
    });
  }

  // --- Impact assessment table ---
  const tableBody = document.getElementById('wi-impact-table');
  if (tableBody) {
    const rows = [
      { label: 'Scenario 1 — Regenerative Resilience', key: 'Scenario_1', color: 'emerald' },
      { label: 'Scenario 2 — Commercial Diversification', key: 'Scenario_2', color: 'sky' },
      { label: 'Baseline — Maize Monoculture', key: 'Baseline', color: 'slate' }
    ];
    tableBody.innerHTML = rows.map(r => {
      const orig = baselineScores[r.key];
      const sim  = simScores[r.key];
      const delta = +(sim - orig).toFixed(1);
      const deltaStr = (delta >= 0 ? '+' : '') + delta;
      const deltaColor = delta >= 0 ? 'text-emerald-600' : 'text-red-600';
      const sensitivity = Math.abs(delta) < 1 ? 'Low' : Math.abs(delta) < 3 ? 'Moderate' : Math.abs(delta) < 6 ? 'High' : 'Very High';
      const sensColor = Math.abs(delta) < 1 ? 'text-emerald-700 bg-emerald-50' : Math.abs(delta) < 3 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50';
      return `<tr>
        <td class="p-3 font-semibold text-slate-800">${r.label}</td>
        <td class="p-3 text-slate-600">${orig}</td>
        <td class="p-3 font-bold text-slate-900">${sim}</td>
        <td class="p-3 font-bold ${deltaColor}">${deltaStr}</td>
        <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[11px] font-bold ${sensColor}">${sensitivity}</span></td>
      </tr>`;
    }).join('');
  }

  // --- Interpretation narrative ---
  const interpEl = document.getElementById('wi-interpretation');
  if (interpEl) {
    const tempDir   = tempChange >= 0 ? `warming of +${tempChange.toFixed(1)}°C` : `cooling of ${tempChange.toFixed(1)}°C`;
    const rainDir   = rainfallPct > 0 ? `${rainfallPct}% wetter` : rainfallPct < 0 ? `${Math.abs(rainfallPct)}% drier` : 'unchanged';
    const yieldVerb = totalYieldChange >= 0 ? 'improve' : 'decline';
    const yieldAbs  = Math.abs(totalYieldChange);
    const co2Text   = co2Effect > 0 ? ` CO₂ fertilization provides a partial +${co2Effect}% yield buffer.` : '';
    const heatNote  = newHeatDays > 50 ? ` Heat stress is severe at ${newHeatDays} days/year — critically threatening maize pollination and soybean pod fill.` : newHeatDays > 34 ? ` Heat stress rises to ${newHeatDays} days/year, increasing crop thermal load.` : newHeatDays < 34 ? ` Reduced heat stress (${newHeatDays} days/year) lowers thermal load.` : ` Heat stress remains at baseline (34 days/year).`;
    const rec = totalYieldChange < -15
      ? 'Immediate adaptation is recommended: shift to deep-rooted Cassava and drought-tolerant Cowpea rotations, increase mulching, and adopt micro-dosing fertilizer strategies.'
      : totalYieldChange < 0
      ? 'Moderate adaptation is advisable: prioritize Scenario 1 (Regenerative Resilience) over monoculture, and continue monitoring NASA GPM and SMAP triggers for early-warning dry-spell response.'
      : 'The simulated climate is relatively benign for Ejura. Continue current Scenario 1 rotation practices and maintain NASA observation monitoring for interannual variability.';

    interpEl.innerHTML = `Under a scenario of <strong>${tempDir}</strong> and rainfall <strong>${rainDir}</strong> (projected annual rainfall: <strong>${newRainfall.toLocaleString()} mm</strong>), 
      NASA POWER-derived Growing Degree Days reach <strong>${newGDD.toLocaleString()} GDD</strong>.${heatNote} 
      For <strong>${cropName}</strong>, yield is projected to <strong>${yieldVerb} by ${yieldAbs}%</strong> relative to the decadal 2016–2025 baseline from NASA GPM IMERG and NASA POWER MERRA-2 data.${co2Text} 
      The climate stress factor reduces the composite rotation scores by up to <strong>${(100 - climateStressFactor * 100).toFixed(1)}%</strong> on the resilience dimension. 
      <strong>Recommendation:</strong> ${rec}`;
  }

  // Show results panel
  const resultsEl = document.getElementById('wi-results');
  if (resultsEl) resultsEl.classList.remove('hidden');

  if (window.lucide) lucide.createIcons();
}

function _wiSetKPI(valId, val, delta, unit, deltaId, higherIsBad = false) {
  const el = document.getElementById(valId);
  const dEl = document.getElementById(deltaId);
  if (el) el.textContent = typeof val === 'number' ? val.toLocaleString() : val;
  if (dEl) {
    const isPositive = delta > 0;
    const isGood = higherIsBad ? !isPositive : isPositive;
    const color = delta === 0 ? 'text-slate-500' : isGood ? 'text-emerald-600' : 'text-red-600';
    const prefix = isPositive ? '+' : '';
    dEl.textContent = delta !== 0 ? `${prefix}${typeof delta === 'number' ? delta.toFixed(1) : delta} ${unit} vs baseline` : 'No change from baseline';
    dEl.className = `mt-1 text-xs font-semibold ${color}`;
  }
}

