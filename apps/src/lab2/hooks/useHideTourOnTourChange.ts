import {useEffect} from 'react';
import {Tour} from 'shepherd.js';

// Automatically hides the previous tour when the tour instance changes (i.e. on level change).
// This will avoid showing tours that are no longer relevant.
const useHideTourOnTourChange = (tour: Tour | null) => {
  useEffect(() => {
    return () => {
      if (tour) {
        tour.hide();
      }
    };
  }, [tour]);
};
export default useHideTourOnTourChange;
