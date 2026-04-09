import { useState, useEffect } from "react";

/**
 * Hook to persist tab selection to localStorage
 * @param key - Unique key for storing the tab preference
 * @param defaultTab - Default tab value if not found in localStorage
 */
export function useTabPersistence(key: string, defaultTab: string) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Load saved tab on mount
  useEffect(() => {
    const savedTab = localStorage.getItem(`tab-${key}`);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [key]);

  // Save tab when it changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    localStorage.setItem(`tab-${key}`, newTab);
  };

  return {
    activeTab,
    setActiveTab: handleTabChange,
  };
}

/**
 * Clear all saved tabs
 */
export function clearAllTabPreferences() {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("tab-")) {
      localStorage.removeItem(key);
    }
  });
}
