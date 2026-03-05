import React, {useEffect, useRef} from 'react';
import Shepherd, {type Tour} from 'shepherd.js';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import '@cdo/apps/lab2/shepherd.scss';

import {RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN} from './constants';
import {createResourcePanelTourSteps} from './resourcePanelTourHelpers';

// Check if tour should be disabled (e.g., during UI tests) before any rendering.
// This runs when the module is first imported so localStorage is set early.
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('noIntrojs') === 'true') {
  trySetLocalStorage(RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN, 'yes');
}
const RESOURCE_PANEL_ONBOARDING_FLOW_NAME = 'Resource Panel Onboarding';

// Note that this shepherd flow includes a step that highlights the navigation button which is always visible
// at the bottom of the resource panel (whether it's enabled or not).
// Some labs do not always show the navigation button so this tour is not appropriate for all labs.
const OnboardingTourSteps: React.FC = () => {
  const tourRef = useRef<Tour | null>(null);

  const tourSeen = tryGetLocalStorage(
    RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
    'no'
  );
  const isStandaloneCollapsed = useAppSelector(
    state => state.lab2View.isStandaloneCollapsed
  );
  const shouldShowTour = tourSeen !== 'yes' && !isStandaloneCollapsed;

  useEffect(() => {
    if (!shouldShowTour) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      exitOnEsc: false,
      keyboardNavigation: false,
      defaultStepOptions: {
        cancelIcon: {enabled: false},
        scrollTo: false,
      },
    });

    tour.addSteps(createResourcePanelTourSteps(tour));

    tour.on('start', () => {
      sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_STARTED, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
      });
    });

    tour.on('complete', () => {
      trySetLocalStorage(
        RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
        'yes'
      );
      sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_COMPLETED, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
      });
      sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_EXIT, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
        step: String(tour.steps.length - 1),
      });
    });

    tour.on('cancel', () => {
      const currentIndex = tour.currentStep
        ? tour.steps.indexOf(tour.currentStep)
        : 0;
      trySetLocalStorage(
        RESOURCE_PANEL_PINNED_BUTTON_ONBOARDING_TOUR_SEEN,
        'yes'
      );
      sendLab2AnalyticsEvent(EVENTS.INTROJS_FLOW_EXIT, {
        flowName: RESOURCE_PANEL_ONBOARDING_FLOW_NAME,
        step: String(currentIndex),
      });
    });

    tourRef.current = tour;
    tour.start();

    return () => {
      if (tourRef.current?.isActive()) {
        tourRef.current.cancel();
      }
      tourRef.current = null;
    };
  }, [shouldShowTour]);

  return null;
};

export default OnboardingTourSteps;
