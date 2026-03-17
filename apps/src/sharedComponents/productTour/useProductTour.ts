import {useMemo} from 'react';
import Shepherd, {StepOptions, Tour} from 'shepherd.js';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import '@cdo/apps/sharedComponents/productTour/shepherd.scss';

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
// FOR DEMO PURPOSES ONLY: ONLY USE BEHIND AN EXPERIMENT FLAG FOR NOW
const useProductTour = ({
  getSteps,
  localStorageKey,
  tourAvailable,
  onStart,
  onComplete,
  onCancel,
  additionalStepOptions,
}: UseProductTourProps) => {
  const tour = useMemo(() => {
    const tourSeen = tryGetLocalStorage(localStorageKey, 'no');
    const urlParams = new URLSearchParams(window.location.search);
    const allToursHidden = urlParams.get(TOUR_HIDDEN_FLAG) === 'true';
    if (!tourAvailable || tourSeen === 'yes' || allToursHidden) {
      return null;
    }
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      exitOnEsc: true,
      keyboardNavigation: true,
      defaultStepOptions: {
        cancelIcon: {enabled: true},
        scrollTo: true,
        classes: 'custom-shepherd-step-container',
        ...(additionalStepOptions ?? {}),
      },
    });
    tour.addSteps(getSteps(tour));

    if (onStart) {
      tour.on('start', onStart);
    }

    tour.on('complete', () => {
      trySetLocalStorage(localStorageKey, 'yes');
      onComplete && onComplete();
    });

    tour.on('cancel', () => {
      const currentIndex = tour.currentStep
        ? tour.steps.indexOf(tour.currentStep)
        : 0;
      trySetLocalStorage(localStorageKey, 'yes');
      onCancel && onCancel(currentIndex);
    });
    return tour;
  }, [
    additionalStepOptions,
    getSteps,
    localStorageKey,
    onCancel,
    onComplete,
    onStart,
    tourAvailable,
  ]);

  return {tour};
};

export default useProductTour;
