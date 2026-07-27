'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ship, Layers, Award, MapPin } from 'lucide-react';

/*
  All SVG coordinates use equirectangular projection on a 1000 × 500 canvas:
    x = (longitude + 180) / 360 * 1000
    y = (90 − latitude)  / 180 * 500
*/

interface CountryDetail {
  id: string;
  country: string;
  flag: string;
  continent: string;
  species: string;
  quality: string;
  description: string;
  image: string;
  pinX: number;
  pinY: number;
}

const COUNTRIES_DATA: CountryDetail[] = [
  {
    id: 'ecuador',
    country: 'Ecuador',
    flag: '🇪🇨',
    continent: 'South America',
    species: 'Tectona grandis (Teak)',
    quality: 'FEQ — First Export Quality',
    description:
      'Ecuadorian teak is cultivated in rich Andean river-basin soils. It features exceptionally uniform grain structure, low moisture pockets, and beautiful golden-yellow hues favoured for fine architectural panelling and luxury carpentry.',
    image:
      'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=400&q=80',
    pinX: 277,
    pinY: 256,
  },
  {
    id: 'brazil',
    country: 'Brazil',
    flag: '🇧🇷',
    continent: 'South America',
    species: 'Mato Grosso Teak',
    quality: 'Grade A Quality',
    description:
      'Sourced from certified sustainable plantations in central Brazil. Brazilian teak is highly dense and oil-rich, offering outstanding resistance to rotting, moisture and pests — highly valued for decking and outdoor applications.',
    image:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
    pinX: 347,
    pinY: 293,
  },
  {
    id: 'panama',
    country: 'Panama',
    flag: '🇵🇦',
    continent: 'Central America',
    species: 'Canal Zone Teak',
    quality: 'Grade A/B Quality',
    description:
      'Grown in the high-humidity zones of Panama, this timber features gorgeous dark grain stripes. Prized by high-end furniture designers for its rich texture and distinct decorative character.',
    image:
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=400&q=80',
    pinX: 292,
    pinY: 242,
  },
  {
    id: 'ghana',
    country: 'Ghana',
    flag: '🇬🇭',
    continent: 'West Africa',
    species: 'West African Teak',
    quality: 'Grade A FEQ',
    description:
      'Grown in the resilient dry-forest belts of Ghana, these logs have extremely low water content, reducing timber cracking risks during sawing. Excellent yield rates for South Indian sawmills.',
    image:
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80',
    pinX: 496,
    pinY: 231,
  },
  {
    id: 'tanzania',
    country: 'Tanzania',
    flag: '🇹🇿',
    continent: 'East Africa',
    species: 'East African Teak',
    quality: 'Premium Grade A',
    description:
      'Tanzanian logs offer a dense ring configuration indicating slower, more robust growth. Features deep golden-bronze colours and high natural oil content, perfect for boat manufacturing and exterior architecture.',
    image:
      'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=400&q=80',
    pinX: 597,
    pinY: 269,
  },
  {
    id: 'costarica',
    country: 'Costa Rica',
    flag: '🇨🇷',
    continent: 'Central America',
    species: 'Eco-plantation Teak',
    quality: 'Grade A Quality',
    description:
      'Grown in Costa Rica’s ideal tropical weather, this wood showcases highly consistent ring spacing, minimal heartwood knots, and beautiful golden-yellow colors. Perfect for luxury paneling and furniture.',
    image:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80',
    pinX: 270,
    pinY: 232,
  },
  {
    id: 'guatemala',
    country: 'Guatemala',
    flag: '🇬🇹',
    continent: 'Central America',
    species: 'High-soil Mountain Teak',
    quality: 'Grade A FEQ',
    description:
      'Harvested in high-nutrient soils of Central America. Guatemalan teak round logs have high oil density, beautiful bronze finishes, and outstanding resistance to moisture rot and outdoor weathering.',
    image:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    pinX: 250,
    pinY: 212,
  },
];

