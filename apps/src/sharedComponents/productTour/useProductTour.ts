import {useCallback} from 'react';
import Shepherd, {StepOptions} from 'shepherd.js';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import '@cdo/apps/sharedComponents/productTour/shepherd.scss';

interface useProductTourProps {
  steps: StepOptions[];
  localStorageKey: string;
  tourAvailable: boolean;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: (currentStepIndex: number) => void;
}

const useProductTour = ({
  steps,
  localStorageKey,
  tourAvailable,
  onStart,
  onComplete,
  onCancel,
}: useProductTourProps) => {
  const tour = useCallback(() => {
    const tourSeen = tryGetLocalStorage(localStorageKey, 'no');
    if (!tourAvailable || tourSeen === 'yes') {
      return null;
    }
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      exitOnEsc: true,
      keyboardNavigation: true,
      defaultStepOptions: {
        cancelIcon: {enabled: true},
        scrollTo: false,
      },
    });
    tour.addSteps(steps);

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
  }, [localStorageKey, onCancel, onComplete, onStart, steps, tourAvailable]);

  return {tour};
};

export default useProductTour;
