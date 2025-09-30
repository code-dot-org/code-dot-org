import {Steps} from 'intro.js-react';
import React, {useMemo} from 'react';

import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN} from './constants';
import {STEPS, INITIAL_STEP} from './resourcePanelTourHelpers';

interface UseOnboardingTourProps {
  isEnabled: boolean;
}

// Note that this tour includes a step that highlights the navigation button which is always visible
// at the bottom of the resource panel (whether it's enabled or not).
// Some labs do not always show the navigation button so this tour is not appropriate for all labs.
// Currently this hook is only used for Python Lab but other labs can opt in to use it if they also
// have a pinned navigation button.
export const useOnboardingTour = ({isEnabled}: UseOnboardingTourProps) => {
  const resourcePanelPinnedButtonOnboardingTourSeen = tryGetLocalStorage(
    RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    'no'
  );

  const onboardingTourSteps = useMemo(
    () =>
      isEnabled ? (
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
      ) : null,
    [isEnabled, resourcePanelPinnedButtonOnboardingTourSeen]
  );

  return {
    onboardingTourSteps,
  };
};
