import {Steps} from 'intro.js-react';
import React, {useState, useEffect} from 'react';

import {ValidationSettings} from '@cdo/apps/lab2/views/components/Instructions/InstructionsV2';
import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {
  VALIDATION_TOUR_SEEN,
  RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
  resourcePanelTabValidationElementId,
  resourcePanelValidateButtonElementId,
} from './constants';
import {Tabs} from './types';
import {VALIDATION_TOUR_STEPS} from './validationTourHelpers';

interface ValidationTourStepsProps {
  hasValidationConditions: boolean;
  validationSettings: ValidationSettings | undefined;
  setCurrentTab: (tab: Tabs) => void;
  onValidate: (() => void) | undefined;
}

// This introjs flow is currently only used for Python Lab, but other labs can opt in to use it if they also
// have a validation system similar to Python Lab.
const ValidationTourSteps: React.FC<ValidationTourStepsProps> = ({
  hasValidationConditions,
  validationSettings,
  setCurrentTab,
  onValidate,
}) => {
  const [validationTourEnabled, setValidationTourEnabled] = useState(false);
  const [validationTourStep, setValidationTourStep] = useState(0);
  const validationTabEnum = Tabs.Validation;
  const validationTourSeen = tryGetLocalStorage(VALIDATION_TOUR_SEEN, 'no');
  const onboardingTourSeen = tryGetLocalStorage(
    RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    'no'
  );

  const returnFocusToTourPanel = () => {
    setTimeout(() => {
      const nextButton = document.querySelector(
        '.introjs-nextbutton'
      ) as HTMLButtonElement;
      if (nextButton) {
        nextButton.focus();
      }
    }, 100);
  };

  // The Done button on the third step (index 2) is always enabled.
  // The Next button on the first two steps (indexes 0 and 1) is disabled until the user completes an action.
  const [validationTourStepsEnabled, setValidationTourStepsEnabled] = useState([
    false,
    false,
    true,
  ]);

  useEffect(() => {
    const shouldShowValidationTour =
      validationSettings &&
      hasValidationConditions &&
      validationTourSeen !== 'yes' &&
      onboardingTourSeen === 'yes'; // If user hasn't seen both tours, show onboarding tour first.
    if (shouldShowValidationTour) {
      setValidationTourEnabled(true);
    }
  }, [
    validationSettings,
    hasValidationConditions,
    validationTourSeen,
    onboardingTourSeen,
  ]);

  // Add event listeners for validation tour progression.
  useEffect(() => {
    if (!validationTourEnabled) return;

    const handleValidationTabActivation = () => {
      if (validationTourStep === 0) {
        setCurrentTab(validationTabEnum);
        // Enable 'Next' button on first step (index 0).
        setValidationTourStepsEnabled(prev => [true, false, true]);

        // Return focus to the tour panel for keyboard users.
        returnFocusToTourPanel();
      }
    };

    const handleValidateButtonActivation = () => {
      if (validationTourStep === 1) {
        // Enable 'Next' button on second step (index 1).
        setValidationTourStepsEnabled(prev => [true, true, true]);
        // Return focus to the tour panel for keyboard users.
        returnFocusToTourPanel();
      }
    };

    const handleValidationTabKeydown = (event: KeyboardEvent) => {
      // Handle both Enter and Space key activation.
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleValidationTabActivation();
      }
    };

    const handleValidateButtonKeydown = (event: KeyboardEvent) => {
      // Handle both Enter and Space key activation.
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (onValidate) {
          onValidate();
        }
        handleValidateButtonActivation();
      }
    };

    const validationTabElement = document.getElementById(
      resourcePanelTabValidationElementId
    );
    const validateButtonElement = document.getElementById(
      resourcePanelValidateButtonElementId
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

  // Update button disabled state based on step and requirements.
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

    // Update once after DOM is ready.
    const timeoutId = setTimeout(updateButtonState, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [validationTourEnabled, validationTourStep, validationTourStepsEnabled]);

  return (
    <Steps
      enabled={validationTourEnabled}
      initialStep={validationTourStep}
      steps={VALIDATION_TOUR_STEPS}
      onExit={() => {
        setValidationTourEnabled(false);
        trySetLocalStorage(VALIDATION_TOUR_SEEN, 'yes');
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
        hidePrev: validationTourStep === 0, // Hide back button only on first step.
        hideNext: false,
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

export default ValidationTourSteps;
