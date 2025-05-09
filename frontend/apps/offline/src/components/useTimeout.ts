import {useEffect, useRef} from 'react';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type TimeoutCallback = (...args: any[]) => void;

/**
 * Gives the ability to assign a callback to a timeout.
 */
export const useTimeout = (callback: TimeoutCallback, delay: number) => {
  const savedCallback = useRef<TimeoutCallback | undefined>();
  const timerId = useRef<ReturnType<typeof setTimeout>>();
  const currentDelay = useRef<number>(delay);

  // Retain a callback and a delay for any future timeouts
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    currentDelay.current = delay;
  }, [delay]);

  // Ensure we clear the timeout on unmount
  useEffect(() => {
    return () => {
      if (timerId.current) {
        clearTimeout(timerId.current);
        timerId.current = undefined;
      }
    };
  }, []);

  return {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    call: (delay?: number, parameters?: any[]) => {
      // Cancel any current timer
      if (timerId.current) {
        clearTimeout(timerId.current);
        timerId.current = undefined;
      }

      // Get the delay
      delay = delay === undefined ? currentDelay.current : delay;

      // The callback wrapper
      const tick = () => {
        if (savedCallback.current !== undefined) {
          savedCallback.current(...(parameters || []));
        }
      };

      // Queue the timeout
      timerId.current = setTimeout(tick, delay);
    },
    cancel: () => {
      // Cancel the timeout when requested
      if (timerId.current) {
        clearTimeout(timerId.current);
        timerId.current = undefined;
      }
    },
  };
};
