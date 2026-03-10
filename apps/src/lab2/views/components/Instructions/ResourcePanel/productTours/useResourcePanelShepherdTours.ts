import {useCallback, useMemo, useState} from 'react';

import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent, sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME,
  RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {ValidationSettings} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/ValidationPanel';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import experiments from '@cdo/apps/util/experiments';
import {tryGetLocalStorage} from '@cdo/apps/utils';

import {createOnboardingTourSteps} from './onboardingTourShepherdSteps';
import {createValidationTourSteps} from './validationTourShepherdSteps';

const ONBOARDING_TOUR_LOCAL_STORAGE_KEY = 'resourcePanelOnboardingTourV2Seen';
const VALIDATION_TOUR_LOCAL_STORAGE_KEY = 'validationTourV2Seen';

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
  const showShepherdProductTours = experiments.isEnabledAllowingQueryString(
    experiments.SHEPHERD_PRODUCT_TOURS
  );

  // We track level load state to avoid starting tours while the level is still loading.
  // This can cause mutliple tours to show up if we load one for the previous level and
  // then one for the new level.
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    setIsLevelLoading(true);
  });

  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setIsLevelLoading(false);
  });

  // ONBOARDING TOUR
  const showOnboardingTour = useMemo(
    () => (showShepherdProductTours && isOnboardingTourEnabled) || false,
    [showShepherdProductTours, isOnboardingTourEnabled]
  );
  const [onboardingTourSeen, setOnboardingTourSeen] = useState(
    () => tryGetLocalStorage(ONBOARDING_TOUR_LOCAL_STORAGE_KEY, 'no') === 'yes'
  );
  const onOnboardingTourComplete = useCallback(() => {
    onTourComplete(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME)();
    setOnboardingTourSeen(true);
  }, []);

  const onOnboardingTourCancel = useCallback((stepIndex: number) => {
    onTourCancel(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME)(stepIndex);
    setOnboardingTourSeen(true);
  }, []);

  const {tour: onboardingTour} = useProductTour({
    getSteps: createOnboardingTourSteps,
    localStorageKey: ONBOARDING_TOUR_LOCAL_STORAGE_KEY,
    tourAvailable: showOnboardingTour && !isLevelLoading,
    onStart: onTourStart(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME),
    onComplete: onOnboardingTourComplete,
    onCancel: onOnboardingTourCancel,
  });

  useStartTourWhenAvailable(onboardingTour);

  // VALIDATION TOUR
  const showValidationTour = useMemo(
    () =>
      (!isLevelLoading &&
        showShepherdProductTours &&
        isValidationTourEnabled &&
        !!hasValidationConditions &&
        !!validationSettings &&
        onboardingTourSeen) ||
      false,
    [
      isLevelLoading,
      showShepherdProductTours,
      isValidationTourEnabled,
      hasValidationConditions,
      validationSettings,
      onboardingTourSeen,
    ]
  );

  const {tour: validationTour} = useProductTour({
    getSteps: createValidationTourSteps,
    localStorageKey: VALIDATION_TOUR_LOCAL_STORAGE_KEY,
    tourAvailable: showValidationTour,
    onStart: onTourStart(RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME),
    onComplete: onTourComplete(RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME),
    onCancel: onTourCancel(RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME),
  });

  useStartTourWhenAvailable(validationTour);
};

export default useResourcePanelShepherdTours;
