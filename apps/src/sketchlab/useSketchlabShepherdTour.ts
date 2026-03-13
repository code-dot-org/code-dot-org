import {offset} from '@floating-ui/dom';
import {useEffect, useMemo, useState} from 'react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useProductTour from '@cdo/apps/sharedComponents/productTour/useProductTour';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import {tryGetLocalStorage} from '@cdo/apps/utils';

import {createSketchlabTourSteps} from './sketchlabShepherdTourSteps';

const SKETCHLAB_SHEPHERD_TOUR_LOCAL_STORAGE_KEY =
  'sketchlabOnboardingTourV2Seen';
const SKETCHLAB_ONBOARDING_FLOW_NAME = 'Sketch Lab Onboarding V2';

const onTourStart = () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {
    flowName: SKETCHLAB_ONBOARDING_FLOW_NAME,
  });

const onTourComplete = () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {
    flowName: SKETCHLAB_ONBOARDING_FLOW_NAME,
  });

const onTourCancel = (stepIndex: number) =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
    flowName: SKETCHLAB_ONBOARDING_FLOW_NAME,
    step: stepIndex.toString(),
  });

const useSketchlabShepherdTour = () => {
  // Wait for the Excalidraw toolbar to be fully rendered before starting the tour.
  const [isToolbarReady, setIsToolbarReady] = useState(false);
  useEffect(() => {
    const tourSeen = tryGetLocalStorage(
      SKETCHLAB_SHEPHERD_TOUR_LOCAL_STORAGE_KEY,
      'no'
    );
    if (tourSeen === 'yes') {
      return;
    }
    const checkToolbarReady = () => {
      const toolbarElements = document.querySelectorAll('label.ToolIcon');
      if (toolbarElements.length > 0) {
        setIsToolbarReady(true);
        return true;
      }
      return false;
    };

    if (checkToolbarReady()) {
      return;
    }

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

  const additionalStepOptions = useMemo(
    () => ({
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    }),
    []
  );

  const {tour} = useProductTour({
    getSteps: createSketchlabTourSteps,
    localStorageKey: SKETCHLAB_SHEPHERD_TOUR_LOCAL_STORAGE_KEY,
    tourAvailable: isToolbarReady,
    onStart: onTourStart,
    onComplete: onTourComplete,
    onCancel: onTourCancel,
    additionalStepOptions: additionalStepOptions,
  });

  useStartTourWhenAvailable(tour);
};

export default useSketchlabShepherdTour;
