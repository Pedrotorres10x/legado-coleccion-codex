import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackNavigation } from "@/lib/antispam";

/**
 * Monitors route changes and throttles rapid navigation
 * to deter automated scraping / enumeration.
 * When abuse is detected it adds a short artificial delay.
 */
const NavigationGuard = () => {
  const location = useLocation();
  const blocked = useRef(false);

  useEffect(() => {
    const isAbuse = trackNavigation();

    if (isAbuse && !blocked.current) {
      blocked.current = true;
      console.warn("[antispam] Navigation rate limit triggered");

      // Add a brief delay to slow down scrapers
      const timer = setTimeout(() => {
        blocked.current = false;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return null;
};

export default NavigationGuard;