// Tuticorin Port (78.1°E, 8.8°N)
const DEST = { x: 717, y: 225 };

// ---------------------------------------------------------------------------
// Realistic continent outlines — equirectangular 1000×500
// Each path is a simplified but geographically faithful coastline.
// ---------------------------------------------------------------------------
const LAND: Record<string, string> = {
  // Greenland
  greenland:
    'M 252,22 L 265,14 L 282,11 L 300,13 L 315,20 L 322,32 L 320,47 L 312,60 L 296,70 L 276,74 L 258,68 L 246,55 L 244,38 Z',

  // North America (Alaska → Canada → US → Mexico → Central America)
  northAmerica:
    `M 50,94 L 38,80 L 30,66 L 32,52 L 44,45 L 60,44 L 72,40 L 86,34
     L 102,28 L 120,24 L 140,22 L 160,24 L 178,28 L 194,36 L 208,48
     L 218,62 L 224,78 L 226,94 L 222,108 L 213,118 L 200,124 L 186,126
     L 172,130 L 160,137 L 150,146 L 145,158 L 148,169 L 158,176
     L 168,180 L 172,190 L 166,204 L 156,215 L 144,224 L 130,230
     L 114,230 L 98,223 L 84,212 L 72,198 L 62,181 L 55,163
     L 50,143 L 46,122 L 46,104 Z`,

  // Central America (narrow isthmus)
  centralAmerica:
    'M 156,215 L 165,208 L 172,210 L 176,218 L 172,228 L 162,234 L 154,228 Z',

  // South America
  southAmerica:
    `M 194,238 L 208,229 L 226,224 L 244,222 L 262,225 L 278,234
     L 292,246 L 305,261 L 314,278 L 320,298 L 321,320 L 316,342
     L 307,362 L 293,380 L 275,396 L 256,408 L 238,413 L 220,409
     L 204,398 L 192,383 L 183,364 L 178,342 L 177,318 L 180,295
     L 186,272 L 192,254 Z`,

  // Iceland
  iceland:
    'M 388,62 L 396,56 L 408,54 L 418,59 L 422,68 L 416,76 L 404,80 L 393,75 L 387,66 Z',

  // Europe (Iberian + France + Germany + Scandinavia rough block)
  europe:
    `M 430,84 L 436,72 L 444,62 L 454,55 L 466,51 L 480,50 L 492,54
     L 503,62 L 512,74 L 516,88 L 514,103 L 507,115 L 495,124
     L 480,128 L 465,126 L 450,120 L 438,110 L 431,97 Z`,

  // Iberian Peninsula bump (Spain/Portugal)
  iberia:
    'M 430,97 L 434,106 L 440,118 L 448,126 L 456,130 L 454,120 L 444,110 L 435,100 Z',

  // Italian Peninsula
  italy:
    'M 488,100 L 494,108 L 498,120 L 494,132 L 488,136 L 484,126 L 483,113 L 485,102 Z',

  // Scandinavia
  scandinavia:
    `M 490,54 L 500,44 L 512,40 L 524,44 L 528,56 L 522,68 L 510,76
     L 498,74 L 490,64 Z`,

  // Africa
  africa:
    `M 452,146 L 466,138 L 482,134 L 499,133 L 516,138 L 530,147
     L 542,160 L 552,176 L 559,196 L 562,218 L 560,242 L 553,264
     L 541,285 L 524,304 L 505,321 L 488,336 L 472,349 L 456,358
     L 442,360 L 430,352 L 423,336 L 422,316 L 426,294 L 430,271
     L 428,248 L 422,224 L 418,200 L 420,176 L 428,158 Z`,

  // Horn of Africa (Somalia protrusion)
  hornOfAfrica:
    'M 556,218 L 568,212 L 582,216 L 592,228 L 590,242 L 578,250 L 562,246 L 554,234 Z',

  // Madagascar
  madagascar:
    'M 578,296 L 584,286 L 592,285 L 598,294 L 596,310 L 588,320 L 578,316 L 574,305 Z',

  // Arabian Peninsula
  arabia:
    `M 558,170 L 572,163 L 588,159 L 606,162 L 622,172 L 634,186
     L 638,204 L 632,222 L 619,236 L 602,244 L 584,242 L 568,232
     L 558,216 Z`,

  // Turkey / Anatolia
  turkey:
    'M 538,138 L 552,132 L 568,130 L 585,134 L 596,144 L 592,155 L 578,160 L 560,160 L 546,153 L 537,144 Z',

  // South Asia / Indian Subcontinent
  southAsia:
    `M 638,152 L 654,145 L 672,141 L 690,139 L 708,143 L 724,152
     L 736,165 L 742,182 L 742,201 L 736,220 L 724,238 L 708,252
     L 691,262 L 674,265 L 657,258 L 643,244 L 634,226 L 630,205
     L 632,183 L 636,165 Z`,

  // Sri Lanka
  sriLanka:
    'M 706,274 L 712,270 L 718,274 L 718,284 L 712,290 L 706,285 Z',

  // Mainland Southeast Asia (Indochina)
  indochina:
    `M 742,182 L 758,175 L 776,170 L 794,172 L 810,182 L 818,196
     L 816,212 L 806,225 L 792,234 L 775,238 L 758,234 L 745,222
     L 740,205 Z`,

  // Malay Peninsula
  malayPeninsula:
    'M 784,238 L 792,248 L 794,264 L 790,280 L 782,290 L 773,286 L 769,272 L 772,256 L 778,244 Z',

  // Russia / Siberia (simplified top band)
  russia:
    `M 500,30 L 545,22 L 605,18 L 665,20 L 725,24 L 785,30 L 840,36
     L 890,44 L 935,54 L 965,66 L 978,82 L 965,94 L 938,100
     L 900,102 L 858,98 L 812,90 L 765,82 L 718,77 L 668,75
     L 618,78 L 565,82 L 528,82 L 502,76 L 496,58 Z`,

  // East Asia / China coast
  eastAsia:
    `M 775,82 L 795,74 L 820,68 L 848,66 L 876,70 L 900,80 L 918,94
     L 928,112 L 924,130 L 912,146 L 894,158 L 872,165 L 848,166
     L 823,160 L 800,148 L 784,132 L 776,113 L 774,96 Z`,

  // Korean Peninsula
  korea:
    'M 854,120 L 862,114 L 872,116 L 878,128 L 874,142 L 864,150 L 854,144 L 849,132 Z',

  // Japan (Honshu simplified)
  japan:
    'M 890,104 L 902,96 L 916,98 L 926,110 L 922,124 L 910,132 L 896,128 L 888,116 Z',

  // Australia
  australia:
    `M 758,322 L 778,314 L 804,308 L 832,308 L 860,313 L 887,322
     L 910,336 L 926,354 L 933,374 L 928,396 L 916,414 L 896,428
     L 870,437 L 840,440 L 808,436 L 778,424 L 754,405 L 740,382
     L 736,358 L 740,336 Z`,

  // New Zealand (North Island)
  nzNorth:
    'M 944,388 L 952,378 L 960,382 L 962,396 L 955,407 L 945,404 Z',

  // New Zealand (South Island)
  nzSouth:
    'M 940,414 L 950,406 L 960,413 L 963,430 L 955,444 L 941,442 L 933,430 Z',
};

