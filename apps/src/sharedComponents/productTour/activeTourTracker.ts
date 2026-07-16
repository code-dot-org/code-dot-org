import type {Tour} from 'shepherd.js';

// At most one tour should run at a time. This module tracks the currently
// active tour and cancels it when a new one starts.
let activeTour: Tour | null = null;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(listener => listener());

export const registerActiveTour = (tour: Tour): void => {
  tour.on('start', () => {
    if (activeTour && activeTour !== tour) {
      activeTour.cancel();
    }
    activeTour = tour;
    notify();
  });

  const clear = () => {
    if (activeTour === tour) {
      activeTour = null;
      notify();
    }
  };
  tour.on('complete', clear);
  tour.on('cancel', clear);
};

export const hasActiveTour = (): boolean => activeTour !== null;

// Subscribe to changes in whether a tour is active.
export const subscribeToActiveTour = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
