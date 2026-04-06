import {useEffect, useRef} from 'react';
import {Tour} from 'shepherd.js';

// Automatically hides the previous tour when the tour instance changes (i.e. on level change).
// This will avoid showing tours that are no longer relevant.
const useHideTourOnTourChange = (tour: Tour | null) => {
  const prevTourRef = useRef<Tour | null>(null);

  useEffect(() => {
    const prevTour = prevTourRef.current;
    prevTourRef.current = tour;
    if (prevTour && prevTour !== tour) {
      prevTour.hide();
    }
    return () => {
      if (tour) {
        tour.hide();
      }
    };
  }, [tour]);
};
export default useHideTourOnTourChange;
