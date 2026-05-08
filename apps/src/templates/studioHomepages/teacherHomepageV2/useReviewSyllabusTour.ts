import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

import {
  createReviewSyllabusHomepageSteps,
  createReviewSyllabusUnitOverviewSteps,
  REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
} from './reviewSyllabusOnboarding';

export {REVIEW_SYLLABUS_ONBOARDING_STEP_KEY};

// Call this on the unit overview page to resume the tour after lesson navigation.
// Runs outside React so it works regardless of render mode.
export const resumeReviewSyllabusOnboardingTour = () => {
  const savedStepId = tryGetSessionStorage(
    REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
    ''
  );
  if (!savedStepId) return;

  const tour = createShepherdTour({
    stepClass: 'custom-shepherd-onboarding-container',
  });
  tour.addSteps(createReviewSyllabusUnitOverviewSteps(tour));

  const clearStep = () =>
    trySetSessionStorage(REVIEW_SYLLABUS_ONBOARDING_STEP_KEY, '');
  tour.on('complete', clearStep);
  tour.on('cancel', clearStep);

  const startStep = tour.steps.find(s => s.id === savedStepId) ?? tour.steps[0];
  tour.show(startStep.id);
};

const useReviewSyllabusTour = () => {
  const {tour} = useOnboardingTour({
    getSteps: tour =>
      createReviewSyllabusHomepageSteps(
        tour,
        REVIEW_SYLLABUS_ONBOARDING_STEP_KEY
      ),
    sessionStorageKey: REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
  });

  return tour;
};

export default useReviewSyllabusTour;
