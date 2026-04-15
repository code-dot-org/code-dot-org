import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

import {createSectionOnboardingTourSteps} from './createSectionOnboarding';

export const CREATE_SECTION_ONBOARDING_STEP_KEY =
  'createSectionOnboardingCurrentStep';

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
  tour.addSteps(createSectionOnboardingTourSteps(tour, isElementaryTeacher));

  const clearStep = () =>
    trySetSessionStorage(CREATE_SECTION_ONBOARDING_STEP_KEY, '');
  tour.on('complete', clearStep);
  tour.on('cancel', clearStep);

  tour.show(savedStepId);
};

const useTeacherHomepageTour = (isElementaryTeacher: boolean) => {
  const {tour} = useOnboardingTour({
    getSteps: tour =>
      createSectionOnboardingTourSteps(tour, isElementaryTeacher),
    sessionStorageKey: CREATE_SECTION_ONBOARDING_STEP_KEY,
  });

  return tour;
};

export default useTeacherHomepageTour;
