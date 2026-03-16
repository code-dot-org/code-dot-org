import {useCallback, useMemo, useState} from 'react';

import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent, sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME,
  RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
  RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME,
  VALIDATION_TOUR_SEEN,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {ValidationSettings} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Validation/ValidationPanel';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import {tryGetLocalStorage} from '@cdo/apps/utils';

import {createOnboardingTourSteps} from './onboardingTourShepherdSteps';
import {createValidationTourSteps} from './validationTourShepherdSteps';

interface UseResourcePanelShepherdToursParams {
  isOnboardingTourEnabled: boolean;
  isValidationTourEnabled: boolean;
  hasValidationConditions: boolean | undefined;
  validationSettings: ValidationSettings | undefined;
}

const onTourStart = (flowName: string) => () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {flowName});

const onTourComplete = (flowName: string) => () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {flowName});

const onTourCancel = (flowName: string) => (stepIndex: number) =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
    flowName,
    step: stepIndex.toString(),
  });

const useResourcePanelShepherdTours = ({
  isOnboardingTourEnabled,
  isValidationTourEnabled,
  hasValidationConditions,
  validationSettings,
}: UseResourcePanelShepherdToursParams) => {
  // We track level load state to avoid starting tours while the level is still loading.
  // This can cause multiple tours to show up if we load one for the previous level and
  // then one for the new level.
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    setIsLevelLoading(true);
  });

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setIsLevelLoading(false);
  });

  // ONBOARDING TOUR
  const [onboardingTourSeen, setOnboardingTourSeen] = useState(
    () =>
      tryGetLocalStorage(
        RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
        'no'
      ) === 'yes'
  );
  const onOnboardingTourComplete = useCallback(() => {
    onTourComplete(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME)();
    setOnboardingTourSeen(true);
  }, []);

  const onOnboardingTourCancel = useCallback((stepIndex: number) => {
    onTourCancel(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME)(stepIndex);
    setOnboardingTourSeen(true);
  }, []);

  const {tour: onboardingTour} = useLab2ProductTour({
    getSteps: createOnboardingTourSteps,
    localStorageKey: RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    tourAvailable: isOnboardingTourEnabled && !isLevelLoading,
    onStart: onTourStart(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME),
    onComplete: onOnboardingTourComplete,
    onCancel: onOnboardingTourCancel,
  });

  useStartTourWhenAvailable(onboardingTour);

  // VALIDATION TOUR
  const showValidationTour = useMemo(
    () =>
      (!isLevelLoading &&
        isValidationTourEnabled &&
        !!hasValidationConditions &&
        !!validationSettings &&
        onboardingTourSeen) ||
      false,
    [
      isLevelLoading,
      isValidationTourEnabled,
      hasValidationConditions,
      validationSettings,
      onboardingTourSeen,
    ]
  );

  const {tour: validationTour} = useLab2ProductTour({
    getSteps: createValidationTourSteps,
    localStorageKey: VALIDATION_TOUR_SEEN,
    tourAvailable: showValidationTour,
    onStart: onTourStart(RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME),
    onComplete: onTourComplete(RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME),
    onCancel: onTourCancel(RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME),
  });

  useStartTourWhenAvailable(validationTour);
};

export default useResourcePanelShepherdTours;
