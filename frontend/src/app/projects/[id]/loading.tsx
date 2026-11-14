import React from 'react';
import { SpokePillLoader } from '@/components/ui/SpokePillLoader';

export default function ProjectWorkspaceLoading() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-8 select-none">
      <SpokePillLoader size="md" showCard={true} />
    </div>
  );
}
