import { useState, useEffect } from 'react';

export function useAutosave<T>(key: string, initialValue: T) {
  // Load initial value from localStorage if it exists
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Error loading autosave for ${key}:`, e);
    }
    return initialValue;
  });

  // Save to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving autosave for ${key}:`, e);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
