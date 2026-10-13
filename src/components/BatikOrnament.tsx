import React from 'react';

/**
 * Authentic Indonesian Batik Motifs (Kawung, Parang, Mega Mendung)
 * Vector SVGs designed for high performance, retina display, and scalable styling.
 */

interface BatikRibbonProps {
  variant?: 'ocean' | 'gold' | 'dark' | 'subtle';
  height?: number;
  className?: string;
}

/**
 * Horizontal repeating ornamental Batik ribbon band (Kawung & Mlinjon geometry)
 */
export const BatikRibbon: React.FC<BatikRibbonProps> = ({
  variant = 'ocean',
  height = 8,
  className = '',
}) => {
  // Color presets
  const colors = {
    ocean: {
      bg: 'bg-slate-900',
      stroke1: '#38bdf8', // sky-400
      stroke2: '#0284c7', // sky-600
      dot: '#7dd3fc',     // sky-300
      accent: '#0369a1',  // sky-700
    },
    gold: {
      bg: 'bg-amber-950',
      stroke1: '#fcd34d', // amber-300
      stroke2: '#b45309', // amber-700
      dot: '#fef08a',     // yellow-200
      accent: '#d97706',  // amber-600
    },
    dark: {
      bg: 'bg-blue-950',
      stroke1: '#60a5fa', // blue-400
      stroke2: '#1d4ed8', // blue-700
      dot: '#bfdbfe',     // blue-200
      accent: '#1e40af',  // blue-800
    },
    subtle: {
      bg: 'bg-slate-100',
      stroke1: '#94a3b8', // slate-400
      stroke2: '#cbd5e1', // slate-300
      dot: '#64748b',     // slate-500
      accent: '#e2e8f0',  // slate-200
    },
  }[variant];

  const patternId = `batik-ribbon-kawung-${variant}`;

  return (
    <div
      className={`w-full overflow-hidden shrink-0 select-none ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={patternId}
            width="28"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            {/* Background tile */}
            <rect width="28" height="14" fill={variant === 'subtle' ? '#f8fafc' : variant === 'gold' ? '#451a03' : '#091e3a'} />

            {/* Kawung Ellipses Intersections */}
            {/* Center diamond/mlinjon */}
            <path
              d="M 14,3 L 18,7 L 14,11 L 10,7 Z"
              fill={colors.accent}
              opacity="0.75"
            />
            {/* Center core dot */}
            <circle cx="14" cy="7" r="1.5" fill={colors.dot} />

            {/* Left/Right Petal Intersect */}
            <ellipse cx="6" cy="7" rx="4.5" ry="3" fill="none" stroke={colors.stroke1} strokeWidth="1" opacity="0.8" />
            <ellipse cx="22" cy="7" rx="4.5" ry="3" fill="none" stroke={colors.stroke1} strokeWidth="1" opacity="0.8" />

            {/* Top/Bottom Petal Intersect */}
            <ellipse cx="14" cy="1" rx="3.5" ry="4" fill="none" stroke={colors.stroke2} strokeWidth="1" opacity="0.7" />
            <ellipse cx="14" cy="13" rx="3.5" ry="4" fill="none" stroke={colors.stroke2} strokeWidth="1" opacity="0.7" />

            {/* Corner Dots for continuous seamless flow */}
            <circle cx="0" cy="7" r="1.2" fill={colors.dot} opacity="0.9" />
            <circle cx="28" cy="7" r="1.2" fill={colors.dot} opacity="0.9" />
            <circle cx="14" cy="0" r="1" fill={colors.dot} opacity="0.6" />
            <circle cx="14" cy="14" r="1" fill={colors.dot} opacity="0.6" />

            {/* Top and bottom subtle border lines */}
            <line x1="0" y1="0.5" x2="28" y2="0.5" stroke={colors.stroke1} strokeWidth="0.8" opacity="0.4" />
            <line x1="0" y1="13.5" x2="28" y2="13.5" stroke={colors.stroke1} strokeWidth="0.8" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

interface BatikWatermarkProps {
  className?: string;
  opacity?: number;
  variant?: 'kawung' | 'parang' | 'megamendung';
  color?: string; // CSS color string e.g. '#0284c7' or '#d97706'
}

/**
 * Full area subtle Batik background wallpaper / watermark texture
 */
export const BatikWatermark: React.FC<BatikWatermarkProps> = ({
  className = '',
  opacity = 0.05,
  variant = 'kawung',
  color = '#0284c7',
}) => {
  const patternId = `batik-watermark-${variant}-${Math.round(opacity * 100)}`;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {variant === 'kawung' && (
            <pattern
              id={patternId}
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              {/* Kawung center 4-petal flower */}
              <circle cx="25" cy="25" r="3" fill={color} />
              <ellipse cx="25" cy="13" rx="6" ry="10" fill="none" stroke={color} strokeWidth="1.2" />
              <ellipse cx="25" cy="37" rx="6" ry="10" fill="none" stroke={color} strokeWidth="1.2" />
              <ellipse cx="13" cy="25" rx="10" ry="6" fill="none" stroke={color} strokeWidth="1.2" />
              <ellipse cx="37" cy="25" rx="10" ry="6" fill="none" stroke={color} strokeWidth="1.2" />

              {/* Inner petal highlights */}
              <circle cx="25" cy="16" r="1.5" fill={color} />
              <circle cx="25" cy="34" r="1.5" fill={color} />
              <circle cx="16" cy="25" r="1.5" fill={color} />
              <circle cx="34" cy="25" r="1.5" fill={color} />

              {/* Seamless 4 corners */}
              <circle cx="0" cy="0" r="3" fill={color} />
              <circle cx="50" cy="0" r="3" fill={color} />
              <circle cx="0" cy="50" r="3" fill={color} />
              <circle cx="50" cy="50" r="3" fill={color} />

              <ellipse cx="0" cy="13" rx="6" ry="10" fill="none" stroke={color} strokeWidth="1.2" />
              <ellipse cx="50" cy="13" rx="6" ry="10" fill="none" stroke={color} strokeWidth="1.2" />
              <ellipse cx="13" cy="0" rx="10" ry="6" fill="none" stroke={color} strokeWidth="1.2" />
              <ellipse cx="13" cy="50" rx="10" ry="6" fill="none" stroke={color} strokeWidth="1.2" />

              {/* Diagonal connecting diamond (mlinjon) */}
              <path
                d="M 25,6 L 31,12 L 25,18 L 19,12 Z"
                fill="none"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.6"
              />
              <path
                d="M 25,32 L 31,38 L 25,44 L 19,38 Z"
                fill="none"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.6"
              />
            </pattern>
          )}

          {variant === 'parang' && (
            <pattern
              id={patternId}
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-45)"
            >
              {/* Slanted Parang waves */}
              <path
                d="M 0,15 C 15,10 30,20 45,15 C 55,10 60,12 60,15"
                fill="none"
                stroke={color}
                strokeWidth="2"
              />
              <path
                d="M 0,45 C 15,40 30,50 45,45 C 55,40 60,42 60,45"
                fill="none"
                stroke={color}
                strokeWidth="2"
              />
              {/* Mlinjon diamonds */}
              <polygon points="30,22 36,28 30,34 24,28" fill={color} opacity="0.8" />
              {/* Cecek dots */}
              <circle cx="10" cy="28" r="1.8" fill={color} />
              <circle cx="16" cy="28" r="1.8" fill={color} />
              <circle cx="44" cy="28" r="1.8" fill={color} />
              <circle cx="50" cy="28" r="1.8" fill={color} />
            </pattern>
          )}

          {variant === 'megamendung' && (
            <pattern
              id={patternId}
              width="80"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              {/* Rolling cloud outlines */}
              <path
                d="M 0,30 Q 15,15 35,22 Q 55,10 75,25 Q 80,28 80,30"
                fill="none"
                stroke={color}
                strokeWidth="1.5"
              />
              <path
                d="M 5,34 Q 20,22 36,27 Q 52,18 72,30"
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.7"
              />
              <path
                d="M 12,38 Q 24,30 38,33 Q 50,26 66,35"
                fill="none"
                stroke={color}
                strokeWidth="0.8"
                opacity="0.5"
              />
            </pattern>
          )}
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
};

interface BatikMedallionProps {
  size?: number;
  className?: string;
  theme?: 'ocean' | 'gold' | 'monochrome';
}

/**
 * Circular 8-lobed Indonesian Mandala/Kawung Batik Seal
 */
export const BatikMedallion: React.FC<BatikMedallionProps> = ({
  size = 40,
  className = '',
  theme = 'ocean',
}) => {
  const isGold = theme === 'gold';
  const isMono = theme === 'monochrome';

  const strokePrimary = isGold ? '#d97706' : isMono ? '#475569' : '#0284c7';
  const strokeSecondary = isGold ? '#f59e0b' : isMono ? '#94a3b8' : '#38bdf8';
  const fillColor = isGold ? '#fef3c7' : isMono ? '#f1f5f9' : '#e0f2fe';
  const centerDot = isGold ? '#b45309' : isMono ? '#334155' : '#0369a1';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* Outer Scalloped Sunburst Ring */}
      <circle cx="50" cy="50" r="46" stroke={strokePrimary} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
      <circle cx="50" cy="50" r="42" stroke={strokeSecondary} strokeWidth="1" />

      {/* 4 Cardinal Petals */}
      <ellipse cx="50" cy="28" rx="10" ry="16" fill={fillColor} fillOpacity="0.5" stroke={strokePrimary} strokeWidth="1.8" />
      <ellipse cx="50" cy="72" rx="10" ry="16" fill={fillColor} fillOpacity="0.5" stroke={strokePrimary} strokeWidth="1.8" />
      <ellipse cx="28" cy="50" rx="16" ry="10" fill={fillColor} fillOpacity="0.5" stroke={strokePrimary} strokeWidth="1.8" />
      <ellipse cx="72" cy="50" rx="16" ry="10" fill={fillColor} fillOpacity="0.5" stroke={strokePrimary} strokeWidth="1.8" />

      {/* 4 Diagonal Petals */}
      <g transform="rotate(45 50 50)">
        <ellipse cx="50" cy="28" rx="8" ry="14" fill={fillColor} fillOpacity="0.4" stroke={strokeSecondary} strokeWidth="1.4" />
        <ellipse cx="50" cy="72" rx="8" ry="14" fill={fillColor} fillOpacity="0.4" stroke={strokeSecondary} strokeWidth="1.4" />
        <ellipse cx="28" cy="50" rx="14" ry="8" fill={fillColor} fillOpacity="0.4" stroke={strokeSecondary} strokeWidth="1.4" />
        <ellipse cx="72" cy="50" rx="14" ry="8" fill={fillColor} fillOpacity="0.4" stroke={strokeSecondary} strokeWidth="1.4" />
      </g>

      {/* Center 8-point Diamond Star */}
      <polygon
        points="50,38 54,46 62,50 54,54 50,62 46,54 38,50 46,46"
        fill={strokePrimary}
        opacity="0.85"
      />

      {/* Center Jewels */}
      <circle cx="50" cy="50" r="5" fill="#ffffff" stroke={centerDot} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="2.5" fill={centerDot} />

      {/* Petal Tip Accent Dots */}
      <circle cx="50" cy="17" r="2" fill={strokePrimary} />
      <circle cx="50" cy="83" r="2" fill={strokePrimary} />
      <circle cx="17" cy="50" r="2" fill={strokePrimary} />
      <circle cx="83" cy="50" r="2" fill={strokePrimary} />
    </svg>
  );
};

interface BatikDividerProps {
  label?: string;
  theme?: 'ocean' | 'gold' | 'subtle';
  className?: string;
}

/**
 * Section Divider with Batik Center Medallion
 */
export const BatikDivider: React.FC<BatikDividerProps> = ({
  label,
  theme = 'ocean',
  className = '',
}) => {
  const isGold = theme === 'gold';
  const lineColor = isGold ? 'border-amber-300' : theme === 'subtle' ? 'border-slate-300' : 'border-sky-300';
  const textColor = isGold ? 'text-amber-900 bg-amber-50 border-amber-200' : theme === 'subtle' ? 'text-slate-700 bg-slate-50 border-slate-200' : 'text-sky-900 bg-sky-50 border-sky-200';

  return (
    <div className={`relative flex items-center justify-center my-6 select-none ${className}`}>
      <div className={`w-full border-t ${lineColor} opacity-60`} />
      <div className="absolute flex items-center gap-2 px-3 bg-white">
        <BatikMedallion size={18} theme={theme === 'gold' ? 'gold' : 'ocean'} />
        {label && (
          <span className={`text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-xs border ${textColor}`}>
            {label}
          </span>
        )}
        <BatikMedallion size={18} theme={theme === 'gold' ? 'gold' : 'ocean'} />
      </div>
    </div>
  );
};
