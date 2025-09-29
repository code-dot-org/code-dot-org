import {Steps} from 'intro.js-react';
import React, {useMemo, useState, useEffect} from 'react';

import {Tabs} from '@cdo/apps/lab2/types';
import {ValidationSettings} from '@cdo/apps/lab2/views/components/Instructions/InstructionsV2';
import {
  PYTHONLAB_VALIDATION_TOUR_SEEN,
  PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
} from '@cdo/apps/pythonlab/constants';
import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {VALIDATION_TOUR_STEPS} from './validationTourHelpers';

interface UseValidationTourProps {
  appName: string;
  hasValidationConditions: boolean;
  validationSettings: ValidationSettings | undefined;
  setCurrentTab: (tab: Tabs) => void;
  onValidate: (() => void) | undefined;
}

// Currently this hook is only used for Python Lab.
// If other labs would like to opt in to use this hook, we can update the hook to work for their labs.
export const useValidationTour = ({
  appName,
  hasValidationConditions,
  validationSettings,
  setCurrentTab,
  onValidate,
}: UseValidationTourProps) => {
  const isPythonLab = appName === 'pythonlab';
  const [validationTourEnabled, setValidationTourEnabled] = useState(false);
  const [validationTourStep, setValidationTourStep] = useState(0);
  const validationTabEnum = Tabs.Validation;
  const pythonlabValidationTourSeen = tryGetLocalStorage(
    PYTHONLAB_VALIDATION_TOUR_SEEN,
    'no'
  );
  const pythonlabOnboardingTourSeen = tryGetLocalStorage(
    PYTHONLAB_RESOURCE_PANEL_ONBOARDING_TOUR_SEEN,
    'no'
  );

  // The Done button on the third step (index 2) is always enabled.
  // The Next button on the first two steps (indexes 0 and 1) is disabled until the user completes an action.
  const [validationTourStepsEnabled, setValidationTourStepsEnabled] = useState([
    false,
    false,
    true,
  ]);

  // Enable validation tour if conditions are met.
  useEffect(() => {
    if (!isPythonLab) return;

    const shouldShowValidationTour =
      validationSettings &&
      hasValidationConditions &&
      pythonlabValidationTourSeen !== 'yes' &&
      pythonlabOnboardingTourSeen === 'yes'; // If user hasn't seen both tours, show onboarding tour first.

    if (shouldShowValidationTour) {
      setValidationTourEnabled(true);
    }
  }, [
    validationSettings,
    hasValidationConditions,
    pythonlabValidationTourSeen,
    pythonlabOnboardingTourSeen,
    isPythonLab,
  ]);

  // Add event listeners for validation tour progression
  useEffect(() => {
    if (!validationTourEnabled) return;

    const handleValidationTabActivation = () => {
      if (validationTourStep === 0) {
        setCurrentTab(validationTabEnum);
        // Enable step 1 (next button for step 1)
        setValidationTourStepsEnabled(prev => [true, false, true]);

        // Return focus to the tour panel for keyboard users
        setTimeout(() => {
          const nextButton = document.querySelector(
            '.introjs-nextbutton'
          ) as HTMLButtonElement;
          if (nextButton) {
            nextButton.focus();
          }
        }, 100);
      }
    };

    const handleValidateButtonActivation = () => {
      if (validationTourStep === 1) {
        // Enable step 2 (next button for step 2)
        setValidationTourStepsEnabled(prev => [true, true, true]);
        onValidate();

        // Return focus to the tour panel for keyboard users
        setTimeout(() => {
          const nextButton = document.querySelector(
            '.introjs-nextbutton'
          ) as HTMLButtonElement;
          if (nextButton) {
            nextButton.focus();
          }
        }, 100);
      }
    };

    const handleValidationTabKeydown = (event: KeyboardEvent) => {
      // Handle both Enter and Space key activation
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleValidationTabActivation();
      }
    };

    const handleValidateButtonKeydown = (event: KeyboardEvent) => {
      // Handle both Enter and Space key activation
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleValidateButtonActivation();
      }
    };

    const validationTabElement = document.getElementById(
      'resource-panel-tab-validation'
    );
    const validateButtonElement = document.getElementById(
      'resource-panel-validate-button'
    );

    if (validationTabElement) {
      validationTabElement.addEventListener(
        'click',
        handleValidationTabActivation
      );
      validationTabElement.addEventListener(
        'keydown',
        handleValidationTabKeydown
      );
    }
    if (validateButtonElement) {
      validateButtonElement.addEventListener(
        'click',
        handleValidateButtonActivation
      );
      validateButtonElement.addEventListener(
        'keydown',
        handleValidateButtonKeydown
      );
    }

    return () => {
      if (validationTabElement) {
        validationTabElement.removeEventListener(
          'click',
          handleValidationTabActivation
        );
        validationTabElement.removeEventListener(
          'keydown',
          handleValidationTabKeydown
        );
      }
      if (validateButtonElement) {
        validateButtonElement.removeEventListener(
          'click',
          handleValidateButtonActivation
        );
        validateButtonElement.removeEventListener(
          'keydown',
          handleValidateButtonKeydown
        );
      }
    };
  }, [
    validationTourEnabled,
    validationTourStep,
    validationTabEnum,
    setCurrentTab,
    onValidate,
  ]);

  // Update button disabled state based on step and requirements
  useEffect(() => {
    if (!validationTourEnabled) return;

    const updateButtonState = () => {
      const nextButton = document.querySelector(
        '.introjs-nextbutton'
      ) as HTMLButtonElement;
      if (nextButton) {
        if (validationTourStep === 0 && !validationTourStepsEnabled[0]) {
          nextButton.setAttribute('disabled', 'true');
        } else if (validationTourStep === 1 && !validationTourStepsEnabled[1]) {
          nextButton.setAttribute('disabled', 'true');
        } else {
          nextButton.removeAttribute('disabled');
        }
      }
    };

    // Update once after DOM is ready
    const timeoutId = setTimeout(updateButtonState, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [validationTourEnabled, validationTourStep, validationTourStepsEnabled]);

  const validationTourSteps = useMemo(
    () =>
      isPythonLab ? (
        <Steps
          enabled={validationTourEnabled}
          initialStep={validationTourStep}
          steps={VALIDATION_TOUR_STEPS}
          onExit={() => {
            setValidationTourEnabled(false);
          }}
          onComplete={() => {
            setValidationTourEnabled(false);
            // User must complete tour so that they don't see it again.
            trySetLocalStorage(PYTHONLAB_VALIDATION_TOUR_SEEN, 'yes');
          }}
          onChange={nextStepIndex => {
            setValidationTourStep(nextStepIndex);
          }}
          onBeforeChange={nextStepIndex => {
            // Control step progression based on user interactions.
            if (nextStepIndex === 1 && !validationTourStepsEnabled[0]) {
              return false; // Prevent going to second step (at index 1) until validation tab is clicked.
            }
            if (nextStepIndex === 2 && !validationTourStepsEnabled[1]) {
              return false; // Prevent going to third step (at index 2) until validate button is clicked.
            }
            // Return void (undefined) to allow progression.
          }}
          options={{
            scrollToElement: false,
            exitOnOverlayClick: false,
            hidePrev: validationTourStep === 0, // Hide back button only on first step
            hideNext: false,
            nextLabel: commonI18n.next(),
            prevLabel: commonI18n.back(),
            doneLabel: commonI18n.done(),
            showBullets: false,
            showStepNumbers: true,
            disableInteraction: false, // Allow interaction with page elements
          }}
        />
      ) : null,
    [
      validationTourEnabled,
      validationTourStep,
      validationTourStepsEnabled,
      isPythonLab,
    ]
  );

  return {
    validationTourSteps,
  };
};
