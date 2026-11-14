import React from 'react';
import { AdvancedOrbitalLoader } from '@/components/ui/AdvancedOrbitalLoader';

export default function ProjectWorkspaceLoading() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-8 select-none">
      <div className="p-8 rounded-3xl bg-[#0F172A]/90 border border-slate-700/60 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] backdrop-blur-md animate-scale-up">
        <AdvancedOrbitalLoader size="md" />
      </div>
    </div>
  );
}
