import {useRef, useEffect} from 'react';
import {Tour} from 'shepherd.js';

// Automatically starts the given tour once it is non-null. Guards against starting the same tour instance multiple times.
const useStartTourWhenAvailable = (tour: Tour | null) => {
  const startedTourRef = useRef<Tour | null>(null);
  useEffect(() => {
    if (tour && startedTourRef.current !== tour) {
      startedTourRef.current = tour;
      tour.start();
    }
  }, [tour]);
};
export default useStartTourWhenAvailable;
