import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import moduleStyles from './AudioPlayer.module.scss';

const SECONDS_PER_MINUTE = 60;

const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds)) {
    return '--:--';
  }
  const wholeSeconds = Math.floor(seconds);
  const minutes = Math.floor(wholeSeconds / SECONDS_PER_MINUTE);
  const remainingSeconds = wholeSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface AudioPlayerProps {
  src: string;
  fileName: string;
}

/**
 * Plays back an audio project file. Playback state is read off the audio
 * element's own events rather than tracked at the call site, so the button
 * still reads correctly if playback stops for reasons we did not initiate.
 */
export const AudioPlayer = ({src, fileName}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(NaN);

  // Switching to another audio file reuses this component instance, so clear
  // the previous file's playback state.
  useEffect(() => {
    audioRef.current?.pause();
    setCurrentTime(0);
    setDuration(NaN);
  }, [src]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      audio
        .play()
        .catch(error => console.error('Audio playback failed', error));
    } else {
      audio.pause();
    }
  }, []);

  return (
    <div className={moduleStyles.audioPlayer}>
      {/* Student-supplied audio has no caption track to offer. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={event => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
      />
      <MuiIconButton
        variant="contained"
        color="primary"
        size="large"
        onClick={togglePlayback}
        aria-label={isPlaying ? `Pause ${fileName}` : `Play ${fileName}`}
        type="button"
      >
        <FontAwesomeV6Icon
          iconStyle="solid"
          iconName={isPlaying ? 'pause' : 'play'}
        />
      </MuiIconButton>
      <div className={moduleStyles.details}>
        <MuiTypography variant="body3">{fileName}</MuiTypography>
        <MuiTypography variant="body4" className={moduleStyles.elapsedTime}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </MuiTypography>
      </div>
    </div>
  );
};
