import React from 'react';

/**
 * Authentic Indonesian Batik Vector Motifs:
 * - Batik Kawung: Classical 4-lobed sacred geometry of wisdom, justice & integrity
 * - Batik Parang: Dynamic diagonal ocean-cliff wave motif symbolizing courage & perseverance
 * - Batik Ribbon Divider: Horizontal traditional batik geometric border
 * - Batik Corner Accent: Traditional royal floral corner motif
 */

interface BatikOverlayProps {
  variant?: 'kawung' | 'parang';
  className?: string;
  opacity?: number; // 0.0 to 1.0
  color?: string; // e.g. 'currentColor', '#0284c7', etc.
}

export const BatikOverlay: React.FC<BatikOverlayProps> = ({
  variant = 'kawung',
  className = '',
  opacity = 0.08,
  color = 'currentColor',
}) => {
  if (variant === 'parang') {
    return (
      <div
        className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
          viewBox="0 0 60 60"
        >
          <defs>
            <pattern
              id="batik-parang-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              {/* Parang diagonal knife/wave lines */}
              <line x1="0" y1="15" x2="60" y2="15" stroke={color} strokeWidth="1.2" />
              <line x1="0" y1="45" x2="60" y2="45" stroke={color} strokeWidth="1.2" />
              {/* Parang curves & mlinjon diamonds */}
              <path
                d="M10,15 Q20,25 15,35 Q10,45 25,45 Q35,45 30,35 Q25,25 40,25 Q50,25 45,15"
                fill="none"
                stroke={color}
                strokeWidth="1.4"
              />
              <path
                d="M40,45 Q50,55 45,65 Q40,75 55,75 Q65,75 60,65 Q55,55 70,55"
                fill="none"
                stroke={color}
                strokeWidth="1.4"
              />
              {/* Decorative small circles / cecek */}
              <circle cx="20" cy="30" r="1.5" fill={color} />
              <circle cx="50" cy="30" r="1.5" fill={color} />
              <circle cx="35" cy="15" r="1.2" fill={color} />
              <circle cx="5" cy="45" r="1.2" fill={color} />
              {/* Mlinjon rhombi */}
              <polygon points="30,0 35,5 30,10 25,5" fill="none" stroke={color} strokeWidth="1" />
              <polygon points="60,30 65,35 60,40 55,35" fill="none" stroke={color} strokeWidth="1" />
              <polygon points="0,30 5,35 0,40 -5,35" fill="none" stroke={color} strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#batik-parang-pattern)" />
        </svg>
      </div>
    );
  }

  // Default: Batik Kawung (Four-lobed circular geometric lotus/cross)
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
      >
        <defs>
          <pattern
            id="batik-kawung-pattern"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            {/* Center petals */}
            <ellipse cx="24" cy="12" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="24" cy="36" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="12" cy="24" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="36" cy="24" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.2" />
            <circle cx="24" cy="24" r="3" fill="none" stroke={color} strokeWidth="1.2" />
            <circle cx="24" cy="24" r="1.5" fill={color} />

            {/* Inner cecek / dots inside petals */}
            <circle cx="24" cy="12" r="1.2" fill={color} />
            <circle cx="24" cy="36" r="1.2" fill={color} />
            <circle cx="12" cy="24" r="1.2" fill={color} />
            <circle cx="36" cy="24" r="1.2" fill={color} />

            {/* Corner intersections to tile seamlessly */}
            <ellipse cx="0" cy="12" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="48" cy="12" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="0" cy="36" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="48" cy="36" rx="7" ry="11" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="12" cy="0" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="36" cy="0" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="12" cy="48" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.2" />
            <ellipse cx="36" cy="48" rx="11" ry="7" fill="none" stroke={color} strokeWidth="1.2" />

            <circle cx="0" cy="0" r="3" fill="none" stroke={color} strokeWidth="1.2" />
            <circle cx="48" cy="0" r="3" fill="none" stroke={color} strokeWidth="1.2" />
            <circle cx="0" cy="48" r="3" fill="none" stroke={color} strokeWidth="1.2" />
            <circle cx="48" cy="48" r="3" fill="none" stroke={color} strokeWidth="1.2" />
            <circle cx="0" cy="0" r="1.5" fill={color} />
            <circle cx="48" cy="0" r="1.5" fill={color} />
            <circle cx="0" cy="48" r="1.5" fill={color} />
            <circle cx="48" cy="48" r="1.5" fill={color} />

            {/* Diamond accents in diagonal intersections */}
            <polygon points="12,12 14,14 12,16 10,14" fill={color} opacity="0.8" />
            <polygon points="36,12 38,14 36,16 34,14" fill={color} opacity="0.8" />
            <polygon points="12,36 14,38 12,40 10,38" fill={color} opacity="0.8" />
            <polygon points="36,36 38,38 36,40 34,38" fill={color} opacity="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#batik-kawung-pattern)" />
      </svg>
    </div>
  );
};

