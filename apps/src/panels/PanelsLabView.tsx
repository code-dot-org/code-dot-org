// Panels
//
// This is a React client for a panels level.  Note that this is
// only used for levels that use Lab2.

import {
  Identify,
  identify,
  setSessionId,
  track,
} from '@amplitude/analytics-browser';
import React, {useCallback, useEffect, useRef} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {sendSuccessReport} from '../code-studio/progressRedux';
import {getCurrentLevel} from '../code-studio/progressReduxSelectors';
import {queryParams} from '../code-studio/utils';
import useLifecycleNotifier from '../lab2/hooks/useLifecycleNotifier';
import {LifecycleEvent} from '../lab2/utils';
import MusicAnalyticsReporter from '../music/analytics/AnalyticsReporter';
import useWindowSize from '../util/hooks/useWindowSize';

import PanelsView from './PanelsView';
import {PanelsLevelProperties} from './types';

const appName = 'panels';

// Temporary solution for sending analytics for Hour of Code 2024.
// TODO: Remove/consolidate reporters after HOC 2024.
const HOC_2024_SCRIPT_NAME = 'music-jam-2024';
const resetAnalyticsSession = () => {
  if (!window.location.pathname.includes(HOC_2024_SCRIPT_NAME)) {
    return;
  }

  setSessionId(Date.now());
};
const sendAnalyticsEvent = async (event: string, data?: object) => {
  // Checking the script name to keep this scoped to HOC 2024 only.
  if (!window.location.pathname.includes(HOC_2024_SCRIPT_NAME)) {
    return;
  }

  // We use the Music Analytics reporter so that analytics for the
  // HOC progression are reported to the same project, and to avoid
  // API key issues.
  await MusicAnalyticsReporter.initialize();
  track(event, data);
};
const updateAnalyticsProperty = (key: string, value: string) => {
  if (!window.location.pathname.includes(HOC_2024_SCRIPT_NAME)) {
    return;
  }

  const identifyEvent = new Identify();
  identifyEvent.set(key, value);
  identify(identifyEvent);
};

const PanelsLabView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const panels = useAppSelector(
    state =>
      (state.lab.levelProperties as PanelsLevelProperties | undefined)?.panels
  );
  const currentAppName = useAppSelector(
    state => state.lab.levelProperties?.appName
  );
  const skipUrl = useAppSelector(state => state.lab.levelProperties?.skipUrl);
  const offerBrowserTts =
    useAppSelector(state => state.lab.levelProperties?.offerBrowserTts) ||
    queryParams('show-tts') === 'true';
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  const dialogControl = useDialogControl();

  const onContinue = useCallback(
    (nextUrl?: string) => {
      if (nextUrl) {
        // This is a short-term solution for the Music Lab progression in incubation.
        // Send a success report so we turn the bubble green.
        dispatch(sendSuccessReport(appName));
        window.location.href = nextUrl;
      } else {
        dispatch(continueOrFinishLesson());
      }
    },
    [dispatch]
  );

  const onSkip = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.Skip,
        handleConfirm: () => {
          if (skipUrl) {
            window.location.href = skipUrl;
          }
        },
      });
    }
  }, [dialogControl, skipUrl]);

  const startTime = useRef<number | null>(null);
  useEffect(() => {
    resetAnalyticsSession();
    sendAnalyticsEvent('Panels Level Started');
    startTime.current = Date.now();
  }, [panels]);

  useLifecycleNotifier(LifecycleEvent.LevelChangeRequested, () => {
    if (startTime.current) {
      sendAnalyticsEvent('Panels Level Completed', {
        timeSpentSeconds: (Date.now() - startTime.current) / 1000,
      });
      startTime.current = null;
    }
  });

  const onChangePanel = (
    source: 'button' | 'bubble',
    currentPanel: number,
    nextPanel: number,
    timeSpentOnPanelSeconds: number
  ) => {
    sendAnalyticsEvent(
      source === 'button'
        ? 'Panels Next Button Clicked'
        : 'Panels Bubble Clicked',
      {
        currentPanel,
        nextPanel,
        timeSpentOnPanelSeconds,
      }
    );
  };

  const onClickContinue = (
    currentPanel: number,
    timeSpentOnPanelSeconds: number
  ) => {
    sendAnalyticsEvent('Panels Continue Button Clicked', {
      currentPanel,
      timeSpentOnPanelSeconds,
    });
  };

  const levelPath = useAppSelector(state => getCurrentLevel(state)?.path);
  useEffect(() => {
    updateAnalyticsProperty('levelPath', levelPath);
  }, [levelPath]);

  const [windowWidth, windowHeight] = useWindowSize();

  if (!panels || currentAppName !== appName) {
    return <div />;
  }

  return (
    <PanelsView
      panels={panels}
      onContinue={onContinue}
      onSkip={skipUrl ? onSkip : undefined}
      targetWidth={windowWidth}
      targetHeight={windowHeight}
      offerBrowserTts={offerBrowserTts}
      levelId={currentLevelId}
      onChangePanel={onChangePanel}
      onClickContinue={onClickContinue}
    />
  );
};

export default PanelsLabView;
