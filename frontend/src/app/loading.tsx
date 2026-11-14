import React from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7F2]/80 backdrop-blur-xs text-[#0F172A] select-none">
      <div className="bg-[#FFFDF9] p-8 rounded-3xl border border-[#E2DCD0] shadow-xl flex flex-col items-center text-center max-w-sm mx-4 space-y-4 animate-scale-up">
        {/* Animated Brand Emblem */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FAF7F0] border border-[#CBD5E1]">
          <span className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-ping" />
          <ShieldCheck className="w-8 h-8 text-indigo-700 relative z-10" />
        </div>

        <div className="space-y-1">
          <h3 className="font-heading font-extrabold text-lg text-[#0F172A] flex items-center justify-center gap-2">
            Loading Workspace
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 inline" />
          </h3>
          <p className="text-xs text-[#64748B]">
            Moving to next page & assembling resources...
          </p>
        </div>

        {/* Shimmer loading bar */}
        <div className="w-full bg-[#E2DCD0] h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 h-full w-2/3 rounded-full animate-progress" />
        </div>
      </div>
    </div>
  );
}
