import React from 'react';
import { Sprout } from 'lucide-react';

/**
 * Authentic photographic crop imagery for Ejura-Sekyedumase agricultural belt
 */
export const CROP_REAL_PHOTOS = {
  maize: '/crops/maize.jpg',
  cowpea: '/crops/cowpea.jpg',
  groundnut: '/crops/groundnut.jpg',
  soybean: '/crops/soybean.jpg',
  cassava: '/crops/cassava.jpg',
  yam: '/crops/yam.jpg',
  rice: '/crops/rice.jpg',
  plantain: '/crops/plantain.jpg',
  pepper: '/crops/pepper.jpg',
  tomato: '/crops/tomato.jpg',
  pigeonpea: '/crops/pigeonpea.jpg',
  'pigeon pea': '/crops/pigeonpea.jpg',
  sorghum: '/crops/sorghum.jpg',
};

export const SOIL_IMAGES = {
  'sandy loam': '/crops/soil-sandy-loam.svg',
  'red clay': '/crops/soil-clay-loam.svg',
  'clay loam': '/crops/soil-clay-loam.svg',
  'black loam': '/crops/soil-black-earth.svg',
  'black earth': '/crops/soil-black-earth.svg',
  'loam': '/crops/soil-black-earth.svg',
};

export const GOAL_IMAGES = {
  income: '/crops/goal-income.svg',
  fertilizer: '/crops/goal-fertilizer.svg',
  pest: '/crops/goal-pest.svg',
  drought: '/crops/goal-drought.svg',
};

/**
 * Normalizes crop name to key
 */
export function normalizeCropKey(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('cowpea') || lower.includes('vigna') || lower.includes('beans') || lower.includes('adua')) return 'cowpea';
  if (lower.includes('soybean') || lower.includes('soyabean') || lower.includes('soya') || lower.includes('glycine')) return 'soybean';
  if (lower.includes('groundnut') || lower.includes('peanut') || lower.includes('arachis') || lower.includes('nkate')) return 'groundnut';
  if (lower.includes('cassava') || lower.includes('manihot') || lower.includes('bankye')) return 'cassava';
  if (lower.includes('yam') || lower.includes('dioscorea') || lower.includes('bayere') || lower.includes('bayer')) return 'yam';
  if (lower.includes('rice') || lower.includes('oryza') || lower.includes('emo')) return 'rice';
  if (lower.includes('plantain') || lower.includes('borode') || lower.includes('musa')) return 'plantain';
  if (lower.includes('pepper') || lower.includes('chili') || lower.includes('mako')) return 'pepper';
  if (lower.includes('tomato') || lower.includes('ntosi')) return 'tomato';
  if (lower.includes('pigeon') || lower.includes('cajanus')) return 'pigeonpea';
  if (lower.includes('sorghum')) return 'sorghum';
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('zea') || lower.includes('aburo')) return 'maize';
  return lower.trim();
}

/**
 * Real Photographic Crop Image Component with graceful fallback
 */
export function CropImage({ name, className = 'w-20 h-20', alt = '' }) {
  const key = normalizeCropKey(name);
  const photoSrc = CROP_REAL_PHOTOS[key];

  if (!photoSrc) {
    // Custom added crop without pre-bundled photo: display branded badge
    return (
      <div className={`rounded-2xl bg-emerald-100 border border-emerald-300 flex flex-col items-center justify-center p-2 text-emerald-900 shadow-xs ${className}`}>
        <Sprout className="w-8 h-8 text-emerald-600 mb-1" />
        <span className="text-[10px] font-black uppercase text-center truncate max-w-full">
          {name || 'Crop'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={photoSrc}
      alt={alt || `${name} crop`}
      className={`rounded-2xl object-cover shadow-xs border border-emerald-100 transition-transform duration-200 group-hover:scale-105 ${className}`}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = `/crops/${key}.svg`;
      }}
    />
  );
}

/**
 * Soil Texture Visual Component
 */
export function SoilImage({ type, className = 'w-16 h-16', alt = '' }) {
  const lower = (type || '').toLowerCase();
  let src = SOIL_IMAGES['sandy loam'];
  if (lower.includes('red') || lower.includes('clay')) src = SOIL_IMAGES['red clay'];
  else if (lower.includes('black') || lower.includes('fertile') || lower.includes('earth')) src = SOIL_IMAGES['black loam'];

  return (
    <img
      src={src}
      alt={alt || type}
      className={`object-contain transition-transform duration-200 ${className}`}
      loading="eager"
    />
  );
}

/**
 * Priority / Goal Visual Component
 */
export function GoalImage({ goal, className = 'w-16 h-16', alt = '' }) {
  const src = GOAL_IMAGES[goal] || GOAL_IMAGES.income;
  return (
    <img
      src={src}
      alt={alt || goal}
      className={`object-contain transition-transform duration-200 ${className}`}
      loading="eager"
    />
  );
}

// Aliases matching asset-designer names
export const CropVisual = ({ name, size = 64, className = '' }) => (
  <CropImage name={name} className={`w-[${size}px] h-[${size}px] ${className}`} />
);

export const SoilVisual = ({ type, size = 64, className = '' }) => (
  <SoilImage type={type} className={`w-[${size}px] h-[${size}px] ${className}`} />
);

export const GoalVisual = ({ goal, size = 64, className = '' }) => (
  <GoalImage goal={goal} className={`w-[${size}px] h-[${size}px] ${className}`} />
);
