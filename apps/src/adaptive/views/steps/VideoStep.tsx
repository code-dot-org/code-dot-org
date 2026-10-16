import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import testYouTubeAvailable from '@cdo/apps/standaloneVideo/testYouTubeAvailable';
import VideoJS from '@cdo/apps/standaloneVideo/VideoJS';
import useElementSize from '@cdo/apps/util/hooks/useElementSize';

import {VideoStep as VideoStepContent} from '../../types';

import styles from './stepPlayer.module.scss';

const VIDEO_ASPECT_RATIO = 16 / 9;
// Match the margins PanelsView uses so the video is the same size as a panel image.
const HORIZONTAL_MARGIN = 40;
const VERTICAL_MARGIN = 50;
const BUTTON_AREA_HEIGHT = 70;

interface VideoStepProps {
  step: VideoStepContent;
  continueLabel: string;
  onComplete: () => void;
}

/** Renders a video step sized to its host, with a continue button below. */
const VideoStep: React.FunctionComponent<VideoStepProps> = ({
  step,
  continueLabel,
  onComplete,
}) => {
  const host = useRef<HTMLDivElement>(null);
  const [width, height] = useElementSize(host);

  const effectiveWidth = width - HORIZONTAL_MARGIN * 2;
  const effectiveHeight = height - VERTICAL_MARGIN * 2 - BUTTON_AREA_HEIGHT;
  let videoWidth: number, videoHeight: number;
  if (effectiveWidth / effectiveHeight > VIDEO_ASPECT_RATIO) {
    videoHeight = effectiveHeight;
    videoWidth = VIDEO_ASPECT_RATIO * videoHeight;
  } else {
    videoWidth = effectiveWidth;
    videoHeight = videoWidth / VIDEO_ASPECT_RATIO;
  }

  const [videoChoice, setVideoChoice] = useState<
    'youtube' | 'fallback' | undefined
  >(undefined);

  useEffect(() => {
    if (!step.src) {
      setVideoChoice('fallback');
      return;
    }
    const noCookie = step.src.includes('youtube-nocookie.com');
    testYouTubeAvailable(noCookie, available =>
      setVideoChoice(available ? 'youtube' : 'fallback')
    );
  }, [step.src]);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{src: step.download ?? '', type: 'video/mp4'}],
    poster: step.thumbnail,
  };

  return (
    <div ref={host} className={styles.videoHost}>
      {width > 0 && (
        <>
          <div style={{width: videoWidth, height: videoHeight}}>
            {videoChoice === 'youtube' && step.src && (
              <iframe
                width="100%"
                height="100%"
                style={{border: 'none'}}
                src={step.src}
                title="Video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
            {videoChoice === 'fallback' && step.download && (
              <VideoJS options={videoJsOptions} />
            )}
          </div>
          <div className={styles.videoContinue} style={{width: videoWidth}}>
            <MuiButton variant="contained" onClick={onComplete}>
              {continueLabel}
            </MuiButton>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoStep;
