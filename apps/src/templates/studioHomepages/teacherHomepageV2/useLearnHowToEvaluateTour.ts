import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import HttpClient from '@cdo/apps/util/HttpClient';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

import {Section} from '../../teacherDashboard/types/teacherSectionTypes';

import {
  createLearnHowToEvaluateHomepageSteps,
  createLearnHowToEvaluateProgressSteps,
  LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
  STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID,
} from './learnHowToEvaluateOnboarding';

export {
  LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
  STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID,
};

export const recordLearnToEvaluateCompletion = () => {
  HttpClient.post(
    '/dashboardapi/v1/user_product_tours',
    JSON.stringify({tour_name: 'learn_to_evaluate'}),
    true,
    {'Content-Type': 'application/json'}
  ).catch(err => console.error('Failed to record tour completion:', err));
};

// Returns true when the tour has navigated to the Student Snapshot page and
// is waiting to show the snapshot-page steps.  Used by StudentSnapshot to
// know it should auto-select a lesson.
export const isLearnToEvaluateTourOnSnapshotPage = (): boolean => {
  const saved = tryGetSessionStorage(
    LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
    ''
  );
  return saved === STUDENT_SNAPSHOT_AI_INSIGHTS_STEP_ID;
};

// Call this on the section progress page to resume the tour after navigation.
// Runs outside React so it works regardless of render mode.
export const resumeLearnHowToEvaluateTour = () => {
  const savedStepId = tryGetSessionStorage(
    LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
    ''
  );
  if (!savedStepId) return;

  const tour = createShepherdTour({
    stepClass: 'custom-shepherd-onboarding-container',
  });
  tour.addSteps(createLearnHowToEvaluateProgressSteps(tour));

  if (tour.steps.length === 0) {
    trySetSessionStorage(LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY, '');
    return;
  }

  const clearStep = () =>
    trySetSessionStorage(LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY, '');
  tour.on('complete', () => {
    clearStep();
    recordLearnToEvaluateCompletion();
  });
  tour.on('cancel', clearStep);

  const startStep = tour.steps.find(s => s.id === savedStepId) ?? tour.steps[0];
  tour.show(startStep.id);
};

const useLearnHowToEvaluateTour = (demoSection: Section | null) => {
  const demoType = demoSection?.demoType ?? null;

  const {tour} = useOnboardingTour({
    getSteps: tour =>
      demoType
        ? createLearnHowToEvaluateHomepageSteps(
            tour,
            LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY
          )
        : [],
    sessionStorageKey: LEARN_HOW_TO_EVALUATE_ONBOARDING_STEP_KEY,
  });

  return tour;
};

export default useLearnHowToEvaluateTour;
