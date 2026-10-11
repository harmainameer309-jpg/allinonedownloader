import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const pixelSizes = {
    sm: 28,
    md: 36,
    lg: 52,
    xl: 72,
  };
  const px = pixelSizes[size] || 36;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Signature Unified Logo Mark */}
      <div
        className="relative shrink-0 select-none group"
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 100 100"
          width={px}
          height={px}
          className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Dark glass background */}
            <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0b1120" />
              <stop offset="50%" stopColor="#111c35" />
              <stop offset="100%" stopColor="#050811" />
            </linearGradient>

            {/* Spectrum multi-platform gradient (YouTube, TikTok, Facebook, Instagram, Twitter) */}
            <linearGradient id="logoSpectrum" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#1877f2" />
              <stop offset="75%" stopColor="#e1306c" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* Center arrow gradient */}
            <linearGradient id="arrowNeon" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>

            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Container base */}
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="24"
            fill="url(#logoBg)"
            stroke="url(#logoSpectrum)"
            strokeWidth="2.5"
          />

          {/* Subtle multi-platform orbit track */}
          <circle
            cx="50"
            cy="48"
            r="30"
            fill="none"
            stroke="url(#logoSpectrum)"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.8"
          />

          {/* Central Download Arrow + Play Symbol */}
          <g transform="translate(50, 48)">
            {/* Tray */}
            <path
              d="M -16 8 L -16 16 C -16 19 -13 21 -10 21 L 10 21 C 13 21 16 19 16 16 L 16 8"
              fill="none"
              stroke="url(#logoSpectrum)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Arrow Stem */}
            <path
              d="M 0 -18 L 0 11"
              fill="none"
              stroke="url(#arrowNeon)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Arrow Head */}
            <path
              d="M -10 2 L 0 12 L 10 2"
              fill="none"
              stroke="url(#arrowNeon)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Play triangle accent */}
            <path
              d="M -3 -10 L 4 -6 L -3 -2 Z"
              fill="#ffffff"
              opacity="0.9"
            />
          </g>

          {/* Micro Platform Dots on Orbit */}
          <circle cx="32" cy="22" r="2.2" fill="#ef4444" /> {/* YouTube */}
          <circle cx="68" cy="22" r="2.2" fill="#06b6d4" /> {/* TikTok */}
          <circle cx="78" cy="48" r="2.2" fill="#1877f2" /> {/* Facebook */}
          <circle cx="68" cy="74" r="2.2" fill="#e1306c" /> {/* Instagram */}
          <circle cx="32" cy="74" r="2.2" fill="#38bdf8" /> {/* Twitter/X */}
          <circle cx="22" cy="48" r="2.2" fill="#dc2626" /> {/* Pinterest */}
        </svg>
      </div>

      {/* Brand Text Elements */}
      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-white ${
                size === 'sm'
                  ? 'text-sm'
                  : size === 'md'
                  ? 'text-lg'
                  : size === 'lg'
                  ? 'text-2xl'
                  : 'text-3xl'
              }`}
            >
              ClipStream
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-red-600 via-blue-600 to-cyan-500 text-white shadow-xs">
              ALL-IN-ONE
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
            by <strong className="text-slate-200">Harmain Ameer</strong>
          </span>
        </div>
      )}
    </div>
  );
};
