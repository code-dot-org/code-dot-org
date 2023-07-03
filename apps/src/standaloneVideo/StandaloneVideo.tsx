// StandaloneVideo
//
// This is a React client for a standalone_video level.  Note that this is
// only used for levels that use the LabContainer.  For levels that don't use
// the LabContainer, they will use an older-style level implemented with a
// HAML page and some non-React JS code.

import React from 'react';
import {useSelector} from 'react-redux';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import Video from './Video';
import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {LabState} from '@cdo/apps/labs/labRedux';
import {LevelDataVideo} from '@cdo/apps/labs/types';
import standaloneVideoLocale from './locale';
import styles from './video.module.scss';

const StandaloneVideo: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();
  const levelVideo : LevelDataVideo = useSelector(
    (state: {lab: LabState}) => state.lab.levelData
  ) as LevelDataVideo;

  const nextButtonPressed = () => {
    const appType = 'standalone_video';
    dispatch(sendSuccessReport(appType));
    dispatch(navigateToNextLevel());
  };

  return (
    <div id="standalone-video">
      <Video src={levelVideo?.src}>
        <button
          id="standalone-video-continue-button"
          type="button"
          onClick={() => nextButtonPressed()}
          className={styles.buttonNext}
        >
          {standaloneVideoLocale.continue()}
        </button>
      </Video>
    </div>
  );
};

export default StandaloneVideo;
