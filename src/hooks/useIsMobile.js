import { useEffect, useState } from 'react';

/**
 * Responsive helper hook that flags mobile viewports (<= breakpoint width).
 * Uses matchMedia when available and falls back to window.innerWidth.
 */
export default function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth <= breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const query = `(max-width: ${breakpoint}px)`;
    const mediaQuery = window.matchMedia(query);

    const apply = event => setIsMobile(event.matches);

    // Initialise with current state
    apply(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', apply);
      return () => mediaQuery.removeEventListener('change', apply);
    }
    mediaQuery.addListener(apply);
    return () => mediaQuery.removeListener(apply);
  }, [breakpoint]);

  return isMobile;
}
