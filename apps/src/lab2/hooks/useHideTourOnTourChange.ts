import {useEffect, useRef} from 'react';
import {Tour} from 'shepherd.js';

// Automatically hides the previous tour when the tour instance changes (i.e. on level change).
// We want to hide tours on level change to avoid showing tours that are no longer relevant.
// The next level should handle showing any relevant tours.
const useHideTourOnTourChange = (tour: Tour | null) => {
  const prevTourRef = useRef<Tour | null>(null);

  useEffect(() => {
    const prevTour = prevTourRef.current;
    prevTourRef.current = tour;
    if (prevTour && prevTour !== tour) {
      console.log('Tour instance changed, hiding the previous tour');
      prevTour.hide();
    }
  }, [tour]);
};
export default useHideTourOnTourChange;
