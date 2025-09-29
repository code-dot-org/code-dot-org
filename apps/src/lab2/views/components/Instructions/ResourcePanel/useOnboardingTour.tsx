import {Steps} from 'intro.js-react';
import React, {useMemo} from 'react';

import {PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN} from '@cdo/apps/pythonlab/constants';
import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {STEPS, INITIAL_STEP} from './resourcePanelTourHelpers';

interface UseOnboardingTourProps {
  appName: string;
}

// Currently this hook is only used for Python Lab.
// If other labs would like to opt in to use this hook, we can update the hook work with other labs.
export const useOnboardingTour = ({appName}: UseOnboardingTourProps) => {
  const isPythonLab = appName === 'pythonlab';
  const pythonlabResourcePanelOnboardingTourSeen = tryGetLocalStorage(
    PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
    'no'
  );

  const onboardingTourSteps = useMemo(
    () =>
      isPythonLab ? (
        <Steps
          enabled={
            isPythonLab && pythonlabResourcePanelOnboardingTourSeen !== 'yes'
          }
          initialStep={INITIAL_STEP}
          steps={STEPS}
          onExit={() => {
            trySetLocalStorage(
              PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
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
    [isPythonLab, pythonlabResourcePanelOnboardingTourSeen]
  );

  return {
    onboardingTourSteps,
  };
};
