// Panels
//
// This is a React client for a panels level.  Note that this is
// only used for levels that use Lab2.

import React, {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {PanelsLevelData} from './types';
import PanelsView from './PanelsView';
import useWindowSize from '../util/hooks/useWindowSize';

const appName = 'panels';

const PanelsLabView: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const levelData = useAppSelector(
    state => state.lab.levelProperties?.levelData
  );
  const currentAppName = useAppSelector(
    state => state.lab.levelProperties?.appName
  );

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

  const panels = (levelData as PanelsLevelData | undefined)?.panels;

  const [windowWidth, windowHeight] = useWindowSize();

  if (!panels || currentAppName !== appName) {
    return <div />;
  }

  return (
    <PanelsView
      panels={panels}
      onContinue={onContinue}
      targetWidth={windowWidth}
      targetHeight={windowHeight}
    />
  );
};

export default PanelsLabView;
