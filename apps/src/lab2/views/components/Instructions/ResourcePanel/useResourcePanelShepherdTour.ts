import {useEffect, useRef} from 'react';
import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';
import '@cdo/apps/lab2/shepherd.scss';

import {RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN} from './constants';
import {
  REQUIRED_RESOURCE_PANEL_SELECTORS,
  ResourcePanelShepherdStep,
  RESOURCE_PANEL_SHEPHERD_STEPS,
} from './resourcePanelShepherdTourHelpers';

const RESOURCE_PANEL_ONBOARDING_FLOW_NAME = 'Resource Panel Onboarding';
const ACTIVE_BODY_CLASS = 'lab2-shepherd-active';
const FOCUSABLE_SELECTOR =
  'a[href], a.shepherd-button, button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [role="button"], [tabindex]:not([tabindex="-1"])';

const isElementFocusableForTour = (element: HTMLElement) => {
  const isShepherdButton = element.classList.contains('shepherd-button');
  const isHidden =
    window.getComputedStyle(element).display === 'none' ||
    window.getComputedStyle(element).visibility === 'hidden';
  const isDisabled =
    element.hasAttribute('disabled') ||
    element.getAttribute('aria-disabled') === 'true';

  return (
    !isDisabled &&
    !isHidden &&
    (isShepherdButton || element.tabIndex !== -1) &&
    !element.classList.contains('shepherd-target') &&
    !element.classList.contains('shepherd-enabled')
  );
};

const getFocusableElements = (root: Element | null): HTMLElement[] => {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(isElementFocusableForTour);
};

const getShepherdControls = (stepElement: Element | null): HTMLElement[] => {
  if (!stepElement) {
    return [];
  }

  return Array.from(
    stepElement.querySelectorAll<HTMLElement>(
      '.shepherd-cancel-icon, .shepherd-footer .shepherd-button, .shepherd-footer .cdo-shepherd-button'
    )
  ).filter(isElementFocusableForTour);
};

interface UseResourcePanelShepherdTourOptions {
  enabled: boolean;
}

