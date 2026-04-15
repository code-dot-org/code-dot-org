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

  // The saved step may be from a previous page (e.g. 'picture-login' belongs
  // to the teacher homepage, not /sections/new). Resume at whichever comes
  // later: the saved step or the first step that belongs to this page.
  // The beforeShowPromise on each step handles waiting for its element to
  // appear asynchronously, so no synchronous DOM check is needed here.
  const FIRST_STEP_ID_ON_THIS_PAGE = 'name-section';
  const savedIndex = tour.steps.findIndex(s => s.id === savedStepId);
  const pageStartIndex = tour.steps.findIndex(
    s => s.id === FIRST_STEP_ID_ON_THIS_PAGE
  );

  if (savedIndex === -1 || pageStartIndex === -1) {
    clearStep();
    return;
  }

  tour.show(tour.steps[Math.max(savedIndex, pageStartIndex)].id);
};

const useCreateSectionTour = (isElementaryTeacher: boolean) => {
  const {tour} = useOnboardingTour({
    getSteps: tour =>
      createSectionOnboardingTourSteps(tour, isElementaryTeacher),
    sessionStorageKey: CREATE_SECTION_ONBOARDING_STEP_KEY,
  });

  return tour;
};

export default useCreateSectionTour;
