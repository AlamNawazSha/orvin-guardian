import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export default function ProjectWorkspaceLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
      <div className="bg-[#FFFDF9] p-8 rounded-3xl border border-[#E2DCD0] shadow-sm max-w-md w-full text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>

        <div className="space-y-1">
          <h4 className="font-heading font-bold text-base text-[#0F172A] flex items-center justify-center gap-1.5">
            Loading Workspace Module
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          </h4>
          <p className="text-xs text-[#64748B]">
            Syncing memory bank state and change telemetry...
          </p>
        </div>

        {/* Skeleton lines */}
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-[#E2DCD0]/60 rounded-full w-4/5 mx-auto animate-pulse" />
          <div className="h-3 bg-[#E2DCD0]/40 rounded-full w-2/3 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}
