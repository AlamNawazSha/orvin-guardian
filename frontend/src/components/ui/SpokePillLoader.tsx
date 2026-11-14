"use client";

import React from 'react';

interface SpokePillLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  showCard?: boolean;
}

export function SpokePillLoader({ size = 'md', showCard = true }: SpokePillLoaderProps) {
  // 24 spokes around the circle (15 deg each) matching the user's reference image
  const totalSpokes = 24;
  const spokes = Array.from({ length: totalSpokes }, (_, i) => {
    // Opacity fades smoothly from 1.0 (darkest) down to ~0.08 (lightest)
    const opacity = Math.max(0.08, (i + 1) / totalSpokes);
    const angle = i * (360 / totalSpokes);
    return { angle, opacity };
  });

  const svgDimensions = {
    sm: 64,
    md: 96,
    lg: 120,
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4 select-none">
      {/* Radial Fading Spokes Spinner */}
      <div className="relative flex items-center justify-center">
        <svg
          width={svgDimensions}
          height={svgDimensions}
          viewBox="0 0 120 120"
          className="animate-spin text-[#1E293B]"
          style={{ animationDuration: '1.2s', animationTimingFunction: 'linear' }}
          aria-hidden="true"
        >
          {spokes.map(({ angle, opacity }, index) => (
            <line
              key={index}
              x1="60"
              y1="14"
              x2="60"
              y2="28"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              opacity={opacity}
              transform={`rotate(${angle} 60 60)`}
            />
          ))}
        </svg>
      </div>

      {/* Typography: "Loading.." matching reference */}
      <div className="font-heading font-bold text-xl md:text-2xl text-[#0F172A] tracking-tight flex items-center justify-center">
        <span>Loading</span>
        <span className="tracking-widest inline-flex ml-0.5">
          <span className="animate-pulse" style={{ animationDuration: '1s', animationDelay: '0s' }}>.</span>
          <span className="animate-pulse" style={{ animationDuration: '1s', animationDelay: '0.2s' }}>.</span>
        </span>
      </div>

      {/* Pill Capsule with 3 Stepped Opacity Dots */}
      <div className="border-[1.5px] border-[#0F172A]/80 rounded-full px-5 py-1.5 flex items-center justify-center gap-2.5 shadow-2xs bg-white/70">
        <span
          className="w-2 h-2 rounded-full bg-[#0F172A] opacity-40 animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '0s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#0F172A] opacity-70 animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '0.25s' }}
        />
        <span
          className="w-2 h-2 rounded-full bg-[#0F172A] opacity-100 animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '0.5s' }}
        />
      </div>
    </div>
  );

  if (!showCard) {
    return content;
  }

  return (
    <div className="bg-[#FFFDF9]/98 border border-[#E2DCD0] p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)] backdrop-blur-md animate-scale-up">
      {content}
    </div>
  );
}
