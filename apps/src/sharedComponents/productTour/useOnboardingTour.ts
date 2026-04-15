import {useMemo} from 'react';
import {StepOptions, Tour} from 'shepherd.js';

import {trySetSessionStorage} from '@cdo/apps/utils';

import {createShepherdTour} from './shepherdTourFactory';

export interface UseOnboardingTourProps {
  getSteps: (tour: Tour) => StepOptions[];
  // Used to resume the tour after a page navigation. The current step ID is
  // saved to sessionStorage under this key so the tour can pick up where it
  // left off when the new page loads.
  sessionStorageKey: string;
  onComplete?: () => void;
  onCancel?: (currentStepIndex: number) => void;
  additionalStepOptions?: Partial<StepOptions>;
}

// Sets up an onboarding tour using Shepherd.js.
// Unlike useProductTour, this hook:
//   - Does not auto-start; the caller triggers tour.start() on a button click.
//   - Resumes automatically across page navigations via sessionStorage.
//   - Persists completion/cancellation to the backend (not localStorage).
//   - Uses a separate CSS class for distinct onboarding styling.
const useOnboardingTour = ({
  getSteps,
  sessionStorageKey,
  onComplete,
  additionalStepOptions,
}: UseOnboardingTourProps) => {
  const tour = useMemo(() => {
    const tour = createShepherdTour({
      stepClass: 'custom-shepherd-onboarding-container',
      additionalStepOptions,
    });
    tour.addSteps(getSteps(tour));

    tour.on('show', () => {
      if (!tour.currentStep) return;
      // Save the current step so that if a page navigation occurs mid-tour,
      // the new page resumes at this step.
      trySetSessionStorage(sessionStorageKey, tour.currentStep.id);
    });

    tour.on('complete', () => {
      trySetSessionStorage(sessionStorageKey, '');
      // TODO: persist completion to backend
      onComplete?.();
    });

    tour.on('cancel', () => {
      trySetSessionStorage(sessionStorageKey, '');
    });

    return tour;
  }, [additionalStepOptions, getSteps, onComplete, sessionStorageKey]);

  return {tour};
};

export default useOnboardingTour;