// Country-specific highlight polygons (geographically faithful boundaries on a 1000x500 canvas)
const COUNTRY_HIGHLIGHTS: Record<string, string> = {
  guatemala:
    'M 245,208 L 254,206 L 257,211 L 254,216 L 248,217 L 244,213 Z',
  costarica:
    'M 267,230 L 271,228 L 275,232 L 273,235 L 269,234 Z',
  panama:
    'M 275,235 L 280,233 L 286,236 L 292,242 L 295,245 L 290,247 L 282,243 L 276,239 Z',
  ecuador:
    'M 270,250 L 282,251 L 285,257 L 282,267 L 275,268 L 271,262 L 269,256 Z',
  brazil:
    'M 285,236 L 315,225 L 340,240 L 375,255 L 398,270 L 400,285 L 388,310 L 370,335 L 350,360 L 338,368 L 332,350 L 318,330 L 295,315 L 280,310 L 278,290 L 286,270 L 282,250 Z',
  ghana:
    'M 491,226 L 501,225 L 503,234 L 498,241 L 492,241 L 490,232 Z',
  tanzania:
    'M 584,258 L 602,258 L 608,266 L 604,284 L 590,286 L 582,278 L 581,266 Z',
};

export default function WorldMapSection() {
  const [selectedId, setSelectedId] = useState<string>('ecuador');
  const [brandName, setBrandName] = useState('Jezzy Enterprises');

  useEffect(() => {
    const saved = localStorage.getItem('timber_system_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.brandName) {
          setBrandName(parsed.brandName);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const selectedCountry =
    COUNTRIES_DATA.find((c) => c.id === selectedId) || COUNTRIES_DATA[0];

  return (
    <section
      id="origins"
      className="py-20 md:py-28 bg-white text-stone-900 dark:bg-black dark:text-zinc-100 transition-colors duration-500 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500">
              Interactive Sourcing Map
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight font-display leading-tight">
              Global Origins. Direct Imports.
            </h2>
          </div>
          <p className="text-stone-500 dark:text-zinc-400 text-xs sm:text-sm max-w-md">
            Click a source country to explore timber characteristics, species,
            and quality grades of logs {brandName} has sourced.
          </p>
        </div>

        {/* Sourcing Network Glimpse Notice */}
        <p className="text-[11px] text-stone-500 dark:text-zinc-450 italic mb-6">
          *Note: Highlighted countries represent a select glimpse of our global sourcing network, not our entire importing reach.
        </p>

        {/* Country Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {COUNTRIES_DATA.map((c) => {
            const isActive = selectedId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`relative overflow-hidden p-3.5 rounded-3xl liquid-glass spatial-card liquid-glow tactile-bounce text-left flex flex-col justify-between h-24 ${
                  isActive
                    ? 'border-emerald-600 bg-emerald-600/10 shadow-lg shadow-emerald-500/5'
                    : 'border-stone-200/50 dark:border-zinc-900/60'
                }`}
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent -z-10"
                  />
                )}
                <div className="flex items-center justify-between w-full">
                  <span className="text-2xl">{c.flag}</span>
                  <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-amber-500 animate-ping' : 'bg-stone-300 dark:bg-zinc-700'}`} />
                </div>
                <div className="space-y-0.5 mt-2">
                  <p className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-stone-400 dark:text-zinc-550'}`}>
                    {c.continent}
                  </p>
                  <p className="text-xs font-bold text-stone-900 dark:text-zinc-50 truncate">
                    {c.country}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* ── World Map SVG ── */}
          <div className="lg:col-span-8 rounded-3xl liquid-glass spatial-card relative overflow-hidden flex flex-col justify-center min-h-[320px] sm:min-h-[430px] p-2 sm:p-3">

            <svg
              viewBox="0 0 1000 500"
              className="w-full h-full select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Ocean gradient */}
                <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.08" />
                </linearGradient>
                {/* Emerald route gradient */}
                <linearGradient id="emeraldRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="55%" stopColor="#10b981" stopOpacity="1" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.7" />
                </linearGradient>
                {/* Glow filter */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Country glow */}
                <filter id="countryGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ocean background image (Stunning world map illustration generated by Gemini) */}
              <image 
                href="/images/world_sourcing_map_bg.jpg" 
                x="0" 
                y="0" 
                width="1000" 
                height="500" 
                preserveAspectRatio="none" 
                className="opacity-90 dark:opacity-80 rounded-2xl"
              />

              {/* Lat/Lon grid lines */}
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500"
                  stroke="#10b981" strokeWidth="0.4" opacity="0.08" />
              ))}
              {[100, 200, 300, 400].map((y) => (
                <line key={`h${y}`} x1="0" y1={y} x2="1000" y2={y}
                  stroke="#10b981" strokeWidth="0.4" opacity="0.08" />
              ))}
              {/* Equator line */}
              <line x1="0" y1="250" x2="1000" y2="250"
                stroke="#10b981" strokeWidth="0.6" opacity="0.15" strokeDasharray="6 4" />

              {/* ── Highlighted source-country overlays ── */}
              {COUNTRIES_DATA.map((c) => {
                const highlightPath = COUNTRY_HIGHLIGHTS[c.id];
                if (!highlightPath) return null;
                const isActive = selectedId === c.id;
                return (
                  <motion.path
                    key={`hl-${c.id}`}
                    d={highlightPath}
                    fill="#10b981"
                    stroke={isActive ? "#34d399" : "#64748b"}
                    strokeWidth={isActive ? 2.2 : 0.8}
                    filter={isActive ? 'url(#glow)' : undefined}
                    initial={{ fillOpacity: 0, strokeOpacity: 0.1 }}
                    animate={{
                      fillOpacity: isActive ? 0.82 : 0,
                      strokeOpacity: isActive ? 1 : 0.12,
                    }}
                    transition={{ duration: 0.4 }}
                    onClick={() => setSelectedId(c.id)}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}

              {/* ── Route arcs: each origin → Tuticorin ── */}
              {COUNTRIES_DATA.map((c) => {
                const isActive = selectedId === c.id;
                const cpX = (c.pinX + DEST.x) / 2;
                const cpY = Math.min(c.pinY, DEST.y) - 90;
                const d = `M ${c.pinX} ${c.pinY} Q ${cpX} ${cpY} ${DEST.x} ${DEST.y}`;
                return (
                  <g key={`rt-${c.id}`}>
                    {/* Dim dashed trace */}
                    <path d={d} fill="none"
                      stroke="#94a3b8" strokeWidth="0.7"
                      strokeDasharray="5 4" opacity="0.22" />
                    {/* Active animated arc */}
                    {isActive && (
                      <>
                        <motion.path
                          key={`arc-${c.id}-${selectedId}`}
                          d={d}
                          fill="none"
                          stroke="url(#emeraldRoute)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          filter="url(#glow)"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.6, ease: 'easeOut' }}
                        />
                        
                        {/* Interactive Sourcing Vessel (Cargo Ship) sailing along the arc */}
                        <g>
                          {/* Pulsing trail behind ship */}
                          <circle r="4.5" fill="#34d399" opacity="0.6">
                            <animateMotion dur="8s" repeatCount="indefinite" path={d} />
                            <animate attributeName="r" values="4.5;9;4.5" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite" />
                          </circle>
                          
                          {/* Cargo Ship Vector Icon */}
                          <path
                            d="M -7,2.5 L 7,2.5 L 9,-1.5 L 5,-1.5 L 3.5,-4.5 L -2,-4.5 L -3.5,-1.5 L -7,-1.5 Z"
                            fill="#10b981"
                            stroke="#047857"
                            strokeWidth="1.2"
                          >
                            <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path={d} />
                          </path>
                          <rect x="-1" y="-7.5" width="2" height="3" fill="#ffffff" opacity="0.8">
                            <animateMotion dur="8s" repeatCount="indefinite" rotate="auto" path={d} />
                          </rect>
                        </g>
                      </>
                    )}
                  </g>
                );
              })}

              {/* ── Sourcing Pins (Geographically Accurate Radar Nodes) ── */}
              {COUNTRIES_DATA.map((c) => {
                const isActive = selectedId === c.id;
                return (
                  <g
                    key={`pin-${c.id}`}
                    transform={`translate(${c.pinX},${c.pinY})`}
                    onClick={() => setSelectedId(c.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {isActive && (
                      <>
                        {/* Radar Pulse 1 */}
                        <circle r="6" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8">
                          <animate attributeName="r" values="6;26" dur="2.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                        {/* Radar Pulse 2 */}
                        <circle r="6" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.8">
                          <animate attributeName="r" values="6;26" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0" dur="2.4s" begin="1.2s" repeatCount="indefinite" />
                        </circle>
                        {/* Core static ambient glow */}
                        <motion.circle
                          r="14" fill="#10b981" fillOpacity="0.15"
                          animate={{ r: [11, 16, 11] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      </>
                    )}
                    <circle
                      r={isActive ? 7 : 5}
                      fill={isActive ? '#10b981' : '#94a3b8'}
                      fillOpacity={isActive ? 0.35 : 0.25}
                      stroke={isActive ? '#059669' : '#64748b'}
                      strokeWidth="1"
                    />
                    <circle r={isActive ? 3.5 : 2.5}
                      fill={isActive ? '#059669' : '#64748b'} />
                    
                    {/* Hit target circle */}
                    <circle r="18" fill="transparent" />
                  </g>
                );
              })}

              {/* ── Spacious Interactive Button Tags (Spanning Ocean Areas) ── */}
              {(() => {
                const offsetMap: Record<string, { x: number; y: number; anchor: "end" | "start" | "middle" }> = {
                  guatemala: { x: 125, y: 90, anchor: "end" },
                  costarica: { x: 125, y: 150, anchor: "end" },
                  panama: { x: 125, y: 210, anchor: "end" },
                  ecuador: { x: 125, y: 270, anchor: "end" },
                  brazil: { x: 125, y: 330, anchor: "end" },
                  ghana: { x: 875, y: 180, anchor: "start" },
                  tanzania: { x: 875, y: 240, anchor: "start" },
                };

                return COUNTRIES_DATA.map((c) => {
                  const isActive = selectedId === c.id;
                  const offset = offsetMap[c.id];
                  if (!offset) return null;

                  // Attachment point coordinate on tag bounding box
                  let attachX = offset.x;
                  if (offset.anchor === "end") {
                    attachX = offset.x + 2;
                  } else if (offset.anchor === "start") {
                    attachX = offset.x - 2;
                  }

                  // Label pill sizing
                  let letterWidth = 7.8;
                  let padding = 18;
                  let tagW = c.country.length * letterWidth + padding;
                  let tagH = 24;
                  let tagX = offset.x - tagW / 2;
                  let tagY = offset.y - tagH / 2;

                  if (offset.anchor === "end") {
                    tagX = offset.x - tagW - 4;
                  } else if (offset.anchor === "start") {
                    tagX = offset.x + 4;
                  }

                  let textY = tagY + tagH / 2;

                  return (
                    <g key={`tag-${c.id}`}>
                      {/* Dotted Connecting Pointer Line */}
                      <line
                        x1={attachX}
                        y1={offset.y}
                        x2={c.pinX}
                        y2={c.pinY}
                        stroke="#10b981"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                        opacity={isActive ? 0.85 : 0.45}
                        className="transition-all duration-300 pointer-events-none"
                      />

                      {/* Interactive Glass Button Pill */}
                      <g 
                        onClick={() => setSelectedId(c.id)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={tagX}
                          y={tagY}
                          width={tagW}
                          height={tagH}
                          rx="12"
                          fill={isActive ? "rgba(16, 185, 129, 0.45)" : "rgba(18, 18, 20, 0.88)"}
                          stroke={isActive ? "#34d399" : "rgba(255, 255, 255, 0.35)"}
                          strokeWidth={isActive ? 2 : 1.2}
                          className="transition-all duration-300 hover:fill-zinc-800/90"
                        />
                        <text
                          x={offset.anchor === "middle" ? tagX + tagW / 2 : offset.anchor === "end" ? tagX + tagW - 9 : tagX + 9}
                          y={textY}
                          textAnchor={offset.anchor}
                          dominantBaseline="central"
                          fontSize={isActive ? 11 : 9.5}
                          fontWeight="900"
                          fill={isActive ? '#ffffff' : '#f4f4f5'}
                          className="uppercase tracking-widest font-sans transition-colors duration-300"
                          style={{ pointerEvents: 'none' }}
                        >
                          {c.country}
                        </text>
                      </g>
                    </g>
                  );
                });
              })()}

              {/* ── Destination: Tuticorin Port ── */}
              <g transform={`translate(${DEST.x},${DEST.y})`}>
                <motion.circle
                  r="14" fill="#ef4444" fillOpacity="0.12"
                  animate={{ r: [9, 18, 9], fillOpacity: [0.25, 0.05, 0.25] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <circle r="8" fill="#ef4444" fillOpacity="0.2"
                  stroke="#ef4444" strokeWidth="1.5" strokeOpacity="0.6" />
                <circle r="4" fill="#ef4444" />
                <circle r="1.8" fill="white" />
                <text x="0" y="-16" textAnchor="middle"
                  fontSize="9.5" fontWeight="700" fill="#ef4444"
                  style={{ fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                  📍 Tuticorin Port
                </text>
                <text x="0" y="-7" textAnchor="middle"
                  fontSize="7" fill="#ef4444" fillOpacity="0.75"
                  style={{ fontFamily: 'sans-serif', pointerEvents: 'none' }}>
                  Tamil Nadu, India
                </text>
              </g>
            </svg>

            {/* HUD footer */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-white/75 dark:bg-zinc-900/75 border border-stone-200/60 dark:border-zinc-800 backdrop-blur-sm px-4 py-2 rounded-xl text-[10px] sm:text-xs">
              <span className="font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Ship className="h-3.5 w-3.5 text-amber-500" />
                Sea Cargo Route Pipeline
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                Entry via Tuticorin Port
              </span>
            </div>
          </div>

          {/* ── Country Info Card ── */}
          <div className="lg:col-span-4 flex flex-col p-6 sm:p-8 rounded-3xl liquid-glass spatial-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCountry.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Photo */}
                  <div className="h-36 w-full rounded-xl overflow-hidden relative">
                    <img
                      src={selectedCountry.image}
                      alt={selectedCountry.country}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-base font-bold text-white flex items-center gap-1.5">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.country}</span>
                    </span>
                    <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-zinc-950">
                      {selectedCountry.continent}
                    </span>
                  </div>

                  {/* Specs */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5 text-xs">
                      <Layers className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-zinc-500 font-bold mb-0.5">Species</p>
                        <p className="font-semibold text-stone-700 dark:text-zinc-200">{selectedCountry.species}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <Award className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-zinc-500 font-bold mb-0.5">Quality Grade</p>
                        <p className="font-semibold text-stone-700 dark:text-zinc-200">{selectedCountry.quality}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-zinc-500 font-bold mb-0.5">Shipping Route</p>
                        <p className="font-semibold text-stone-700 dark:text-zinc-200">
                          {selectedCountry.country} → Tuticorin Port → Tuticorin Yard
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-500 dark:text-zinc-400 leading-relaxed pt-3 border-t border-stone-100 dark:border-zinc-800">
                    {selectedCountry.description}
                  </p>
                </div>

                {/* CTA */}
                <a
                  href={`/stock?country=${selectedCountry.country}`}
                  className="mt-4 w-full py-2.5 rounded-full border border-emerald-600 bg-emerald-600/5 hover:bg-emerald-600 text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-zinc-950 font-bold text-[11px] tracking-wider uppercase text-center block transition-all duration-300 tactile-bounce liquid-glow"
                >
                  View {selectedCountry.country} Stock →
                </a>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
