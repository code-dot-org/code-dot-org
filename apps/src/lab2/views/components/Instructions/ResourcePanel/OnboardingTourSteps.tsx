import {Steps} from 'intro.js-react';
import React from 'react';

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

// Note that this introjs flow includes a step that highlights the navigation button which is always visible
// at the bottom of the resource panel (whether it's enabled or not).
// Some labs do not always show the navigation button so this tour is not appropriate for all labs.
const OnboardingTourSteps: React.FC = () => {
  const resourcePanelPinnedButtonOnboardingTourSeen = tryGetLocalStorage(
    RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    'no'
  );

  return (
    <Steps
      enabled={resourcePanelPinnedButtonOnboardingTourSeen !== 'yes'}
      initialStep={INITIAL_STEP}
      steps={STEPS}
      onExit={() => {
        trySetLocalStorage(
          RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
          'yes'
        );
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
