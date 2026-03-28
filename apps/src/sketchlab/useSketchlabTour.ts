import {offset} from '@floating-ui/dom';
import {useEffect, useMemo, useState} from 'react';

import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import {
  ProductTour,
  isTourEnabledOnLevel,
} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import {tryGetLocalStorage} from '@cdo/apps/utils';

import {SKETCHLAB_ONBOARDING_TOUR_SEEN} from './constants';
import {createSketchlabTourSteps} from './sketchlabTourSteps';

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

interface UseSketchlabTourParams {
  productTours: string[] | undefined;
}

const useSketchlabTour = ({productTours}: UseSketchlabTourParams) => {
  // Wait for the ReactFlow canvas to be fully rendered before starting the tour.
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  useEffect(() => {
    const tourSeen = tryGetLocalStorage(SKETCHLAB_ONBOARDING_TOUR_SEEN, 'no');
    if (tourSeen === 'yes') {
      return;
    }
    const checkCanvasReady = () => {
      const reactFlowElement = document.querySelector('.react-flow__viewport');
      if (reactFlowElement) {
        setIsCanvasReady(true);
        return true;
      }
      return false;
    };

    if (checkCanvasReady()) {
      return;
    }

    const maxAttempts = 50;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (checkCanvasReady() || attempts >= maxAttempts) {
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

  const {tour} = useLab2ProductTour({
    getSteps: createSketchlabTourSteps,
    localStorageKey: SKETCHLAB_ONBOARDING_TOUR_SEEN,
    tourAvailable:
      isCanvasReady &&
      isTourEnabledOnLevel(
        ProductTour.SketchlabIntro,
        'sketchlab',
        productTours
      ),
    onStart: onTourStart,
    onComplete: onTourComplete,
    onCancel: onTourCancel,
    additionalStepOptions: additionalStepOptions,
  });

  useStartTourWhenAvailable(tour);
};

export default useSketchlabTour;
