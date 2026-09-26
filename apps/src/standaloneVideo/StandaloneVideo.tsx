// StandaloneVideo
//
// This is a React client for a standalone_video level.  Note that this is
// only used for levels that use Lab2.  For levels that don't use Lab2,
// they will get an older-style level implemented with a HAML page and some
// non-React JS code.

import {Button as MuiButton} from '@mui/material';
import React from 'react';

import {
  sendSuccessReport,
  navigateToNextLevel,
} from '@cdo/apps/code-studio/progressRedux';
import {LabProps, VideoLevelData} from '@cdo/apps/lab2/types';
import localization, {useLocalization} from '@cdo/apps/localization';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import standaloneVideoLocale from './locale';
import Video from './Video';

import styles from './video.module.scss';

const StandaloneVideo: React.FunctionComponent<LabProps> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const levelVideo = levelProperties.levelData as VideoLevelData | undefined;

  useLocalization();

  const nextButtonPressed = () => {
    dispatch(sendSuccessReport(levelProperties.appName));
    dispatch(navigateToNextLevel());
  };

  const videoSrc = levelVideo?.src;
  const [videoBase, videoQuery] = (videoSrc || '').split('?');
  const localizedVideoSrc = videoSrc
    ? localization.translate(videoBase, ['video-url', 'youtube-url']) +
      (videoQuery ? `?${videoQuery}` : '')
    : videoSrc;

  const downloadSrc = levelVideo?.download;
  const localizedDownloadSrc = downloadSrc
    ? localization.translate(downloadSrc, ['video-url', 'fallback-video-url'])
    : downloadSrc;

  return (
    <div id="standalone-video">
      <Video
        src={localizedVideoSrc}
        download={localizedDownloadSrc}
        thumbnail={levelVideo?.thumbnail}
      >
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          className={styles.buttonNext}
          id="standalone-video-continue-button"
          onClick={() => nextButtonPressed()}
          type="button"
        >
          {standaloneVideoLocale.continue()}
        </MuiButton>
      </Video>
    </div>
  );
};

export default StandaloneVideo;
