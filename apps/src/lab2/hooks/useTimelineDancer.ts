import {useEffect, useState} from 'react';

import appConfig from '@cdo/apps/music/appConfig';
import {MusicLevelData} from '@cdo/apps/music/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {LevelProperties} from '../types';

type UseTimelineDancerArgs = {
  isPlaying: boolean;
  levelProperties: LevelProperties;
};

type UseTimelineDancerResult = {
  dancerMeasurePosition: number;
  danceMove?: string;
  dancerSize: number;
};

export default function useTimelineDancer({
  isPlaying,
  levelProperties,
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
    const el = document.getElementById('timeline-area');
    if (!el) return;

    const update = () => setDancerSize(el.getBoundingClientRect().height || 0);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return {dancerMeasurePosition, danceMove, dancerSize};
}
