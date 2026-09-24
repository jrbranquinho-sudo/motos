"use client";

import React from "react";

interface MotOsLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  variant?: "default" | "compact" | "badge";
}

/**
 * Mot-OS Official Logo Component
 * Features crossed Screwdriver (chave de fenda) and Open-Ended Wrench (chave de boca)
 */
export function MotOsLogo({
  size = 36,
  className = "",
  showText = false,
  textClassName = "",
  variant = "default",
}: MotOsLogoProps) {
  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 transition-transform duration-200 ${className}`}
    >
      <defs>
        <linearGradient id="logoMotosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a18" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="logoSilverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f97316" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Background Rounded Shield / Squircle */}
      <rect width="64" height="64" rx="16" fill="url(#logoBgGrad)" />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="14.5"
        fill="none"
        stroke="url(#logoMotosGrad)"
        strokeWidth="1.75"
        strokeOpacity="0.75"
      />

      {/* Crossed Tools (Chave de Boca + Chave de Fenda) */}
      <g filter="url(#logoGlow)">
        {/* 1. CHAVE DE BOCA (Open-ended Wrench) */}
        <g transform="rotate(-45 32 32)">
          {/* Wrench Shaft */}
          <rect x="29" y="14" width="6" height="36" rx="2" fill="url(#logoSilverGrad)" />
          <rect x="30.5" y="18" width="3" height="28" rx="1" fill="#334155" opacity="0.6" />

          {/* Wrench Top Jaw */}
          <path
            d="M25 15 C25 8, 39 8, 39 15 C39 18, 36 20, 36 22 L28 22 C28 20, 25 18, 25 15 Z"
            fill="url(#logoMotosGrad)"
          />
          <polygon points="32,15 28.5,8 35.5,8" fill="#18181b" />
          <circle cx="32" cy="15" r="2.5" fill="#18181b" />

          {/* Wrench Bottom Ring End */}
          <circle cx="32" cy="50" r="6.5" fill="url(#logoMotosGrad)" />
          <circle cx="32" cy="50" r="3.2" fill="#18181b" />
        </g>

        {/* 2. CHAVE DE FENDA (Screwdriver) */}
        <g transform="rotate(45 32 32)">
          {/* Screwdriver Flat Keystone Tip */}
          <path d="M30 9 L34 9 L33.5 14 L30.5 14 Z" fill="url(#logoSilverGrad)" />
          <line x1="30" y1="9" x2="34" y2="9" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

          {/* Screwdriver Round Shank */}
          <rect x="30.5" y="14" width="3" height="20" fill="url(#logoSilverGrad)" rx="0.8" />
          <rect x="31.2" y="14" width="1.2" height="20" fill="#ffffff" opacity="0.8" />

          {/* Bolster */}
          <rect x="29" y="32" width="6" height="3.5" rx="1" fill="url(#logoMotosGrad)" />

          {/* Ergonomic Handle */}
          <path
            d="M28 35.5 C26 38, 26 48, 28 53 C29 55, 35 55, 36 53 C38 48, 38 38, 36 35.5 Z"
            fill="url(#logoMotosGrad)"
          />
          {/* Grips */}
          <line x1="30" y1="38" x2="30" y2="50" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="32" y1="37" x2="32" y2="51" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <line x1="34" y1="38" x2="34" y2="50" stroke="#09090b" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <circle cx="32" cy="53.5" r="2.2" fill="#09090b" opacity="0.5" />
        </g>
      </g>

      {/* Central Pivot Flare */}
      <circle cx="32" cy="32" r="2.2" fill="#ffffff" opacity="0.95" />
      <circle cx="32" cy="32" r="4" fill="#f97316" opacity="0.4" />
    </svg>
  );

  if (!showText) {
    return icon;
  }

  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <div className={`flex flex-col ${textClassName}`}>
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-black tracking-tight text-white text-lg">Mot</span>
          <span className="text-orange-500 font-black text-lg">-</span>
          <span className="font-black tracking-tight bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent text-lg">
            OS
          </span>
        </div>
        {variant !== "compact" && (
          <span className="text-[9px] font-semibold tracking-wider uppercase text-zinc-400">
            Gestão Automotiva
          </span>
        )}
      </div>
    </div>
  );
}
export default MotOsLogo;
