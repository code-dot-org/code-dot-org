import {useRef, useEffect} from 'react';
import {Tour} from 'shepherd.js';

// Automatically starts the given tour once it is non-null. Guards against starting the tour multiple times.
const useStartTourWhenAvailable = (tour: Tour | null) => {
  const tourStarted = useRef(false);
  useEffect(() => {
    if (tour && !tourStarted.current) {
      tourStarted.current = true;
      tour.start();
    }
  }, [tour]);
};
export default useStartTourWhenAvailable;
