import React from 'react';
import { AdvancedOrbitalLoader } from '@/components/ui/AdvancedOrbitalLoader';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#FAF7F2]/75 backdrop-blur-xs select-none">
      <div className="p-8 rounded-3xl bg-[#0F172A]/90 border border-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md animate-scale-up">
        <AdvancedOrbitalLoader size="lg" />
      </div>
    </div>
  );
}
