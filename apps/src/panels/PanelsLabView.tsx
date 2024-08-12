// Panels
//
// This is a React client for a panels level.  Note that this is
// only used for levels that use Lab2.

import React, {useCallback} from 'react';

import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

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

  const dialogControl = useDialogControl();

  const onContinue = useCallback(
    (nextUrl?: string) => {
      if (nextUrl) {
        // This is a short-term solution for the Music Lab progression in incubation.  We will not attempt
        // to send a success report for a level that uses this feature.
        window.location.href = nextUrl;
      } else {
        dispatch(sendSuccessReport(appName));
        dispatch(navigateToNextLevel());
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
    />
  );
};

export default PanelsLabView;
