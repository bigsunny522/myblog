"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/lib/store/ui-store';

export function GlobalUIController() {
  const pathname = usePathname();
  const showHeader = useUIStore((state) => state.showHeader);

  useEffect(() => {
    // If not on the home page, always show header
    if (pathname !== '/') {
      showHeader();
      return;
    }

    // If on home page, check if visited
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      showHeader();
    }
    // If not visited and on home page, keep hidden (default state)
    // OpeningAnimation will trigger showHeader when done
  }, [pathname, showHeader]);

  return null;
}
