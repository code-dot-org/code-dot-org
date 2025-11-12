import {Steps} from 'intro.js-react';
import React, {useState} from 'react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN} from './constants';
import {STEPS, INITIAL_STEP} from './resourcePanelTourHelpers';

// Check if tour should be disabled (e.g., during UI tests) before any rendering.
// This runs when the module is first imported so localStorage is set early.
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('noIntrojs') === 'true') {
  trySetLocalStorage(RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN, 'yes');
}
const RESOURCE_PANEL_ONBOARDING_FLOW_NAME = 'Resource Panel Onboarding';

// Note that this introjs flow includes a step that highlights the navigation button which is always visible
// at the bottom of the resource panel (whether it's enabled or not).
// Some labs do not always show the navigation button so this tour is not appropriate for all labs.
const OnboardingTourSteps: React.FC = () => {
  const resourcePanelPinnedButtonOnboardingTourSeen = tryGetLocalStorage(
    RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    'no'
  );
  const [tourStep, setTourStep] = useState(0);

  return (
    <Steps
      enabled={resourcePanelPinnedButtonOnboardingTourSeen !== 'yes'}
      initialStep={INITIAL_STEP}
      steps={STEPS}
      onStart={() => {
        sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_STARTED, {
          flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
        });
      }}
      onExit={() => {
        trySetLocalStorage(
          RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
          'yes'
        );
        sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_EXIT, {
          flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
          step: tourStep.toString(),
        });
      }}
      onComplete={() => {
        sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_COMPLETED, {
          flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
        });
      }}
      onChange={nextStepIndex => {
        setTourStep(nextStepIndex);
      }}
      options={{
        scrollToElement: false,
        exitOnOverlayClick: false,
        hidePrev: true,
        nextLabel: commonI18n.next(),
        prevLabel: commonI18n.back(),
        doneLabel: commonI18n.done(),
        showBullets: false,
        showStepNumbers: true,
      }}
    />
  );
};

export default OnboardingTourSteps;
