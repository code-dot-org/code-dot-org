// StandaloneVideo
//
// This is a React client for a standalone_video level.  Note that this is
// only used for levels that use Lab2.  For levels that don't use Lab2,
// they will get an older-style level implemented with a HAML page and some
// non-React JS code.

import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {LabProps, VideoLevelData} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import standaloneVideoLocale from './locale';
import Video from './Video';

import styles from './video.module.scss';

const StandaloneVideo: React.FunctionComponent<LabProps> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const levelVideo = levelProperties.levelData as VideoLevelData | undefined;

  const nextButtonPressed = () => {
    dispatch(sendSuccessReport(levelProperties.appName));
    dispatch(navigateToNextLevel());
  };

  return (
    <div id="standalone-video">
      <Video {...levelVideo}>
        <Button
          id="standalone-video-continue-button"
          onClick={() => nextButtonPressed()}
          className={styles.buttonNext}
          text={standaloneVideoLocale.continue()}
        />
      </Video>
    </div>
  );
};

export default StandaloneVideo;
