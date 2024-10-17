// Panels
//
// This is a React client for a panels level.  Note that this is
// only used for levels that use Lab2.

import React, {useCallback} from 'react';

import continueOrFinishLesson from '@cdo/apps/lab2/progress/continueOrFinishLesson';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {sendSuccessReport} from '../code-studio/progressRedux';
import {queryParams} from '../code-studio/utils';
import useWindowSize from '../util/hooks/useWindowSize';

import PanelsView from './PanelsView';
import {PanelsLevelProperties} from './types';

const appName = 'panels';

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
  const offerTts =
    useAppSelector(state => state.lab.levelProperties?.offerBrowserTts) ||
    queryParams('show-tts') === 'true';

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
      offerTts={offerTts}
    />
  );
};

export default PanelsLabView;
