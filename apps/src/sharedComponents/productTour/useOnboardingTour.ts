import {useMemo} from 'react';
import {StepOptions, Tour} from 'shepherd.js';

import {createShepherdTour} from './shepherdTourFactory';

export interface UseOnboardingTourProps {
  getSteps: (tour: Tour) => StepOptions[];
  onComplete?: () => void;
  onCancel?: (currentStepIndex: number) => void;
  additionalStepOptions?: Partial<StepOptions>;
}

// Sets up an onboarding tour using Shepherd.js.
// Unlike useProductTour, this hook:
//   - Does not auto-start; the caller triggers tour.start() on a button click.
//   - Persists progress to the backend (not localStorage).
//   - Uses a separate CSS class for distinct onboarding styling.
const useOnboardingTour = ({
  getSteps,
  onComplete,
  onCancel,
  additionalStepOptions,
}: UseOnboardingTourProps) => {
  const tour = useMemo(() => {
    const tour = createShepherdTour({
      stepClass: 'custom-shepherd-onboarding-container',
      additionalStepOptions,
    });
    tour.addSteps(getSteps(tour));

    tour.on('complete', () => {
      // TODO: persist completion to backend
      onComplete?.();
    });

    tour.on('cancel', () => {
      const currentIndex = tour.currentStep
        ? tour.steps.indexOf(tour.currentStep)
        : 0;
      // TODO: persist progress to backend
      onCancel?.(currentIndex);
    });

    return tour;
  }, [additionalStepOptions, getSteps, onCancel, onComplete]);

  return {tour};
};

export default useOnboardingTour;
