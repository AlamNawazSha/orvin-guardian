import React from 'react';
import { SpokePillLoader } from '@/components/ui/SpokePillLoader';

export default function RootLoading() {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#FAF7F2]/80 backdrop-blur-xs select-none">
      <SpokePillLoader size="lg" showCard={true} />
    </div>
  );
}
