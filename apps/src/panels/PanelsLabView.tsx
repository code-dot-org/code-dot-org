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
import {LabProps} from '../lab2/types';
import {LifecycleEvent} from '../lab2/utils';
import analyticsReporter from '../metrics/AnalyticsReporter';
import MusicAnalyticsReporter from '../music/analytics/AnalyticsReporter';
import useWindowSize from '../util/hooks/useWindowSize';

import PanelsView from './PanelsView';
import {PanelsLevelProperties} from './types';

// Only use the soon-to-be-deprecated Amplitude analytics reporter for specific scripts.
// TODO: remove this special case after migration.
const AMPLITUDE_SCRIPT_NAMES = ['music-jam-2024', 'pilot-elem-music-lab'];
function shouldUseAmplitude() {
  return AMPLITUDE_SCRIPT_NAMES.some(name =>
    window.location.pathname.includes(name)
  );
}
const resetAnalyticsSession = () => {
  if (shouldUseAmplitude()) {
    setSessionId(Date.now());
  }
};

const sendAnalyticsEvent = async (event: string, data?: object) => {
  analyticsReporter.sendEvent(event, {
    ...data,
    levelPath: window.location.pathname,
  });

  if (shouldUseAmplitude()) {
    // We use the Music Analytics reporter so that analytics for the
    // HOC progression are reported to the same project, and to avoid
    // API key issues.
    try {
      await MusicAnalyticsReporter.initialize();
      track(event, data);
    } catch (error) {
      // Expected on local environments.
      console.warn(error);
    }
  }
};
const updateAnalyticsProperty = (key: string, value: string) => {
  if (shouldUseAmplitude()) {
    const identifyEvent = new Identify();
    identifyEvent.set(key, value);
    identify(identifyEvent);
  }
};

const PanelsLabView: React.FunctionComponent<
  LabProps<PanelsLevelProperties>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();

  const {panels, appName, skipUrl, offerBrowserTts} = levelProperties;
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
    [dispatch, appName]
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

  if (!panels) {
    return <div />;
  }

  return (
    <PanelsView
      panels={panels}
      onContinue={onContinue}
      onSkip={skipUrl ? onSkip : undefined}
      targetWidth={windowWidth}
      targetHeight={windowHeight}
      offerBrowserTts={offerBrowserTts || queryParams('show-tts') === 'true'}
      levelId={currentLevelId}
      onChangePanel={onChangePanel}
      onClickContinue={onClickContinue}
    />
  );
};

export default PanelsLabView;
