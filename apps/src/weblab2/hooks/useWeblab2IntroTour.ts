import {useMemo, useCallback, useState} from 'react';

import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import useLifecycleNotifier from '@cdo/apps/lab2/hooks/useLifecycleNotifier';
import {TriggerSource} from '@cdo/apps/lab2/productTours/constants';
import {
  ProductTour,
  ProductTourConfigurations,
  isTourEnabledOnLevel,
} from '@cdo/apps/lab2/productTours/productToursPerLab';
import {LifecycleEvent, sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';

import {Weblab2LevelProperties} from '../types';

const WEBLAB2_INTRO_TOUR_SEEN = 'weblab2IntroTourSeen';

const useWeblab2IntroTour = (levelProperties: Weblab2LevelProperties) => {
  const [isLevelLoading, setIsLevelLoading] = useState(false);
  useLifecycleNotifier(LifecycleEvent.LevelLoadStarted, () => {
    setIsLevelLoading(true);
  });
  useLifecycleNotifier(LifecycleEvent.LevelLoadCompleted, () => {
    setIsLevelLoading(false);
  });

  const isIntroTourEnabled = useMemo(() => {
    const isEnabledOnLevel = isTourEnabledOnLevel(
      ProductTour.Weblab2Intro,
      levelProperties
    );
    return isEnabledOnLevel && !isLevelLoading;
  }, [levelProperties, isLevelLoading]);

  const flowName =
    ProductTourConfigurations[ProductTour.Weblab2Intro].metricName;

  const onTourStart = useCallback(
    () =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {
        flowName,
        triggerSource: TriggerSource.Auto,
      }),
    [flowName]
  );

  const onTourComplete = useCallback(
    () =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {
        flowName,
        triggerSource: TriggerSource.Auto,
      }),
    [flowName]
  );

  const onTourCancel = useCallback(
    (stepIndex: number) =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
        flowName,
        step: stepIndex.toString(),
        triggerSource: TriggerSource.Auto,
      }),
    [flowName]
  );

  const {tour} = useLab2ProductTour({
    getSteps: ProductTourConfigurations[ProductTour.Weblab2Intro].getSteps,
    localStorageKey: WEBLAB2_INTRO_TOUR_SEEN,
    tourAvailable: isIntroTourEnabled,
    onStart: onTourStart,
    onComplete: onTourComplete,
    onCancel: onTourCancel,
  });

  useStartTourWhenAvailable(tour);
};

export default useWeblab2IntroTour;