export const useResourcePanelShepherdTour = ({
  enabled,
}: UseResourcePanelShepherdTourOptions) => {
  const hasStartedTourRef = useRef(false);
  const currentStepRef = useRef(0);

  useEffect(() => {
    const seenOnboardingTour = tryGetLocalStorage(
      RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
      'no'
    );
    const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
    const searchParams = new URLSearchParams(window.location.search);
    const noIntrojs = searchParams.get('noIntrojs');

    if (noIntrojs === 'true') {
      trySetLocalStorage(
        RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
        'yes'
      );
      return;
    }

    if (
      isStartMode ||
      !enabled ||
      hasStartedTourRef.current ||
      seenOnboardingTour === 'yes'
    ) {
      return;
    }

    const hasTourTargets = REQUIRED_RESOURCE_PANEL_SELECTORS.every(selector =>
      Boolean(document.querySelector(selector))
    );
    if (!hasTourTargets) {
      return;
    }

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        scrollTo: false,
        classes: 'lab2-shepherd-step',
        cancelIcon: {
          enabled: true,
        },
      },
    });

    const addProgressLabel = () => {
      const currentStep = tour.getCurrentStep();
      if (!currentStep) {
        return;
      }

      const stepIndex = tour.steps.indexOf(currentStep) + 1;
      currentStepRef.current = Math.max(stepIndex - 1, 0);
      const totalSteps = tour.steps.length;
      const stepElement = currentStep.getElement();
      const footer = stepElement?.querySelector('.shepherd-footer');

      if (!footer) {
        return;
      }

      let progressElement = footer.querySelector<HTMLSpanElement>(
        '.lab2-shepherd-progress'
      );
      if (!progressElement) {
        progressElement = document.createElement('span');
        progressElement.className = 'lab2-shepherd-progress';
        const firstButton = footer.querySelector('.shepherd-button');
        if (firstButton) {
          footer.insertBefore(progressElement, firstButton);
        } else {
          footer.appendChild(progressElement);
        }
      }

      progressElement.textContent = `Step ${stepIndex} of ${totalSteps}`;
    };

    const handleTourTabLoop = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !tour.isActive()) {
        return;
      }

      const currentStep = tour.getCurrentStep();
      const stepElement = currentStep?.getElement();
      const currentStepDefinition = RESOURCE_PANEL_SHEPHERD_STEPS.find(
        step => step.id === currentStep?.id
      );
      const targetElement = currentStepDefinition
        ? document.querySelector(currentStepDefinition.selector)
        : null;
      const shepherdControls = getShepherdControls(stepElement || null);
      const focusableElements = [
        ...shepherdControls,
        ...getFocusableElements(targetElement),
      ];
      if (focusableElements.length === 0) {
        return;
      }

      const uniqueFocusableElements = focusableElements.filter(
        (element, index) => focusableElements.indexOf(element) === index
      );
      const activeElement = document.activeElement as HTMLElement | null;
      const activeIndex = activeElement
        ? uniqueFocusableElements.indexOf(activeElement)
        : -1;
      if (
        activeIndex === -1 &&
        activeElement &&
        targetElement?.contains(activeElement)
      ) {
        // If focus is already inside highlighted content but outside our explicit list,
        // let native tab order continue through that target region.
        return;
      }
      const nextIndex =
        activeIndex === -1
          ? 0
          : event.shiftKey
          ? (activeIndex - 1 + uniqueFocusableElements.length) %
            uniqueFocusableElements.length
          : (activeIndex + 1) % uniqueFocusableElements.length;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.setTimeout(() => {
        uniqueFocusableElements[nextIndex]?.focus();
      }, 0);
    };

    const markTourSeen = () => {
      trySetLocalStorage(
        RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
        'yes'
      );
    };

    tour.on('start', () => {
      document.body.classList.add(ACTIVE_BODY_CLASS);
      sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_STARTED, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
      });
    });
    tour.on('cancel', () => {
      document.body.classList.remove(ACTIVE_BODY_CLASS);
      markTourSeen();
      sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_EXIT, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
        step: currentStepRef.current.toString(),
      });
    });
    tour.on('complete', () => {
      document.body.classList.remove(ACTIVE_BODY_CLASS);
      markTourSeen();
      sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_COMPLETED, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
      });
    });

    RESOURCE_PANEL_SHEPHERD_STEPS.forEach(
      (step: ResourcePanelShepherdStep, index: number) => {
        const isFirstStep = index === 0;
        const isLastStep = index === RESOURCE_PANEL_SHEPHERD_STEPS.length - 1;

        const secondaryButton = isFirstStep
          ? {
              text: commonI18n.cancel(),
              classes: 'cdo-shepherd-button cdo-shepherd-button-secondary',
              action: () => tour.cancel(),
            }
          : {
              text: commonI18n.back(),
              classes: 'cdo-shepherd-button cdo-shepherd-button-secondary',
              action: () => tour.back(),
            };

        const primaryButton = isLastStep
          ? {
              text: commonI18n.done(),
              classes: 'cdo-shepherd-button cdo-shepherd-button-primary',
              action: () => tour.complete(),
            }
          : {
              text: commonI18n.next(),
              classes: 'cdo-shepherd-button cdo-shepherd-button-primary',
              action: () => tour.next(),
            };

        tour.addStep({
          id: step.id,
          title: step.title,
          text: step.text,
          attachTo: {
            element: step.fallbackToCenter
              ? () =>
                  document.querySelector<HTMLElement>(step.selector) ||
                  undefined
              : step.selector,
            on: step.placement,
          },
          buttons: [secondaryButton, primaryButton],
          when: {
            show: addProgressLabel,
          },
        });
      }
    );

    hasStartedTourRef.current = true;
    document.addEventListener('keydown', handleTourTabLoop, true);
    tour.start();

    return () => {
      document.removeEventListener('keydown', handleTourTabLoop, true);
      document.body.classList.remove(ACTIVE_BODY_CLASS);
      if (tour.isActive()) {
        tour.cancel();
      }
    };
  }, [enabled]);
};
