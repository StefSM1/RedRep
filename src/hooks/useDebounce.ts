import { useState, useEffect } from 'react';

/**
 * Debounce hook — delays updating the returned value until
 * the input has stopped changing for `delay` ms.
 * Useful for search inputs to prevent excessive filtering.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
