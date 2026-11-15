import React from 'react';

/**
 * Image path mapping for high-contrast SVGs in /crops/
 */
export const CROP_IMAGES = {
  maize: '/crops/maize.svg',
  cowpea: '/crops/cowpea.svg',
  groundnut: '/crops/groundnut.svg',
  soybean: '/crops/soybean.svg',
  cassava: '/crops/cassava.svg',
  yam: '/crops/yam.svg',
  rice: '/crops/rice.svg',
  pigeonpea: '/crops/cowpea.svg', // Legume pod representation
  'pigeon pea': '/crops/cowpea.svg',
  sorghum: '/crops/maize.svg', // Grain stalk representation
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
  if (lower.includes('cowpea') || lower.includes('vigna')) return 'cowpea';
  if (lower.includes('soybean') || lower.includes('glycine')) return 'soybean';
  if (lower.includes('groundnut') || lower.includes('peanut') || lower.includes('arachis')) return 'groundnut';
  if (lower.includes('cassava') || lower.includes('manihot')) return 'cassava';
  if (lower.includes('yam') || lower.includes('dioscorea')) return 'yam';
  if (lower.includes('rice') || lower.includes('oryza')) return 'rice';
  if (lower.includes('pigeon') || lower.includes('cajanus')) return 'pigeonpea';
  if (lower.includes('sorghum')) return 'sorghum';
  if (lower.includes('maize') || lower.includes('corn') || lower.includes('zea')) return 'maize';
  return 'maize';
}

/**
 * Crop Image Component with graceful fallback
 */
export function CropImage({ name, className = 'w-16 h-16', alt = '' }) {
  const key = normalizeCropKey(name);
  const src = CROP_IMAGES[key] || '/crops/maize.svg';

  return (
    <img
      src={src}
      alt={alt || name}
      className={`object-contain transition-transform duration-200 ${className}`}
      loading="eager"
      onError={(e) => {
        // Fallback placeholder if missing
        e.currentTarget.onerror = null;
        e.currentTarget.src = '/crops/maize.svg';
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

export const CROP_METADATA = {
  maize: { name: 'Maize / Corn', localName: 'Aburo', family: 'Cereal Grain' },
  cowpea: { name: 'Cowpea / Beans', localName: 'Adua (Ase)', family: 'Legume' },
  groundnut: { name: 'Groundnut / Peanuts', localName: 'Nkate (Nkatie)', family: 'Legume' },
  soybean: { name: 'Soybean', localName: 'Soybean', family: 'Legume' },
  cassava: { name: 'Cassava', localName: 'Bankye', family: 'Root & Tuber' },
  yam: { name: 'Yam', localName: 'Bayer (Bayere)', family: 'Tuber' },
  rice: { name: 'Rice', localName: 'Emo', family: 'Cereal Grain' },
};

export default CropImage;
