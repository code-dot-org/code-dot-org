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

const OnboardingTourSteps: React.FC = () => {
  const sketchlabOnboardingTourSeen = tryGetLocalStorage(
    SKETCHLAB_ONBOARDING_TOUR_SEEN,
    'no'
  );
  const [isToolbarReady, setIsToolbarReady] = useState(false);
  const [isAiDiffOpen, setIsAiDiffOpen] = useState(false);

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

  useEffect(() => {
    // Check if AI Diff container is actually open and visible in the DOM
    const checkAiDiffState = () => {
      // First check if the FAB/container exists on the page (experiment is enabled)
      const fabContainer = document.getElementById('fab-contained');
      if (!fabContainer) {
        // AI Diff feature is not available on this page
        setIsAiDiffOpen(false);
        return;
      }

      // Check if the container is actually rendered and visible
      const draggableContainer = document.getElementById('draggable-id');
      if (draggableContainer) {
        const isVisible =
          draggableContainer.style.display !== 'none' &&
          window.getComputedStyle(draggableContainer).display !== 'none';
        setIsAiDiffOpen(isVisible);
      } else {
        setIsAiDiffOpen(false);
      }
    };

    // Check initial state
    checkAiDiffState();

    // Listen for storage changes (when AI Diff is opened/closed)
    const handleStorageChange = () => {
      checkAiDiffState();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also poll periodically since session storage changes in the same tab
    // don't trigger storage events, and to detect DOM changes
    const interval = setInterval(checkAiDiffState, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Steps
      enabled={
        isToolbarReady && sketchlabOnboardingTourSeen !== 'yes' && !isAiDiffOpen
      }
      initialStep={INITIAL_STEP}
      steps={STEPS}
      onExit={() => {
        trySetLocalStorage(SKETCHLAB_ONBOARDING_TOUR_SEEN, 'yes');
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
