import {useEffect} from 'react';

import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

import {DemoType} from '../../teacherDashboard/types/teacherSectionTypes';

import {
  createReviewSyllabusHomepageSteps,
  createReviewSyllabusUnitOverviewSteps,
  REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
} from './reviewSyllabusOnboarding';

export {REVIEW_SYLLABUS_ONBOARDING_STEP_KEY};

const REVIEW_SYLLABUS_DEMO_TYPE_KEY = 'reviewSyllabusOnboardingDemoType';

// Call this on the unit overview page to resume the tour after lesson navigation.
// Runs outside React so it works regardless of render mode.
export const resumeReviewSyllabusOnboardingTour = () => {
  const savedStepId = tryGetSessionStorage(
    REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
    ''
  );
  if (!savedStepId) return;

  const demoType = tryGetSessionStorage(REVIEW_SYLLABUS_DEMO_TYPE_KEY, '') as
    | DemoType
    | '';
  if (!demoType) return;

  const tour = createShepherdTour({
    stepClass: 'custom-shepherd-onboarding-container',
  });
  tour.addSteps(createReviewSyllabusUnitOverviewSteps(tour, demoType));

  if (tour.steps.length === 0) {
    trySetSessionStorage(REVIEW_SYLLABUS_ONBOARDING_STEP_KEY, '');
    return;
  }

  const clearStep = () =>
    trySetSessionStorage(REVIEW_SYLLABUS_ONBOARDING_STEP_KEY, '');
  tour.on('complete', clearStep);
  tour.on('cancel', clearStep);

  const startStep = tour.steps.find(s => s.id === savedStepId) ?? tour.steps[0];
  tour.show(startStep.id);
};

const useReviewSyllabusTour = (demoType: DemoType | null) => {
  useEffect(() => {
    if (demoType) {
      trySetSessionStorage(REVIEW_SYLLABUS_DEMO_TYPE_KEY, demoType);
    }
  }, [demoType]);

  const {tour} = useOnboardingTour({
    getSteps: tour =>
      demoType
        ? createReviewSyllabusHomepageSteps(
            tour,
            REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
            demoType
          )
        : [],
    sessionStorageKey: REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
  });

  return tour;
};

export default useReviewSyllabusTour;
