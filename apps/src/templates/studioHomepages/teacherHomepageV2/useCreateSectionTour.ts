import {useCallback} from 'react';
import Shepherd, {Tour} from 'shepherd.js';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {attachOnboardingAnalytics} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import HttpClient from '@cdo/apps/util/HttpClient';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

import {
  createHomepageSteps,
  createSectionsNewSteps,
} from './createSectionOnboarding';

const TOUR_NAME = 'create_class_section';

export const CREATE_SECTION_ONBOARDING_STEP_KEY =
  'createSectionOnboardingCurrentStep';

export const recordTourCompletion = () => {
  analyticsReporter.sendEvent(EVENTS.ONBOARDING_TOUR_COMPLETED, {
    tour_name: TOUR_NAME,
  });
  HttpClient.post(
    '/dashboardapi/v1/user_product_tours',
    JSON.stringify({tour_name: TOUR_NAME}),
    true,
    {'Content-Type': 'application/json'}
  ).catch(err => console.error('Failed to record tour completion:', err));
};

// Call this on pages that the tour navigates to (e.g. sections/new).
// It runs outside React so it works regardless of render mode.
export const resumeCreateSectionOnboardingTour = () => {
  const savedStepId = tryGetSessionStorage(
    CREATE_SECTION_ONBOARDING_STEP_KEY,
    ''
  );
  if (!savedStepId) return;

  // Cancel any running tour (e.g. the homepage tour still mounted during SPA
  // navigation) so we never show two tour popovers simultaneously.
  Shepherd.activeTour?.cancel();

  const tour = createShepherdTour({
    stepClass: 'custom-shepherd-onboarding-container',
  });
  tour.addSteps(createSectionsNewSteps(tour));
  attachOnboardingAnalytics(
    tour,
    TOUR_NAME,
    CREATE_SECTION_ONBOARDING_STEP_KEY
  );

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

const useCreateSectionTour = (gradesTeaching: string[] | null | undefined) => {
  const getSteps = useCallback(
    (tour: Tour) =>
      createHomepageSteps(
        tour,
        gradesTeaching,
        CREATE_SECTION_ONBOARDING_STEP_KEY,
        TOUR_NAME
      ),
    [gradesTeaching]
  );

  const {tour} = useOnboardingTour({
    getSteps,
    sessionStorageKey: CREATE_SECTION_ONBOARDING_STEP_KEY,
    tourName: TOUR_NAME,
  });

  return tour;
};

export default useCreateSectionTour;
