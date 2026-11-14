"use client";

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight } from 'lucide-react';

function NavigationProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSlowNotice, setShowSlowNotice] = useState(false);

  // When pathname or searchParams change, navigation is complete
  useEffect(() => {
    setIsNavigating(false);
    setProgress(100);
    setShowSlowNotice(false);

    const timer = setTimeout(() => {
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Track user clicking internal links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore external, anchor hash, or blank target links
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || targetAttr === '_blank') {
        return;
      }

      // Check if internal link to a different page
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          const currentUrl = new URL(window.location.href);
          if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
            setIsNavigating(true);
            setProgress(30);
          }
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    // Custom event listeners for programmatic route pushes (router.push)
    const handleCustomNavStart = () => {
      setIsNavigating(true);
      setProgress(30);
    };

    const handleCustomNavEnd = () => {
      setIsNavigating(false);
      setProgress(100);
      setShowSlowNotice(false);
      setTimeout(() => setProgress(0), 300);
    };

    window.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('app:nav-start', handleCustomNavStart);
    window.addEventListener('app:nav-end', handleCustomNavEnd);

    return () => {
      window.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('app:nav-start', handleCustomNavStart);
      window.removeEventListener('app:nav-end', handleCustomNavEnd);
    };
  }, []);

  // Increment progress while navigating and trigger slow notice after 300ms
  useEffect(() => {
    if (!isNavigating) return;

    // Notice timer for long-running pages
    const slowNoticeTimer = setTimeout(() => {
      setShowSlowNotice(true);
    }, 300);

    // Progress bar advance intervals
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.max(1, (90 - prev) * 0.15);
        return prev + increment;
      });
    }, 150);

    return () => {
      clearTimeout(slowNoticeTimer);
      clearInterval(interval);
    };
  }, [isNavigating]);

  if (progress === 0 && !isNavigating) return null;

  return (
    <>
      {/* Top Fixed Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none bg-black/5">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
          style={{
            width: `${progress}%`,
            opacity: progress === 100 ? 0 : 1,
            transition: progress === 100 ? 'opacity 0.3s ease-out, width 0.1s linear' : 'width 0.2s ease-out',
          }}
        />
      </div>

      {/* Floating Animated Pill for Slow Transitions */}
      {showSlowNotice && isNavigating && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none animate-bounce-subtle">
          <div className="bg-[#0F172A] text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700/60 flex items-center gap-3 backdrop-blur-md">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <div className="text-xs font-semibold flex items-center gap-1.5">
              <span>Moving to next page</span>
              <ArrowRight className="w-3 h-3 text-slate-400 animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function NavigationProgressBar() {
  return (
    <React.Suspense fallback={null}>
      <NavigationProgressBarInner />
    </React.Suspense>
  );
}
