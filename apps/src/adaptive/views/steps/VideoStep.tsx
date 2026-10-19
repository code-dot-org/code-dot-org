import {Button as MuiButton} from '@mui/material';
import React, {useRef} from 'react';

import Video from '@cdo/apps/standaloneVideo/Video';

import {VideoStep as VideoStepContent} from '../../types';

import styles from './stepPlayer.module.scss';

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
  const host = useRef<HTMLDivElement>(null);
  return (
    <div ref={host} className={styles.videoHost}>
      <Video
        src={step.src}
        download={step.download}
        thumbnail={step.thumbnail}
        containerRef={host}
      >
        <MuiButton variant="contained" onClick={onComplete}>
          {continueLabel}
        </MuiButton>
      </Video>
    </div>
  );
};

export default VideoStep;
