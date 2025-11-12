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
  const [tourEnabled, setTourEnabled] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // The Next button on the Open Menu step (6th step) is disabled until the user completes an action.
  const [openMenuNextStepEnabled, setOpenMenuNextStepEnabled] = useState(false);

  useEffect(() => {
    if (sketchlabOnboardingTourSeen !== 'yes') {
      setTourEnabled(true);
    }
  }, [sketchlabOnboardingTourSeen]);

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

  // Add event listeners for tour progression - Open Menu step (6th step which is tourStep 5).
  useEffect(() => {
    if (!tourEnabled || tourStep !== 5) return;

    let hasDetectedDropdown = false;
    // Count initial dialogs to detect when a NEW one appears.
    const initialDialogCount =
      document.querySelectorAll('[role="dialog"]').length;

    const handleDropdownMenuOpen = () => {
      if (hasDetectedDropdown) return; // Prevent multiple calls.
      hasDetectedDropdown = true;
      // Enable 'Next' button on open menu step.
      setOpenMenuNextStepEnabled(true);
    };

    const checkForNewDialog = (
      initialDialogCount: number,
      hasDetectedDropdown: boolean
    ) => {
      // Check if a new dialog appeared after any click.
      setTimeout(() => {
        const currentDialogCount =
          document.querySelectorAll('[role="dialog"]').length;
        if (currentDialogCount > initialDialogCount && !hasDetectedDropdown) {
          handleDropdownMenuOpen();
        }
      }, 50);
    };

    const dropdownMenuButton = document.querySelector('.dropdown-menu-button');

    // Add a click listener to the entire document to detect any clicks during this step.
    const documentClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;
      // If user clicked on IntroJS overlay, forward the click to the button.
      if (
        target.classList.contains('introjs-helperLayer') ||
        target.classList.contains('introjs-tooltipReferenceLayer')
      ) {
        if (dropdownMenuButton) {
          (dropdownMenuButton as HTMLElement).click();
        }
      }
      // Check if a new dialog appeared after any click.
      checkForNewDialog(initialDialogCount, hasDetectedDropdown);
    };
    document.addEventListener('click', documentClickHandler, {capture: true});

    // Add a keyboard listener to support Enter key navigation.
    const documentKeydownHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;

      const target = event.target as HTMLElement;
      // If user pressed Enter on the dropdown menu button, trigger the button.
      if (target === dropdownMenuButton) {
        if (dropdownMenuButton) {
          (dropdownMenuButton as HTMLElement).click();
        }
      }
      // Check if a new dialog appeared after Enter key press.
      checkForNewDialog(initialDialogCount, hasDetectedDropdown);
    };
    document.addEventListener('keydown', documentKeydownHandler, {
      capture: true,
    });

    return () => {
      document.removeEventListener('click', documentClickHandler, {
        capture: true,
      });
      document.removeEventListener('keydown', documentKeydownHandler, {
        capture: true,
      });
    };
  }, [tourEnabled, tourStep]);

  // 7th step is informational only. When the user clicks on the Next button, this closes the dropdown menu.
  // Reopen the dropdown menu when the 7th step starts so user can see the information.
  useEffect(() => {
    if (!tourEnabled || tourStep !== 6) return;

    // Ensure dropdown menu is open when step 7 starts
    // (it might have closed when user clicked Next on step 6)
    const ensureDropdownIsOpen = () => {
      const dropdownMenu = document.querySelector('.dropdown-menu');
      if (!dropdownMenu) {
        const dropdownMenuButton = document.querySelector(
          '.dropdown-menu-button'
        );
        if (dropdownMenuButton) {
          (dropdownMenuButton as HTMLElement).click();
        }
      }
    };

    // Open dropdown immediately when step starts
    setTimeout(ensureDropdownIsOpen, 100);
  }, [tourEnabled, tourStep]);

  // Update button disabled state based on step and requirements.
  useEffect(() => {
    if (!tourEnabled) return;

    const updateButtonState = () => {
      const nextButton = document.querySelector(
        '.introjs-nextbutton'
      ) as HTMLButtonElement;
      if (nextButton) {
        if (tourStep === 5 && !openMenuNextStepEnabled) {
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
  }, [tourEnabled, tourStep, openMenuNextStepEnabled]);

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
      onBeforeChange={nextStepIndex => {
        // Control step progression based on user interactions.
        if (nextStepIndex === 6 && !openMenuNextStepEnabled) {
          return false; // Prevent going to step 7 (index 6) until dropdown menu is clicked.
        }

        // Reopen dropdown menu before going to step 7 (index 6) - informational only
        if (nextStepIndex === 6) {
          const dropdownMenu = document.querySelector('.dropdown-menu');
          if (!dropdownMenu) {
            const dropdownMenuButton = document.querySelector(
              '.dropdown-menu-button'
            );
            if (dropdownMenuButton) {
              (dropdownMenuButton as HTMLElement).click();
            }
          }
        }
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
