"use client";

import React from 'react';

interface AdvancedOrbitalLoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

export function AdvancedOrbitalLoader({ size = 'md' }: AdvancedOrbitalLoaderProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
  }[size];

  return (
    <div className="relative flex items-center justify-center select-none" aria-hidden="true">
      {/* Outer Ambient Atmospheric Bloom */}
      <div className={`absolute ${sizeClasses} rounded-full bg-gradient-to-tr from-indigo-500/25 via-sky-500/25 to-emerald-400/25 blur-2xl animate-pulse`} />

      {/* Main Gyroscopic Frame */}
      <div className={`relative ${sizeClasses} flex items-center justify-center`}>
        {/* Static Precision Guide Track */}
        <div className="absolute inset-0 rounded-full border border-slate-400/15" />

        {/* Ring 1: High-Speed Outer Arc (Clockwise) */}
        <div
          className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-indigo-500 border-r-sky-400 animate-spin"
          style={{ animationDuration: '1.4s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        />

        {/* Ring 2: Counter-Rotating Dashed Orbit (Counter-Clockwise) */}
        <div
          className="absolute inset-3 rounded-full border-[2px] border-dashed border-transparent border-b-emerald-400 border-l-teal-300 animate-spin"
          style={{ animationDuration: '2.2s', animationDirection: 'reverse', animationTimingFunction: 'linear' }}
        />

        {/* Ring 3: Nested Quantum Halo */}
        <div
          className="absolute inset-6 rounded-full border-[2px] border-transparent border-t-sky-400 border-b-indigo-400 animate-spin"
          style={{ animationDuration: '0.9s' }}
        />

        {/* Pulsing Core Reactor */}
        <div className="relative flex items-center justify-center">
          <span className="absolute w-9 h-9 rounded-full bg-indigo-500/30 animate-ping" />
          <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-600 via-sky-400 to-emerald-300 shadow-[0_0_16px_rgba(56,189,248,0.9)] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
