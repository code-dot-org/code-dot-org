import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import HttpClient from '@cdo/apps/util/HttpClient';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

import {
  createHomepageSteps,
  createSectionsNewSteps,
} from './createSectionOnboarding';

export const CREATE_SECTION_ONBOARDING_STEP_KEY =
  'createSectionOnboardingCurrentStep';

export const recordTourCompletion = () => {
  HttpClient.post(
    '/dashboardapi/v1/user_product_tours',
    JSON.stringify({tour_name: 'create_class_section'}),
    true,
    {'Content-Type': 'application/json'}
  ).catch(err => console.error('Failed to record tour completion:', err));
};

// Call this on pages that the tour navigates to (e.g. sections/new).
// It runs outside React so it works regardless of render mode.
export const resumeCreateSectionOnboardingTour = (
  // TODO: Note that this might change once we get the grade sign up started.
  isElementaryTeacher: boolean
) => {
  const savedStepId = tryGetSessionStorage(
    CREATE_SECTION_ONBOARDING_STEP_KEY,
    ''
  );
  if (!savedStepId) return;

  const tour = createShepherdTour({
    stepClass: 'custom-shepherd-onboarding-container',
  });
  tour.addSteps(createSectionsNewSteps(tour, isElementaryTeacher));

  const clearStep = () =>
    trySetSessionStorage(CREATE_SECTION_ONBOARDING_STEP_KEY, '');
  tour.on('complete', () => {
    clearStep();
    recordTourCompletion();
  });
  tour.on('cancel', clearStep);

  // Resume at the saved step if it belongs to this page, otherwise start
  // at the first step (the saved step was from the previous page).
  const startStep = tour.steps.find(s => s.id === savedStepId) ?? tour.steps[0];
  tour.show(startStep.id);
};

const useCreateSectionTour = (isElementaryTeacher: boolean) => {
  const {tour} = useOnboardingTour({
    getSteps: tour =>
      createHomepageSteps(
        tour,
        isElementaryTeacher,
        CREATE_SECTION_ONBOARDING_STEP_KEY
      ),
    sessionStorageKey: CREATE_SECTION_ONBOARDING_STEP_KEY,
  });

  return tour;
};

export default useCreateSectionTour;
