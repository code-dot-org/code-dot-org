import {useEffect, useState} from 'react';

import appConfig from '@cdo/apps/music/appConfig';
import {MusicLevelData} from '@cdo/apps/music/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LevelProperties} from '../types';

type UseTimelineDancerArgs = {
  isPlaying: boolean;
  levelProperties: LevelProperties;
  timelineAreaRef: React.RefObject<HTMLElement | null>;
};

type UseTimelineDancerResult = {
  dancerMeasurePosition: number;
  danceMove?: string;
  dancerSize: number;
};

export default function useTimelineDancer({
  isPlaying,
  levelProperties,
  timelineAreaRef,
}: UseTimelineDancerArgs): UseTimelineDancerResult {
  const currentPlayheadPosition = useAppSelector(
    state => state.music.currentPlayheadPosition
  );
  const startingPlayheadPosition = useAppSelector(
    state => state.music.startingPlayheadPosition
  );

  const dancerMeasurePosition = isPlaying
    ? currentPlayheadPosition
    : startingPlayheadPosition;

  const danceMove =
    appConfig.getValue('danceMove')?.toString() ||
    (levelProperties.levelData as MusicLevelData | undefined)?.danceMove;

  const [dancerSize, setDancerSize] = useState(0);

  useEffect(() => {
    const timelineArea = timelineAreaRef.current;
    if (!timelineArea) return;

    const updateDancerSize = () =>
      setDancerSize(timelineArea.getBoundingClientRect().height || 0);
    updateDancerSize();

    const resizeObserver = new ResizeObserver(updateDancerSize);
    resizeObserver.observe(timelineArea);

    return () => resizeObserver.disconnect();
  }, [timelineAreaRef]);

  return {dancerMeasurePosition, danceMove, dancerSize};
}
