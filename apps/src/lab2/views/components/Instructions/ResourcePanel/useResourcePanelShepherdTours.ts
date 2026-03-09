import {useEffect, useMemo, useRef} from 'react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';
import experiments from '@cdo/apps/util/experiments';

import {RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME} from './constants';
import {createResourcePanelTourSteps} from './resourcePanelTourShepherdSteps';

const useResourcePanelShepherdTours = (isOnboardingTourEnabled: boolean) => {
  const showShepherdProductTours = experiments.isEnabledAllowingQueryString(
    experiments.SHEPHERD_PRODUCT_TOURS
  );
  const showOnboardingTour = useMemo(
    () => (showShepherdProductTours && isOnboardingTourEnabled) || false,
    [showShepherdProductTours, isOnboardingTourEnabled]
  );
  const {tour: onboardingTour} = useProductTour({
    getSteps: createResourcePanelTourSteps,
    localStorageKey: 'resourcePanelOnboardingTourV2Seen',
    tourAvailable: showOnboardingTour,
    onStart: () =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME,
      }),
    onComplete: () =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME,
      }),
    onCancel: (stepIndex: number) =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_V2_NAME,
        step: stepIndex.toString(),
      }),
  });

  const tourStarted = useRef(false);
  useEffect(() => {
    if (onboardingTour && !tourStarted.current) {
      tourStarted.current = true;
      onboardingTour.start();
    }
  }, [onboardingTour]);
};

export default useResourcePanelShepherdTours;
