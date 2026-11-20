import {useCallback, useMemo} from 'react';
import {type StepOptions} from 'shepherd.js';

import useLab2ProductTour from '@cdo/apps/lab2/hooks/useLab2ProductTour';
import {TriggerSource} from '@cdo/apps/lab2/productTours/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {isLabLoading} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils/analyticsReporterHelper';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import useStartTourWhenAvailable from '@cdo/apps/sharedComponents/productTour/useStartTourWhenAvailable';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {tryGetLocalStorage} from '@cdo/apps/utils';

import {LevelProperties} from '../../types';

import {createAuthoredTourSteps} from './authoredTourSteps';
import {getReferencedTours} from './authoredWalkthroughTours';
import {AuthoredTour} from './types';

const authoredTourSeenKey = (tour: AuthoredTour) =>
  `authoredTourSeen_${tour.id}`;

const NO_TOUR_KEY = 'authoredTourSeen_none';
const noSteps = (): StepOptions[] => [];

// Starts the first tour the level references with autoStart that this browser
// has not shown before. Seen is tracked per tour, so a tour seen on one level
// does not start again on another.
const useAuthoredTours = (levelProperties: LevelProperties | undefined) => {
  const isLoading = useAppSelector(isLabLoading);
  const isEditingLevel =
    !!getAppOptionsEditBlocks() || !!getAppOptionsEditingExemplar();

  const tourToStart = useMemo(
    () =>
      getReferencedTours(levelProperties).find(
        ({tour, reference}) =>
          reference.autoStart &&
          tryGetLocalStorage(authoredTourSeenKey(tour), 'no') !== 'yes'
      )?.tour,
    [levelProperties]
  );

  const getSteps = useMemo(
    () =>
      tourToStart
        ? createAuthoredTourSteps(tourToStart, levelProperties?.appName)
        : noSteps,
    [tourToStart, levelProperties?.appName]
  );

  const flowName = tourToStart?.name ?? '';
  const onStart = useCallback(
    () =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_STARTED, {
        flowName,
        triggerSource: TriggerSource.Auto,
      }),
    [flowName]
  );
  const onComplete = useCallback(
    () =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_COMPLETED, {
        flowName,
        triggerSource: TriggerSource.Auto,
      }),
    [flowName]
  );
  const onCancel = useCallback(
    (stepIndex: number) =>
      sendLab2AnalyticsEvent(EVENTS.INTRO_FLOW_EXIT, {
        flowName,
        step: stepIndex.toString(),
        triggerSource: TriggerSource.Auto,
      }),
    [flowName]
  );

  const {tour} = useLab2ProductTour({
    getSteps,
    localStorageKey: tourToStart
      ? authoredTourSeenKey(tourToStart)
      : NO_TOUR_KEY,
    tourAvailable: !!tourToStart && !isLoading && !isEditingLevel,
    onStart,
    onComplete,
    onCancel,
  });

  useStartTourWhenAvailable(tour);
};

export default useAuthoredTours;