/**
 * Traditional Batik Geometric Border Ribbon
 * Elegant decorative horizontal line motif inspired by Batik Tumpal & Kawung borders
 */
export const BatikRibbonBorder: React.FC<{
  className?: string;
  theme?: 'ocean' | 'gold' | 'subtle';
  height?: number;
}> = ({ className = '', theme = 'ocean', height = 6 }) => {
  const isGold = theme === 'gold';
  const isSubtle = theme === 'subtle';

  return (
    <div
      className={`w-full overflow-hidden flex items-center select-none ${className}`}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 240 6"
      >
        <defs>
          <pattern id={`batik-ribbon-${theme}`} width="24" height="6" patternUnits="userSpaceOnUse">
            {/* Base track */}
            <line
              x1="0"
              y1="3"
              x2="24"
              y2="3"
              stroke={isGold ? '#f59e0b' : isSubtle ? '#94a3b8' : '#38bdf8'}
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            {/* Rhombus diamonds (Batik Ceplok) */}
            <polygon
              points="6,1 11,3 6,5 1,3"
              fill={isGold ? '#d97706' : isSubtle ? '#64748b' : '#0284c7'}
              stroke={isGold ? '#fde68a' : isSubtle ? '#cbd5e1' : '#7dd3fc'}
              strokeWidth="0.5"
            />
            <polygon
              points="18,1 23,3 18,5 13,3"
              fill={isGold ? '#b45309' : isSubtle ? '#475569' : '#0369a1'}
              stroke={isGold ? '#fbbf24' : isSubtle ? '#cbd5e1' : '#bae6fd'}
              strokeWidth="0.5"
            />
            {/* Center dots */}
            <circle cx="6" cy="3" r="0.8" fill="#ffffff" />
            <circle cx="18" cy="3" r="0.8" fill="#ffffff" />
            <circle cx="12" cy="3" r="0.6" fill={isGold ? '#fbbf24' : '#38bdf8'} />
            <circle cx="0" cy="3" r="0.6" fill={isGold ? '#fbbf24' : '#38bdf8'} />
            <circle cx="24" cy="3" r="0.6" fill={isGold ? '#fbbf24' : '#38bdf8'} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#batik-ribbon-${theme})`} />
      </svg>
    </div>
  );
};

/**
 * Traditional Royal Indonesian Batik Corner Motif
 * Perfect for decorative cards, modals, or banners
 */
export const BatikCornerOrnament: React.FC<{
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
  size?: number;
  color?: string;
}> = ({
  position = 'top-left',
  className = '',
  size = 40,
  color = 'currentColor',
}) => {
  const rotation =
    position === 'top-right'
      ? 'rotate-90'
      : position === 'bottom-right'
      ? 'rotate-180'
      : position === 'bottom-left'
      ? '-rotate-90'
      : '';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`pointer-events-none select-none ${rotation} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer corner frame */}
      <path
        d="M2 38 L2 2 L38 2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 30 L6 6 L30 6"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      {/* Kawung / Floral motif corner flourish */}
      <circle cx="12" cy="12" r="4" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="1" />
      <path
        d="M12 4 Q12 12 4 12 Q12 12 12 20 Q12 12 20 12 Q12 12 12 4 Z"
        fill={color}
        fillOpacity="0.4"
      />
      <circle cx="12" cy="12" r="1.5" fill={color} />
      {/* Small accent cecek dots */}
      <circle cx="4" cy="20" r="1" fill={color} />
      <circle cx="20" cy="4" r="1" fill={color} />
      <circle cx="26" cy="6" r="1" fill={color} />
      <circle cx="6" cy="26" r="1" fill={color} />
    </svg>
  );
};

/**
 * Traditional Batik Cultural Badge / Tag
 */
export const BatikCulturalBadge: React.FC<{
  label?: string;
  className?: string;
}> = ({ label = 'Motif Batik Nusantara', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs text-[10px] font-bold tracking-wider uppercase border border-sky-400/30 bg-sky-950/60 text-sky-200 backdrop-blur-2xs shadow-2xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
      <span>{label}</span>
    </span>
  );
};
