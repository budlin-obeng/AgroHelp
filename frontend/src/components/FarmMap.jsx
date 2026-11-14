import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Layers, Info, CheckCircle2 } from 'lucide-react';

// Custom SVG Icons to avoid Leaflet default image 404 bundling issues
const createCustomIcon = (bgColor, iconChar, size = 38) => {
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
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: 700;
          font-size: ${size * 0.4}px;
          line-height: 1;
        ">${iconChar}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const farmIcon = createCustomIcon('#2c8744', '🌱', 42);
const hubIcon = createCustomIcon('#0B3D91', '📍', 30);

// Key farming communities and pilot clusters in Ejura-Sekyedumase
const EJURA_CLUSTERS = [
  { name: 'Ejura Central Hub', lat: 7.3856, lng: -1.3562, desc: 'Municipal market center, transitional soils, high maize density' },
  { name: 'Babaso Agrarian Belt', lat: 7.4320, lng: -1.3250, desc: 'Intensive cereal belt; high historical Fall Armyworm pressure' },
  { name: 'Sekyedumase West', lat: 7.3800, lng: -1.4100, desc: 'Savannah ochrosols; excellent legume rotation potential' },
  { name: 'Anyinasu South', lat: 7.3100, lng: -1.3900, desc: 'Moist transitional forest fringe; diversified cassava & yam' },
  { name: 'Hiawoanwu North', lat: 7.4500, lng: -1.3800, desc: 'Drier savannah border; high drought resilience priority' },
  { name: 'Frante Agricultural Basin', lat: 7.2900, lng: -1.3400, desc: 'Lower valley plain with seasonal water table variation' },
];

// Sub-component to handle map clicks for pin placement
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
          <div className="flex items-center gap-1.5 font-bold text-agro-700 text-sm mb-1">
            <MapPin className="w-4 h-4 text-agro-600" />
            Selected Farm Plot
          </div>
          <p className="text-slate-600 mb-2">
            Lat: <span className="font-mono font-semibold">{position[0].toFixed(4)}° N</span><br />
            Lon: <span className="font-mono font-semibold">{position[1].toFixed(4)}° W</span>
          </p>
          <div className="bg-agro-50 p-2 rounded border border-agro-200 text-agro-800">
            <span className="font-semibold">Agro-Ecological Zone:</span> Ejura Savannah Ochrosol<br />
            <span className="font-semibold">NASA GPM Rain (Mean):</span> 1,285 mm/yr
          </div>
          <p className="mt-2 text-[10px] text-slate-400 italic">Drag pin or click map to reposition</p>
        </div>
      </Popup>
    </Marker>
  );
}

// Controller component to smoothly fly to coordinates when updated externally
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 0.8 });
  }, [center[0], center[1]]);
  return null;
}

export default function FarmMap({ latitude, longitude, onLocationChange }) {
  const [mapLayer, setMapLayer] = useState('osm'); // 'osm' or 'satellite'
  const currentPos = [latitude || 7.3856, longitude || -1.3562];

  const handleSelectCluster = (cluster) => {
    onLocationChange(cluster.lat, cluster.lng);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Map Header Toolbar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-agro-100 text-agro-700 rounded-lg">
            <MapPin className="w-5 h-5 text-agro-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Interactive Farm Pin Locator</h3>
            <p className="text-xs text-slate-500">Ejura-Sekyedumase Municipal District (Ashanti Region, Ghana)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium text-slate-600 shadow-sm">
            <button
              onClick={() => setMapLayer('osm')}
              className={`px-2.5 py-1 rounded-md transition ${mapLayer === 'osm' ? 'bg-agro-600 text-white font-semibold' : 'hover:text-slate-900'}`}
            >
              Terrain Map
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-2.5 py-1 rounded-md transition ${mapLayer === 'satellite' ? 'bg-agro-600 text-white font-semibold' : 'hover:text-slate-900'}`}
            >
              Satellite
            </button>
          </div>

          {/* Quick Recentering to Ejura Center */}
          <button
            onClick={() => onLocationChange(7.3856, -1.3562)}
            className="p-1.5 text-slate-600 hover:text-agro-700 hover:bg-agro-50 rounded-lg border border-slate-200 transition"
            title="Reset to Ejura District Center"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Body */}
      <div className="relative w-full h-[380px] lg:h-[420px] bg-slate-100">
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
                    className="mt-2 w-full py-1 px-2 bg-agro-600 text-white rounded font-medium text-[11px] hover:bg-agro-700"
                  >
                    Select this Cluster
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Coordinates Bar */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[400] bg-white/95 backdrop-blur-sm px-3.5 py-2 rounded-xl shadow-lg border border-slate-200/80 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Farm Coordinates:
          </div>
          <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">
            {currentPos[0].toFixed(4)}° N, {currentPos[1].toFixed(4)}° W
          </span>
          <span className="text-slate-400 text-[11px] hidden sm:inline">| Click map to move farm pin</span>
        </div>
      </div>

      {/* Quick Select Cluster Pills */}
      <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          Farming Clusters:
        </span>
        {EJURA_CLUSTERS.map((cl) => {
          const isSelected = Math.abs(cl.lat - currentPos[0]) < 0.005 && Math.abs(cl.lng - currentPos[1]) < 0.005;
          return (
            <button
              key={cl.name}
              onClick={() => handleSelectCluster(cl)}
              className={`text-xs px-2.5 py-1 rounded-full border transition flex items-center gap-1 ${
                isSelected
                  ? 'bg-agro-600 text-white border-agro-600 font-medium shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {isSelected && <CheckCircle2 className="w-3 h-3" />}
              {cl.name.split(' ')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
