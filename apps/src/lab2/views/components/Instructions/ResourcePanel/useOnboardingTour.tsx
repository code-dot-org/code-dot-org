import {Steps} from 'intro.js-react';
import React, {useMemo} from 'react';

import {PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN} from '@cdo/apps/pythonlab/constants';
import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {STEPS, INITIAL_STEP} from './resourcePanelTourHelpers';

interface UseOnboardingTourProps {
  isPythonLab: boolean;
}

// Currently this hook is only used for Python Lab.
// If other labs would like to opt in to use this hook, we can update the hook to specify the lab.
export const useOnboardingTour = ({isPythonLab}: UseOnboardingTourProps) => {
  const pythonlabResourcePanelOnboardingTourSeen = tryGetLocalStorage(
    PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
    'no'
  );

  const pythonlabOnboardingTourSteps = useMemo(
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
    pythonlabOnboardingTourSteps,
  };
};
