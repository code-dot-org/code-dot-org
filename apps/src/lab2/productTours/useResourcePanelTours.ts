import {useCallback, useMemo, useState} from 'react';

import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent, sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
  VALIDATION_TOUR_SEEN,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/constants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import {tryGetLocalStorage} from '@cdo/apps/utils';

import {LevelProperties} from '../types';

import {TriggerSource} from './constants';
import {createOnboardingTourSteps} from './onboardingTourSteps';
import {
  ProductTour,
  ProductTourConfigurations,
  isTourEnabledOnLevel,
} from './productToursPerLab';
import {createValidationTourSteps} from './validationTourSteps';

interface UseResourcePanelToursParams {
  levelProperties: LevelProperties;
  isStandaloneCollapsed?: boolean;
}

const onTourStart = (flowName: string) => () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {
    flowName,
    triggerSource: TriggerSource.Auto,
  });

const onTourComplete = (flowName: string) => () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {
    flowName,
    triggerSource: TriggerSource.Auto,
  });

const onTourCancel = (flowName: string) => (stepIndex: number) =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
    flowName,
    step: stepIndex.toString(),
    triggerSource: TriggerSource.Auto,
  });

const ONBOARDING_FLOW_NAME =
  ProductTourConfigurations[ProductTour.ResourcePanelOnboarding].metricName;
const VALIDATION_FLOW_NAME =
  ProductTourConfigurations[ProductTour.ResourcePanelValidation].metricName;

const useResourcePanelTours = ({
  levelProperties,
  isStandaloneCollapsed,
}: UseResourcePanelToursParams) => {
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

  const isOnboardingTourEnabled = useMemo(() => {
    const isEnabledOnLevel = isTourEnabledOnLevel(
      ProductTour.ResourcePanelOnboarding,
      levelProperties
    );
    return isEnabledOnLevel && !isStandaloneCollapsed && !isLevelLoading;
  }, [levelProperties, isStandaloneCollapsed, isLevelLoading]);

  // ONBOARDING TOUR
  const [onboardingTourSeen, setOnboardingTourSeen] = useState(
    () =>
      tryGetLocalStorage(
        RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
        'no'
      ) === 'yes'
  );
  const onOnboardingTourComplete = useCallback(() => {
    onTourComplete(ONBOARDING_FLOW_NAME)();
    setOnboardingTourSeen(true);
  }, []);

  const onOnboardingTourCancel = useCallback((stepIndex: number) => {
    onTourCancel(ONBOARDING_FLOW_NAME)(stepIndex);
    setOnboardingTourSeen(true);
  }, []);

  const {tour: onboardingTour} = useLab2ProductTour({
    getSteps: createOnboardingTourSteps,
    localStorageKey: RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    tourAvailable: isOnboardingTourEnabled,
    onStart: onTourStart(ONBOARDING_FLOW_NAME),
    onComplete: onOnboardingTourComplete,
    onCancel: onOnboardingTourCancel,
  });

  useStartTourWhenAvailable(onboardingTour);

  // VALIDATION TOUR
  const showValidationTour = useMemo(
    () =>
      (!isLevelLoading &&
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelValidation,
          levelProperties
        ) &&
        (!isOnboardingTourEnabled || onboardingTourSeen)) ||
      false,
    [
      isLevelLoading,
      levelProperties,
      isOnboardingTourEnabled,
      onboardingTourSeen,
    ]
  );

  const {tour: validationTour} = useLab2ProductTour({
    getSteps: createValidationTourSteps,
    localStorageKey: VALIDATION_TOUR_SEEN,
    tourAvailable: showValidationTour,
    onStart: onTourStart(VALIDATION_FLOW_NAME),
    onComplete: onTourComplete(VALIDATION_FLOW_NAME),
    onCancel: onTourCancel(VALIDATION_FLOW_NAME),
  });

  useStartTourWhenAvailable(validationTour);
};

export default useResourcePanelTours;
