import {Button as MuiButton} from '@mui/material';
import React from 'react';

import Video from '@cdo/apps/standaloneVideo/Video';

import {VideoStep as VideoStepContent} from '../../types';

import styles from './stepPlayer.module.scss';
import videoStyles from '@cdo/apps/standaloneVideo/video.module.scss';

interface VideoStepProps {
  step: VideoStepContent;
  continueLabel: string;
  onComplete: () => void;
}

const VideoStep: React.FunctionComponent<VideoStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  return (
    <div className={styles.videoHost}>
      <div className={styles.videoFrame}>
        <Video
          src={step.src}
          download={step.download}
          thumbnail={step.thumbnail}
        >
          <MuiButton
            variant="contained"
            color="primary"
            size="medium"
            className={videoStyles.buttonNext}
            onClick={onComplete}
            type="button"
          >
            {continueLabel}
          </MuiButton>
        </Video>
      </div>
    </div>
  );
};

export default VideoStep;
