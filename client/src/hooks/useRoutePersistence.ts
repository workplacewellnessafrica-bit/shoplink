import { useEffect } from "react";
import { useLocation } from "wouter";

const LAST_ROUTE_KEY = "shoplink-last-route";
const EXCLUDED_ROUTES = ["/404", "/order/confirmation"]; // Routes not to persist

/**
 * Hook to persist the current route to localStorage
 * and restore it on app load
 */
export function useRoutePersistence() {
  const [location, setLocation] = useLocation();

  // Save route when it changes
  useEffect(() => {
    if (!EXCLUDED_ROUTES.includes(location)) {
      localStorage.setItem(LAST_ROUTE_KEY, location);
    }
  }, [location]);

  // Restore route on mount (only once)
  useEffect(() => {
    const savedRoute = localStorage.getItem(LAST_ROUTE_KEY);
    // Only restore if we're on home page (initial load)
    if (savedRoute && location === "/" && savedRoute !== "/") {
      setLocation(savedRoute);
    }
  }, []);
}

/**
 * Get the last saved route
 */
export function getLastRoute(): string | null {
  return localStorage.getItem(LAST_ROUTE_KEY);
}

/**
 * Clear the saved route
 */
export function clearLastRoute(): void {
  localStorage.removeItem(LAST_ROUTE_KEY);
}
