import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {ValidationSettings} from '@cdo/apps/lab2/views/components/Instructions/InstructionsV2';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';
import experiments from '@cdo/apps/util/experiments';
import {tryGetLocalStorage} from '@cdo/apps/utils';

import {
  RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME,
  RESOURCE_PANEL_VALIDATION_FLOW_V2_NAME,
} from '../constants';

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

  const {tour: onboardingTour} = useProductTour({
    getSteps: createOnboardingTourSteps,
    localStorageKey: ONBOARDING_TOUR_LOCAL_STORAGE_KEY,
    tourAvailable: showOnboardingTour,
    onStart: onTourStart(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME),
    onComplete: onOnboardingTourComplete,
    onCancel: onTourCancel(RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME),
  });
  const showValidationTour = useMemo(
    () =>
      (showShepherdProductTours &&
        isValidationTourEnabled &&
        !!hasValidationConditions &&
        !!validationSettings &&
        onboardingTourSeen) ||
      false,
    [
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

  const tourStarted = useRef(false);
  useEffect(() => {
    if (onboardingTour && !tourStarted.current) {
      tourStarted.current = true;
      onboardingTour.start();
    }
  }, [onboardingTour]);

  const validationTourStarted = useRef(false);
  useEffect(() => {
    if (validationTour && !validationTourStarted.current) {
      validationTourStarted.current = true;
      validationTour.start();
    }
  }, [validationTour]);
};

export default useResourcePanelShepherdTours;
