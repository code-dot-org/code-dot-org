import {useEffect, useRef} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const UPDATE_RATE = 1000 / 30; // 30 times per second

/**
 * A hook for performing updates during playback.
 * @param doUpdate function to run every UPDATE_RATE milliseconds while playback is in progress.
 * @param onPlay optional function to run when playback starts.
 * @param onStop optional function to run when playback stops.
 */
export default function usePlaybackUpdate(
  doUpdate: () => void,
  onPlay?: () => void,
  onStop?: () => void
) {
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const intervalId = useRef<number | undefined>();

  useEffect(() => {
    if (isPlaying) {
      onPlay?.();
      if (intervalId.current !== undefined) {
        window.clearInterval(intervalId.current);
      }
      intervalId.current = window.setInterval(doUpdate, UPDATE_RATE);
    } else {
      onStop?.();
      window.clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
  }, [isPlaying, doUpdate, onPlay, onStop]);
}
