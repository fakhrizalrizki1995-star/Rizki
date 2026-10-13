import React, { useState } from 'react';

interface BrandLogoProps {
  src?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  src,
  alt = 'Ruang Legowo',
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  const NEW_LOGO_PATH = '/src/assets/images/ruang_legowo_logo_v3_1791863614156.jpg';
  const effectiveSrc = (!src || src === '/src/assets/images/ruang_legowo_logo_1791449321676.jpg' || src === '/src/assets/images/ruang_legowo_logo_1791862685453.jpg')
    ? NEW_LOGO_PATH
    : src;

  // Multiple fallback sources in order of preference
  const imageSources = [
    effectiveSrc,
    NEW_LOGO_PATH,
    '/ruang_legowo_logo.jpg',
    '/logo.jpg',
  ].filter(Boolean) as string[];

  const [currentSrcIdx, setCurrentSrcIdx] = useState(0);

  // Reset error state and index when src prop changes
  React.useEffect(() => {
    setImageError(false);
    setCurrentSrcIdx(0);
  }, [src]);

  const handleImageError = () => {
    if (currentSrcIdx < imageSources.length - 1) {
      setCurrentSrcIdx((prev) => prev + 1);
    } else {
      setImageError(true);
    }
  };

  // If all image files failed or loading failed, render pristine SVG Monogram Emblem
  if (imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-sm overflow-hidden bg-gradient-to-br from-blue-900 via-sky-700 to-cyan-600 flex items-center justify-center shadow-xs border border-sky-300/40 p-1 shrink-0 ${className}`}
        title={alt}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Emblem Background Crest */}
          <rect width="100" height="100" rx="16" fill="url(#bg-grad)" />
          {/* Stylized Intertwined R & L Monogram */}
          <path
            d="M28 24H52C62 24 68 30 68 39C68 47 62 53 53 54L72 76H57L42 57H38V76H28V24ZM38 48H50C55 48 58 45 58 40C58 35 55 33 50 33H38V48Z"
            fill="white"
          />
          <path
            d="M56 68H78V76H48V46H56V68Z"
            fill="#38BDF8"
          />
          <circle cx="74" cy="30" r="6" fill="#F59E0B" />
          <defs>
            <linearGradient id="bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0C4A6E" />
              <stop offset="0.5" stopColor="#0369A1" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-sm overflow-hidden flex items-center justify-center shrink-0 bg-white/15 p-0.5 border border-white/25 shadow-2xs ${className}`}
    >
      <img
        src={imageSources[currentSrcIdx]}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={handleImageError}
        className="w-full h-full object-contain rounded-2xs"
      />
    </div>
  );
};
