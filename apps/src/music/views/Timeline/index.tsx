import React, {memo, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {isPredictResponseSubmitted} from '@cdo/apps/lab2/redux/predictLevelRedux';
import {
  clearSelectedBlockId,
  getBlockMode,
  selectBlockId,
  setStartingPlayheadPosition,
} from '@cdo/apps/music/redux/musicRedux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import TimelineUI from './TimelineUI';

interface TimelineProps {
  allowChangeStartingPlayheadPosition?: boolean;
  isPredictLevel?: boolean;
}

/**
 * Renders the Music Lab timeline, connected to the redux store.
 * To use the UI-only, unconnected Timeline, see {@link TimelineUI}.
 */
const TimelineContainer: React.FC<TimelineProps> = ({
  allowChangeStartingPlayheadPosition,
  isPredictLevel,
}) => {
  const dispatch = useDispatch();
  const playbackEvents = useAppSelector(state => state.music.playbackEvents);
  const orderedFunctions = useAppSelector(
    state => state.music.orderedFunctions
  );
  const predictResponseSubmitted = useAppSelector(isPredictResponseSubmitted);
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const blockMode = useSelector(getBlockMode);
  const currentPlayheadPosition = useAppSelector(
    state => state.music.currentPlayheadPosition
  );
  const startingPlayheadPosition = useAppSelector(
    state => state.music.startingPlayheadPosition
  );
  const lastMeasure = useAppSelector(state => state.music.lastMeasure);
  const loopEnabled = useAppSelector(state => state.music.loopEnabled);
  const loopStart = useAppSelector(state => state.music.loopStart);
  const loopEnd = useAppSelector(state => state.music.loopEnd);
  const selectedBlockId = useAppSelector(state => state.music.selectedBlockId);
  const setStartingPlayheadPositionCallback = useCallback(
    (position: number) => {
      dispatch(setStartingPlayheadPosition(position));
    },
    [dispatch]
  );
  const clearSelectedBlockIdCallback = useCallback(() => {
    dispatch(clearSelectedBlockId());
  }, [dispatch]);
  const selectBlockIdCallback = useCallback(
    (blockId: string) => {
      dispatch(selectBlockId(blockId));
    },
    [dispatch]
  );

  return (
    <TimelineUI
      playbackEvents={playbackEvents}
      orderedFunctions={orderedFunctions}
      allowChangeStartingPlayheadPosition={allowChangeStartingPlayheadPosition}
      hideTimelineEvents={isPredictLevel && !predictResponseSubmitted}
      isPlaying={isPlaying}
      blockMode={blockMode}
      currentPlayheadPosition={currentPlayheadPosition}
      startingPlayheadPosition={startingPlayheadPosition}
      lastMeasure={lastMeasure}
      loopEnabled={loopEnabled}
      loopStart={loopStart}
      loopEnd={loopEnd}
      setStartingPlayheadPosition={setStartingPlayheadPositionCallback}
      clearSelectedBlockId={clearSelectedBlockIdCallback}
      selectBlockId={selectBlockIdCallback}
      selectedBlockId={selectedBlockId}
    />
  );
};

export default memo(TimelineContainer);
