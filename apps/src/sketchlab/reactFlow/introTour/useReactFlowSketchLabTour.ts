import {offset} from '@floating-ui/dom';
import {useEffect, useMemo, useState} from 'react';

import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import {TriggerSource} from '@cdo/apps/lab2/productTours/constants';
import {
  ProductTour,
  ProductTourConfigurations,
  isTourEnabledOnLevel,
} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {createReactFlowSketchLabTourSteps} from '@cdo/apps/lab2/productTours/reactFlowSketchLabTourSteps';
import {LevelProperties} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import {SKETCHLAB_REACTFLOW_ONBOARDING_TOUR_SEEN} from '@cdo/apps/sketchlab/constants';
import {tryGetLocalStorage} from '@cdo/apps/utils';

const flowName =
  ProductTourConfigurations[ProductTour.SketchlabIntroReactFlow].metricName;

const onTourStart = () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {
    flowName,
    triggerSource: TriggerSource.Auto,
  });

const onTourComplete = () =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {
    flowName,
    triggerSource: TriggerSource.Auto,
  });

const onTourCancel = (stepIndex: number) =>
  sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
    flowName,
    step: stepIndex.toString(),
    triggerSource: TriggerSource.Auto,
  });

interface UseReactFlowSketchLabTourParams {
  levelProperties: LevelProperties;
  enabled?: boolean;
}

const useReactFlowSketchLabTour = ({
  levelProperties,
  enabled = true,
}: UseReactFlowSketchLabTourParams) => {
  // Wait for the toolbar to render before starting; steps attach to its buttons.
  const [isToolbarReady, setIsToolbarReady] = useState(false);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const tourSeen = tryGetLocalStorage(
      SKETCHLAB_REACTFLOW_ONBOARDING_TOUR_SEEN,
      'no'
    );
    if (tourSeen === 'yes') {
      return;
    }
    const checkToolbarReady = () => {
      if (document.querySelector('button[aria-label="Add rectangle"]')) {
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
  }, [enabled]);

  const additionalStepOptions = useMemo(
    () => ({
      floatingUIOptions: {
        middleware: [offset(12)],
      },
    }),
    []
  );

  const {tour} = useLab2ProductTour({
    getSteps: createReactFlowSketchLabTourSteps,
    localStorageKey: SKETCHLAB_REACTFLOW_ONBOARDING_TOUR_SEEN,
    tourAvailable:
      enabled &&
      isToolbarReady &&
      isTourEnabledOnLevel(
        ProductTour.SketchlabIntroReactFlow,
        levelProperties
      ),
    onStart: onTourStart,
    onComplete: onTourComplete,
    onCancel: onTourCancel,
    additionalStepOptions: additionalStepOptions,
  });

  useStartTourWhenAvailable(tour);
};

export default useReactFlowSketchLabTour;
