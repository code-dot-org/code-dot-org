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

  const isWeblab2 = levelProperties.appName === 'weblab2';

  // WEB LAB 2 ONBOARDING TOUR
  const isWeblab2OnboardingEnabled = useMemo(() => {
    const isEnabledOnLevel = isTourEnabledOnLevel(
      ProductTour.Weblab2Onboarding,
      levelProperties
    );
    return (
      isWeblab2 &&
      isEnabledOnLevel &&
      !isStandaloneCollapsed &&
      !isLevelLoading
    );
  }, [isWeblab2, levelProperties, isStandaloneCollapsed, isLevelLoading]);

  const [weblab2OnboardingTourSeen, setWeblab2OnboardingTourSeen] = useState(
    () => tryGetLocalStorage(WEBLAB2_ONBOARDING_TOUR_SEEN, 'no') === 'yes'
  );
  useEffect(() => {
    setWeblab2OnboardingTourSeen(
      tryGetLocalStorage(WEBLAB2_ONBOARDING_TOUR_SEEN, 'no') === 'yes'
    );
  }, []);

  const onWeblab2OnboardingTourComplete = useCallback(() => {
    onTourComplete(
      ProductTourConfigurations[ProductTour.Weblab2Onboarding].metricName
    )();
    setWeblab2OnboardingTourSeen(true);
  }, []);

  const onWeblab2OnboardingTourCancel = useCallback((stepIndex: number) => {
    onTourCancel(
      ProductTourConfigurations[ProductTour.Weblab2Onboarding].metricName
    )(stepIndex);
    setWeblab2OnboardingTourSeen(true);
  }, []);

  const {tour: weblab2OnboardingTour} = useLab2ProductTour({
    getSteps: ProductTourConfigurations[ProductTour.Weblab2Onboarding].getSteps,
    localStorageKey: WEBLAB2_ONBOARDING_TOUR_SEEN,
    tourAvailable: isWeblab2OnboardingEnabled,
    onStart: onTourStart(
      ProductTourConfigurations[ProductTour.Weblab2Onboarding].metricName
    ),
    onComplete: onWeblab2OnboardingTourComplete,
    onCancel: onWeblab2OnboardingTourCancel,
  });

  useStartTourWhenAvailable(weblab2OnboardingTour);

  // RESOURCE PANEL ONBOARDING TOUR
  const isResourcePanelOnboardingEnabled = useMemo(() => {
    const isEnabledOnLevel = isTourEnabledOnLevel(
      ProductTour.ResourcePanelOnboarding,
      levelProperties
    );
    return isEnabledOnLevel && !isStandaloneCollapsed && !isLevelLoading;
  }, [levelProperties, isStandaloneCollapsed, isLevelLoading]);

  // For Web Lab 2, wait for the Web Lab onboarding tour before showing the
  // resource panel onboarding tour. Other labs should show this tour normally.
  const showResourcePanelOnboardingTour = useMemo(
    () =>
      isResourcePanelOnboardingEnabled &&
      (!isWeblab2 || weblab2OnboardingTourSeen),
    [isResourcePanelOnboardingEnabled, isWeblab2, weblab2OnboardingTourSeen]
  );

  const [resourcePanelOnboardingTourSeen, setResourcePanelOnboardingTourSeen] =
    useState(
      () =>
        tryGetLocalStorage(RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN, 'no') ===
        'yes'
    );
  useEffect(() => {
    setResourcePanelOnboardingTourSeen(
      tryGetLocalStorage(RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN, 'no') ===
        'yes'
    );
  }, []);
  const onResourcePanelOnboardingTourComplete = useCallback(() => {
    onTourComplete(
      ProductTourConfigurations[ProductTour.ResourcePanelOnboarding].metricName
    )();
    setResourcePanelOnboardingTourSeen(true);
  }, []);

  const onResourcePanelOnboardingTourCancel = useCallback(
    (stepIndex: number) => {
      onTourCancel(
        ProductTourConfigurations[ProductTour.ResourcePanelOnboarding]
          .metricName
      )(stepIndex);
      setResourcePanelOnboardingTourSeen(true);
    },
    []
  );

  const {tour: resourcePanelOnboardingTour} = useLab2ProductTour({
    getSteps:
      ProductTourConfigurations[ProductTour.ResourcePanelOnboarding].getSteps,
    localStorageKey: RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    tourAvailable: showResourcePanelOnboardingTour,
    onStart: onTourStart(
      ProductTourConfigurations[ProductTour.ResourcePanelOnboarding].metricName
    ),
    onComplete: onResourcePanelOnboardingTourComplete,
    onCancel: onResourcePanelOnboardingTourCancel,
  });

  useStartTourWhenAvailable(resourcePanelOnboardingTour);

  // VALIDATION TOUR
  const showValidationTour = useMemo(
    () =>
      (!isLevelLoading &&
        isTourEnabledOnLevel(
          ProductTour.ResourcePanelValidation,
          levelProperties
        ) &&
        (!showResourcePanelOnboardingTour || resourcePanelOnboardingTourSeen)) ||
      false,
    [
      isLevelLoading,
      levelProperties,
      showResourcePanelOnboardingTour,
      resourcePanelOnboardingTourSeen,
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
