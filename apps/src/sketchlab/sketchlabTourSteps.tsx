import {Steps} from 'intro.js-react';
import React, {useEffect, useState} from 'react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {SKETCHLAB_ONBOARDING_TOUR_SEEN} from './constants';
import {STEPS, INITIAL_STEP} from './sketchlabTourHelpers';

// Check if tour should be disabled (e.g., during UI tests) before any rendering.
// This runs when the module is first imported so localStorage is set early.
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('noIntrojs') === 'true') {
  trySetLocalStorage(SKETCHLAB_ONBOARDING_TOUR_SEEN, 'yes');
}
const SKETCHLAB_ONBOARDING_FLOW_NAME = 'Sketch Lab Onboarding';

const OnboardingTourSteps: React.FC = () => {
  const sketchlabOnboardingTourSeen = tryGetLocalStorage(
    SKETCHLAB_ONBOARDING_TOUR_SEEN,
    'no'
  );
  const [isToolbarReady, setIsToolbarReady] = useState(false);

  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    // Wait for Excalidraw toolbar to be fully rendered.
    const checkToolbarReady = () => {
      // Check if required elements for the tour's initial step exists.
      const toolbarElements = document.querySelectorAll('label.ToolIcon');
      if (toolbarElements.length > 0) {
        setIsToolbarReady(true);
        return true;
      }
      return false;
    };

    // Try immediately first.
    if (checkToolbarReady()) {
      return;
    }

    // If not ready, poll every 100ms for up to 5 seconds
    const maxAttempts = 50;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (checkToolbarReady() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <Steps
      enabled={isToolbarReady && sketchlabOnboardingTourSeen !== 'yes'}
      initialStep={INITIAL_STEP}
      steps={STEPS}
      onExit={() => {
        trySetLocalStorage(SKETCHLAB_ONBOARDING_TOUR_SEEN, 'yes');
        sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_EXIT, {
          flowName: SKETCHLAB_ONBOARDING_FLOW_NAME,
          step: tourStep.toString(),
        });
      }}
      onStart={() => {
        sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_STARTED, {
          flowName: SKETCHLAB_ONBOARDING_FLOW_NAME,
        });
      }}
      onChange={nextStepIndex => {
        setTourStep(nextStepIndex);
      }}
      onComplete={() => {
        sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_COMPLETED, {
          flowName: SKETCHLAB_ONBOARDING_FLOW_NAME,
        });
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
        disableInteraction: false, // Allow interaction with page elements.
      }}
    />
  );
};

export default OnboardingTourSteps;
