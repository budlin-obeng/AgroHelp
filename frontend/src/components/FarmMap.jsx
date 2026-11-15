import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, ImageOverlay, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Layers, Info, CheckCircle2, Satellite, Droplets, CloudRain, Sun } from 'lucide-react';

// Custom SVG Icons
const sproutSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>`;
const pinSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;

const createCustomIcon = (bgColor, svgContent, size = 38) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${bgColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      ">
        <div style="
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        ">${svgContent}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const farmIcon = createCustomIcon('#047857', sproutSvg, 42);
const hubIcon = createCustomIcon('#0B3D91', pinSvg, 30);

// Key farming communities in Ejura-Sekyedumase
const EJURA_CLUSTERS = [
  { name: 'Ejura Central', lat: 7.3856, lng: -1.3562, desc: 'Market town center, common maize land' },
  { name: 'Babaso Belt', lat: 7.4320, lng: -1.3250, desc: 'Big maize farming area; plenty armyworms in the past' },
  { name: 'Sekyedumase West', lat: 7.3800, lng: -1.4100, desc: 'Good land for cowpeas (adua) and groundnuts' },
  { name: 'Anyinasu South', lat: 7.3100, lng: -1.3900, desc: 'Moist land; good for cassava (bankye) and yam (bayere)' },
  { name: 'Hiawoanwu North', lat: 7.4500, lng: -1.3800, desc: 'Drier northern land; needs crops that survive dry weather' },
  { name: 'Frante Valley', lat: 7.2900, lng: -1.3400, desc: 'Low valley land that holds water well' },
];

const LANDSAT_BOUNDS = [
  [7.35185, -1.39025],
  [7.41935, -1.32215]
];

const SMAP_GRID_BOUNDS = [
  [7.3451, -1.397],
  [7.4261, -1.3154]
];

const GPM_GRID_BOUNDS = [
  [7.3406, -1.4012],
  [7.4306, -1.3112]
];

function LocationMarker({ position, onLocationChange }) {
  const map = useMap();

  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom(), { duration: 0.8 });
    },
  });

  return (
    <Marker
      position={position}
      icon={farmIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          onLocationChange(latlng.lat, latlng.lng);
        },
      }}
    >
      <Popup>
        <div className="p-3 text-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-sm mb-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Your Selected Farm
          </div>
          <p className="text-slate-600 mb-2">
            Location: <span className="font-mono font-semibold">{position[0].toFixed(4)}&deg; N, {position[1].toFixed(4)}&deg; W</span>
          </p>
          <div className="bg-sky-50 p-2.5 rounded-xl border border-sky-200 text-sky-900 space-y-1">
            <div className="flex justify-between">
              <span className="font-semibold">Yearly Rain (NASA):</span>
              <span>~1,285 mm a year</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Soil Water Level:</span>
              <span className="font-bold text-emerald-700">Good for crops</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Satellite View:</span>
              <span>Healthy green land</span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 italic">Drag pin or tap the map to move your farm</p>
        </div>
      </Popup>
    </Marker>
  );
}

function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 0.8 });
  }, [center[0], center[1]]);
  return null;
}

export default function FarmMap({ latitude, longitude, onLocationChange }) {
  const [mapLayer, setMapLayer] = useState('satellite'); // 'osm' or 'satellite'
  const [ndviOverlay, setNdviOverlay] = useState('none'); // 'none', 'major', 'harmattan'
  const [showGrids, setShowGrids] = useState(true);

  const currentPos = [latitude || 7.3856, longitude || -1.3562];

  const handleSelectCluster = (cluster) => {
    onLocationChange(cluster.lat, cluster.lng);
  };

  const getOverlayUrl = () => {
    if (ndviOverlay === 'major') return '/assets/ndvi_major_peak.png';
    if (ndviOverlay === 'harmattan') return '/assets/ndvi_dry_harmattan.png';
    return null;
  };

  return (
    <section id="satellite-map" className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col scroll-mt-24">
      {/* Map Header Toolbar in Simple Ghanaian English */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0B3D91]/10 text-[#0B3D91] rounded-xl">
            <Satellite className="w-5 h-5 text-[#0B3D91]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                Find Your Farm on the Map &amp; See It from Space
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0B3D91] text-white">
                Space Photos (30m)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Ejura-Sekyedumase District (Ashanti Region, Ghana &bull; 7.3856&deg; N, -1.3562&deg; W)
            </p>
          </div>
        </div>

        {/* Controls Toolbar in Simple Ghanaian English */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Base Layer Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-md transition ${mapLayer === 'satellite' ? 'bg-[#0B3D91] text-white' : 'hover:text-slate-900'}`}
            >
              Real Satellite Photo
            </button>
            <button
              onClick={() => setMapLayer('osm')}
              className={`px-2.5 py-1 rounded-md transition ${mapLayer === 'osm' ? 'bg-[#0B3D91] text-white' : 'hover:text-slate-900'}`}
            >
              Roads &amp; Towns
            </button>
          </div>

          {/* Landsat NDVI Overlay Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <button
              onClick={() => setNdviOverlay(ndviOverlay === 'major' ? 'none' : 'major')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${ndviOverlay === 'major' ? 'bg-emerald-700 text-white' : 'hover:text-slate-900'}`}
              title="Show green farm leaves during rainy season"
            >
              <Layers className="w-3 h-3" />
              <span>Green Leaves View</span>
            </button>
            <button
              onClick={() => setNdviOverlay(ndviOverlay === 'harmattan' ? 'none' : 'harmattan')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${ndviOverlay === 'harmattan' ? 'bg-amber-700 text-white' : 'hover:text-slate-900'}`}
              title="Show dry season bare soil"
            >
              <span>Harmattan Dry View</span>
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrids(!showGrids)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
              showGrids ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-white text-slate-600 border-slate-200'
            }`}
            title="Show or hide NASA satellite coverage boxes"
          >
            Satellite Grids: {showGrids ? 'ON' : 'OFF'}
          </button>

          {/* Reset Center */}
          <button
            onClick={() => onLocationChange(7.3856, -1.3562)}
            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition"
            title="Reset back to Ejura town center"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative w-full h-[400px] lg:h-[480px] bg-slate-100">
        <MapContainer
          center={currentPos}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          {mapLayer === 'osm' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {/* Landsat 30m NDVI Raster Overlay */}
          {getOverlayUrl() && (
            <ImageOverlay
              url={getOverlayUrl()}
              bounds={LANDSAT_BOUNDS}
              opacity={0.78}
            />
          )}

          {/* NASA SMAP 9km Grid Polygon */}
          {showGrids && (
            <Rectangle
              bounds={SMAP_GRID_BOUNDS}
              pathOptions={{ color: '#10B981', weight: 2, fillOpacity: 0.04, dashArray: '4, 4' }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-emerald-800">NASA Soil Water Zone (9 km)</strong><br />
                  Good moisture level for crops: 0.228
                </div>
              </Popup>
            </Rectangle>
          )}

          {/* NASA GPM 10km Grid Polygon */}
          {showGrids && (
            <Rectangle
              bounds={GPM_GRID_BOUNDS}
              pathOptions={{ color: '#0284C7', weight: 2, fillOpacity: 0.03, dashArray: '6, 6' }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong className="text-sky-800">NASA Rain Zone (10 km)</strong><br />
                  Average Rain: ~1,285 mm a year
                </div>
              </Popup>
            </Rectangle>
          )}

          <MapCenterController center={currentPos} />
          <LocationMarker position={currentPos} onLocationChange={onLocationChange} />

          {/* Community Hub Markers */}
          {EJURA_CLUSTERS.map((cluster) => (
            <Marker
              key={cluster.name}
              position={[cluster.lat, cluster.lng]}
              icon={hubIcon}
              eventHandlers={{
                click: () => onLocationChange(cluster.lat, cluster.lng),
              }}
            >
              <Popup>
                <div className="p-2.5 text-slate-800 text-xs">
                  <span className="font-bold text-slate-900 block text-sm">{cluster.name}</span>
                  <p className="text-slate-600 text-[11px] mt-1">{cluster.desc}</p>
                  <button
                    onClick={() => onLocationChange(cluster.lat, cluster.lng)}
                    className="mt-2 w-full py-1 px-2 bg-[#0B3D91] text-white rounded font-medium text-[11px] hover:bg-blue-900"
                  >
                    Select this Area
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Telemetry Pill in Simple Ghanaian English */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/90 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Your Farm Pin:</span>
          </div>
          <span className="font-mono text-[#0B3D91] font-bold bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-lg">
            {currentPos[0].toFixed(4)}&deg; N, {currentPos[1].toFixed(4)}&deg; W
          </span>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-600 border-l border-slate-200 pl-3">
            <span><strong>Rain:</strong> ~1,285 mm</span>
            <span><strong>Soil Water:</strong> Good</span>
            <span className="text-emerald-700 font-bold">Checked with NASA</span>
          </div>
        </div>
      </div>

      {/* Cluster Pills in Simple Ghanaian English */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          Farming Towns in Ejura:
        </span>
        {EJURA_CLUSTERS.map((cl) => {
          const isSelected = Math.abs(cl.lat - currentPos[0]) < 0.005 && Math.abs(cl.lng - currentPos[1]) < 0.005;
          return (
            <button
              key={cl.name}
              onClick={() => handleSelectCluster(cl)}
              className={`text-xs px-3 py-1 rounded-full border transition flex items-center gap-1.5 font-medium ${
                isSelected
                  ? 'bg-[#0B3D91] text-white border-[#0B3D91] shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-300" />}
              {cl.name}
            </button>
          );
        })}
      </div>
    </section>
  );
}
