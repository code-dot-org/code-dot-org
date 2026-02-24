import {useEffect, useState} from 'react';

/**
 * A custom hook that returns a debounced value. The value will update after the specified delay
 * unless an updated value is passed before the timeout completes. In which case, the timeout will be
 * cancelled and a new one will be set.
 *
 * This is useful for reducing the number of times an API is called based on user input
 *
 * @param value - The value to be debounced
 * @param delay - The delay in milliseconds before the value is updated
 * @returns - The debounced value (include in a useEffect to respond to changes)
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
