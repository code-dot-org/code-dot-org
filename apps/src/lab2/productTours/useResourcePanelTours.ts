import {useCallback, useEffect, useMemo, useState} from 'react';

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

const VALIDATION_FLOW_NAME =
  ProductTourConfigurations[ProductTour.ResourcePanelValidation].metricName;
const WEBLAB2_ONBOARDING_TOUR_SEEN = 'weblab2OnboardingTourSeen';

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

  const onboardingTour = useMemo(
    () =>
      levelProperties.appName === 'weblab2'
        ? ProductTour.Weblab2Onboarding
        : ProductTour.ResourcePanelOnboarding,
    [levelProperties.appName]
  );

  const onboardingFlowName =
    ProductTourConfigurations[onboardingTour].metricName;
  const onboardingTourSeenStorageKey =
    onboardingTour === ProductTour.Weblab2Onboarding
      ? WEBLAB2_ONBOARDING_TOUR_SEEN
      : RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN;

  const isOnboardingTourEnabled = useMemo(() => {
    const isEnabledOnLevel = isTourEnabledOnLevel(
      onboardingTour,
      levelProperties
    );
    return isEnabledOnLevel && !isStandaloneCollapsed && !isLevelLoading;
  }, [levelProperties, isStandaloneCollapsed, isLevelLoading, onboardingTour]);

  // ONBOARDING TOUR
  const [onboardingTourSeen, setOnboardingTourSeen] = useState(
    () => tryGetLocalStorage(onboardingTourSeenStorageKey, 'no') === 'yes'
  );
  useEffect(() => {
    setOnboardingTourSeen(
      tryGetLocalStorage(onboardingTourSeenStorageKey, 'no') === 'yes'
    );
  }, [onboardingTourSeenStorageKey]);
  const onOnboardingTourComplete = useCallback(() => {
    onTourComplete(onboardingFlowName)();
    setOnboardingTourSeen(true);
  }, [onboardingFlowName]);

  const onOnboardingTourCancel = useCallback(
    (stepIndex: number) => {
      onTourCancel(onboardingFlowName)(stepIndex);
      setOnboardingTourSeen(true);
    },
    [onboardingFlowName]
  );

  const {tour: activeOnboardingTour} = useLab2ProductTour({
    getSteps: ProductTourConfigurations[onboardingTour].getSteps,
    localStorageKey: onboardingTourSeenStorageKey,
    tourAvailable: isOnboardingTourEnabled,
    onStart: onTourStart(onboardingFlowName),
    onComplete: onOnboardingTourComplete,
    onCancel: onOnboardingTourCancel,
  });

  useStartTourWhenAvailable(activeOnboardingTour);

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
