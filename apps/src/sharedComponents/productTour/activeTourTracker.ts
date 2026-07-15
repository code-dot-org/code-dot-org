import type {Tour} from 'shepherd.js';

// At most one tour should run at a time. This module tracks the currently
// active tour and cancels it when a new one starts.
let activeTour: Tour | null = null;

export const registerActiveTour = (tour: Tour): void => {
  tour.on('start', () => {
    if (activeTour && activeTour !== tour) {
      activeTour.cancel();
    }
    activeTour = tour;
  });

  const clear = () => {
    if (activeTour === tour) activeTour = null;
  };
  tour.on('complete', clear);
  tour.on('cancel', clear);
};

// True while a product tour is running. Lets guided UI (e.g. Sketch Lab's
// element toolbars) suppress focus-driven auto-close behavior that would
// otherwise fight the tour when it moves focus into its own popup.
export const hasActiveTour = (): boolean => activeTour !== null;
