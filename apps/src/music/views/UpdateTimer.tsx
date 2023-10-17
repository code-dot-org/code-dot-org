import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import React, {useCallback, useContext, useEffect, useRef} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import MusicPlayer from '../player/MusicPlayer';
import {MusicState, setCurrentPlayheadPosition} from '../redux/musicRedux';

type UpdateTimerProps = Pick<MusicPlayer, 'getCurrentPlayheadPosition'> & {
  updateHighlightedBlocks: () => void;
};

const UPDATE_RATE = 1000 / 30; // 30 times per second

/**
 * Utility component that updates various parts of the Music Lab interface
 * (playhead position, highlighted blocks, progress state) at a specific
 * rate while playback is in progress.
 */
const UpdateTimer: React.FunctionComponent<UpdateTimerProps> = ({
  getCurrentPlayheadPosition,
  updateHighlightedBlocks,
}) => {
  const dispatch = useDispatch();
  const isPlaying = useSelector(
    (state: {music: MusicState}) => state.music.isPlaying
  );
  const progressManager = useContext(ProgressManagerContext);
  const intervalId = useRef<number | undefined>(undefined);

  const doUpdate = useCallback(() => {
    dispatch(setCurrentPlayheadPosition(getCurrentPlayheadPosition()));
    updateHighlightedBlocks();
    progressManager?.updateProgress();
  }, [
    dispatch,
    getCurrentPlayheadPosition,
    updateHighlightedBlocks,
    progressManager,
  ]);

  // Starts updates whenever playback is in progress, and stops updates
  // when playback stops.
  useEffect(() => {
    if (isPlaying) {
      if (intervalId.current !== undefined) {
        window.clearInterval(intervalId.current);
      }
      intervalId.current = window.setInterval(doUpdate, UPDATE_RATE);
    } else {
      window.clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
  }, [isPlaying, doUpdate]);

  // This component doesn't render anything.
  return null;
};

export default UpdateTimer;
