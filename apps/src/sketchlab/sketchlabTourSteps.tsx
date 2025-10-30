import {Steps} from 'intro.js-react';
import React, {useEffect, useState} from 'react';

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

// Note that this introjs flow includes a step that highlights the navigation button which is always visible
// at the bottom of the resource panel (whether it's enabled or not).
// Some labs do not always show the navigation button so this tour is not appropriate for all labs.
const OnboardingTourSteps: React.FC = () => {
  const sketchlabOnboardingTourSeen = tryGetLocalStorage(
    SKETCHLAB_ONBOARDING_TOUR_SEEN,
    'no'
  );
  const [isToolbarReady, setIsToolbarReady] = useState(false);
  const [tourEnabled, setTourEnabled] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // The Next button on step 6 (index 5) is disabled until the user completes an action.
  // Step 7 (index 6) is informational only - no forced interaction.
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

  // Add event listeners for tour progression - Step 6: Dropdown menu button
  useEffect(() => {
    if (!tourEnabled || tourStep !== 5) return;

    let hasDetectedDropdown = false;
    // Count initial dialogs to detect when a NEW one appears
    const initialDialogCount =
      document.querySelectorAll('[role="dialog"]').length;

    const handleDropdownMenuOpen = () => {
      if (hasDetectedDropdown) return; // Prevent multiple calls
      hasDetectedDropdown = true;
      // Enable 'Next' button on open menu step.
      setOpenMenuNextStepEnabled(true);
      // Return focus to the tour panel for keyboard users.
      returnFocusToTourPanel();
    };

    const dropdownMenuButton = document.querySelector('.dropdown-menu-button');

    // Add a click listener to the entire document to detect any clicks during this step
    const documentClickHandler = (event: Event) => {
      const target = event.target as HTMLElement;

      // If user clicked on IntroJS overlay/helper layer, forward the click to the button
      if (
        target.classList.contains('introjs-helperLayer') ||
        target.classList.contains('introjs-tooltipReferenceLayer')
      ) {
        if (dropdownMenuButton) {
          (dropdownMenuButton as HTMLElement).click();
        }
      }

      // Check if a new dialog appeared after any click
      setTimeout(() => {
        const currentDialogCount =
          document.querySelectorAll('[role="dialog"]').length;
        if (currentDialogCount > initialDialogCount && !hasDetectedDropdown) {
          handleDropdownMenuOpen();
        }
      }, 50);
    };
    document.addEventListener('click', documentClickHandler, {capture: true});

    // Add a keyboard listener to support Enter key navigation.
    const documentKeydownHandler = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return;

      const target = event.target as HTMLElement;

      // If user pressed Enter on the dropdown menu button or IntroJS overlay, trigger the button.
      if (
        target === dropdownMenuButton ||
        target.classList.contains('introjs-helperLayer') ||
        target.classList.contains('introjs-tooltipReferenceLayer')
      ) {
        if (dropdownMenuButton) {
          (dropdownMenuButton as HTMLElement).click();
        }
      }

      // Check if a new dialog appeared after Enter key press
      setTimeout(() => {
        const currentDialogCount =
          document.querySelectorAll('[role="dialog"]').length;
        if (currentDialogCount > initialDialogCount && !hasDetectedDropdown) {
          handleDropdownMenuOpen();
        }
      }, 50);
    };
    document.addEventListener('keydown', documentKeydownHandler, {
      capture: true,
    });

    // MutationObserver to detect when a new dialog appears (dropdown opens)
    const checkForDropdownMenu = () => {
      const currentDialogCount =
        document.querySelectorAll('[role="dialog"]').length;
      if (currentDialogCount > initialDialogCount && !hasDetectedDropdown) {
        handleDropdownMenuOpen();
      }
    };

    const observer = new MutationObserver(checkForDropdownMenu);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      document.removeEventListener('click', documentClickHandler, {
        capture: true,
      });
      document.removeEventListener('keydown', documentKeydownHandler, {
        capture: true,
      });
    };
  }, [tourEnabled, tourStep]);

  // Step 7 is informational only - just ensure dropdown stays open
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
