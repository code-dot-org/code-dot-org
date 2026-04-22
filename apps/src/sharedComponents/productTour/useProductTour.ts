import {useMemo, useRef} from 'react';
import {StepOptions, Tour} from 'shepherd.js';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import '@cdo/apps/sharedComponents/productTour/shepherd.scss';
import {createTourWithSteps} from './productTourHelpers';

export interface UseProductTourProps {
  getSteps: (tour: Tour) => StepOptions[];
  localStorageKey: string;
  tourAvailable: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: (currentStepIndex: number) => void;
  additionalStepOptions?: Partial<StepOptions>;
}

// Universal flag to hide any product tour via URL parameter.
// Useful for unit tests, internal users, etc.
const TOUR_HIDDEN_FLAG = 'hideProductTours';

// Sets up a product tour using Shepherd.js: https://docs.shepherdjs.dev/guides/usage/
// A tour will only be returned if the localStorageKey is not set to 'yes' and tourAvailable is true,
// otherwise we return null for the tour.
const useProductTour = ({
  getSteps,
  localStorageKey,
  tourAvailable,
  onStart,
  onComplete,
  onCancel,
  additionalStepOptions,
}: UseProductTourProps) => {
  // Store callbacks in refs so the tour instance doesn't need to be recreated
  // when callback identity changes between renders.
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;

  const tour = useMemo(() => {
    const tourSeen = tryGetLocalStorage(localStorageKey, 'no');
    const urlParams = new URLSearchParams(window.location.search);
    const allToursHidden = urlParams.get(TOUR_HIDDEN_FLAG) === 'true';
    if (!tourAvailable || tourSeen === 'yes' || allToursHidden) {
      return null;
    }
    const tour = createTourWithSteps(getSteps, additionalStepOptions);

    tour.on('start', () => onStartRef.current && onStartRef.current());

    tour.on('complete', () => {
      trySetLocalStorage(localStorageKey, 'yes');
      onCompleteRef.current && onCompleteRef.current();
    });

    tour.on('cancel', () => {
      const currentIndex = tour.currentStep
        ? tour.steps.indexOf(tour.currentStep)
        : 0;
      trySetLocalStorage(localStorageKey, 'yes');
      onCancelRef.current && onCancelRef.current(currentIndex);
    });
    return tour;
  }, [additionalStepOptions, getSteps, localStorageKey, tourAvailable]);

  return {tour};
};

export default useProductTour;
