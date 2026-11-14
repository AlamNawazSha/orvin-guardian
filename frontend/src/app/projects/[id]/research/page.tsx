"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { ResearchIntelligenceViewer } from '@/components/research/ResearchIntelligenceViewer';

export default function ResearchIntelligencePage() {
  const params = useParams();
  const projectId = params.id as string;

  return (
    <div className="space-y-6 animate-fade-in text-[#0F172A]">
      <ResearchIntelligenceViewer projectId={projectId} />
    </div>
  );
}
