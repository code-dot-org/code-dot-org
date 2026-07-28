import {useCallback, useEffect} from 'react';
import Shepherd, {Tour} from 'shepherd.js';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {recordOnboardingTourAbandonment} from '@cdo/apps/sharedComponents/productTour/productTourHelpers';
import {createShepherdTour} from '@cdo/apps/sharedComponents/productTour/shepherdTourFactory';
import useOnboardingTour from '@cdo/apps/sharedComponents/productTour/useOnboardingTour';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetSessionStorage, trySetSessionStorage} from '@cdo/apps/utils';

import {DemoType} from '../../teacherDashboard/types/teacherSectionTypes';

import {
  createReviewSyllabusHomepageSteps,
  createReviewSyllabusUnitOverviewSteps,
  ReviewSyllabusQuizConfig,
  REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
} from './reviewSyllabusOnboarding';

export {REVIEW_SYLLABUS_ONBOARDING_STEP_KEY};

const TOUR_NAME = 'view_syllabus';

export const recordViewSyllabusCompletion = () => {
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

const REVIEW_SYLLABUS_DEMO_TYPE_KEY = 'reviewSyllabusOnboardingDemoType';
const REVIEW_SYLLABUS_QUIZ_CONFIG_KEY = 'reviewSyllabusOnboardingQuizConfig';

// Call this on the unit overview page to resume the tour after lesson navigation.
// Both demoType and quizConfig are read from sessionStorage, persisted by
// useReviewSyllabusTour on the homepage while the Redux presets were available.
// fetchDemoPresets is not called on the unit overview page so Redux alone
// cannot bridge this navigation boundary.
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

  const quizConfigJson = tryGetSessionStorage(
    REVIEW_SYLLABUS_QUIZ_CONFIG_KEY,
    ''
  );
  let quizConfig: ReviewSyllabusQuizConfig | null = null;
  if (quizConfigJson) {
    try {
      quizConfig = JSON.parse(quizConfigJson) as ReviewSyllabusQuizConfig;
    } catch {
      trySetSessionStorage(REVIEW_SYLLABUS_QUIZ_CONFIG_KEY, '');
      quizConfig = null;
    }
  }

  // Cancel any running tour so we never show two tour popovers simultaneously.
  Shepherd.activeTour?.cancel();

  const tour = createShepherdTour({
    stepClass: 'custom-shepherd-onboarding-container',
  });
  tour.addSteps(
    createReviewSyllabusUnitOverviewSteps(tour, demoType, quizConfig)
  );

  if (tour.steps.length === 0) {
    trySetSessionStorage(REVIEW_SYLLABUS_ONBOARDING_STEP_KEY, '');
    return;
  }

  const clearStep = () =>
    trySetSessionStorage(REVIEW_SYLLABUS_ONBOARDING_STEP_KEY, '');
  tour.on('complete', () => {
    clearStep();
    recordViewSyllabusCompletion();
  });
  tour.on('cancel', () => {
    recordOnboardingTourAbandonment(
      tour,
      REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
      TOUR_NAME
    );
    clearStep();
  });

  const startStep = tour.steps.find(s => s.id === savedStepId) ?? tour.steps[0];
  tour.show(startStep.id);
};

const useReviewSyllabusTour = (demoType: DemoType | null) => {
  const demoPresets = useAppSelector(
    state => state.teacherSections.demoPresets
  );

  useEffect(() => {
    if (demoType) {
      trySetSessionStorage(REVIEW_SYLLABUS_DEMO_TYPE_KEY, demoType);
    } else {
      trySetSessionStorage(REVIEW_SYLLABUS_DEMO_TYPE_KEY, '');
    }
  }, [demoType]);

  useEffect(() => {
    const preset = demoType ? demoPresets[demoType] : undefined;
    if (
      preset &&
      preset.reviewSyllabusQuizLesson !== null &&
      preset.reviewSyllabusQuizOptions !== null
    ) {
      trySetSessionStorage(
        REVIEW_SYLLABUS_QUIZ_CONFIG_KEY,
        JSON.stringify({
          lesson: preset.reviewSyllabusQuizLesson,
          options: preset.reviewSyllabusQuizOptions,
        })
      );
    } else {
      trySetSessionStorage(REVIEW_SYLLABUS_QUIZ_CONFIG_KEY, '');
    }
  }, [demoType, demoPresets]);

  const getSteps = useCallback(
    (tour: Tour) =>
      demoType
        ? createReviewSyllabusHomepageSteps(
            tour,
            REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
            demoType
          )
        : [],
    [demoType]
  );

  const {tour} = useOnboardingTour({
    getSteps,
    sessionStorageKey: REVIEW_SYLLABUS_ONBOARDING_STEP_KEY,
    tourName: TOUR_NAME,
  });

  return tour;
};

export default useReviewSyllabusTour;
