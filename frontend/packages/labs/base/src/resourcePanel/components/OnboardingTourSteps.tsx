import {Steps} from 'intro.js-react';
import type {FunctionComponent} from 'react';
import {useState} from 'react';

import {EVENTS} from '@code-dot-org/core/metrics';

import {useAppSelector} from '../../redux/store';
import {sendLabAnalyticsEvent} from '../../utils/analyticsReporterHelper';
import {tryGetLocalStorage, trySetLocalStorage} from '../../utils/localStorage';
import {RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN} from '../constants';
import {STEPS, INITIAL_STEP} from '../tourHelpers';

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
const OnboardingTourSteps: FunctionComponent = () => {
  const resourcePanelPinnedButtonOnboardingTourSeen = tryGetLocalStorage(
    RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    'no',
  );
  const [tourStep, setTourStep] = useState(0);

  const isStandaloneCollapsed = useAppSelector(
    state => state.labView.isStandaloneCollapsed,
  );

  return (
    <Steps
      enabled={
        resourcePanelPinnedButtonOnboardingTourSeen !== 'yes' &&
        !isStandaloneCollapsed
      }
      initialStep={INITIAL_STEP}
      steps={STEPS}
      onStart={() => {
        sendLabAnalyticsEvent(EVENTS.INTROJS_FLOW_STARTED, {
          flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
        });
      }}
      onExit={() => {
        trySetLocalStorage(
          RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
          'yes',
        );
        sendLabAnalyticsEvent(EVENTS.INTROJS_FLOW_EXIT, {
          flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
          step: tourStep.toString(),
        });
      }}
      onComplete={() => {
        sendLabAnalyticsEvent(EVENTS.INTROJS_FLOW_COMPLETED, {
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
        nextLabel: 'Next',
        prevLabel: 'Back',
        doneLabel: 'Done',
        showBullets: false,
        showStepNumbers: true,
      }}
    />
  );
};

export default OnboardingTourSteps;
