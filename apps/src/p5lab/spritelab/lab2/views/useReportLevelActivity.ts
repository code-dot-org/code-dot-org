import {useCallback, useEffect, useRef} from 'react';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import {LevelProperties} from '@cdo/apps/lab2/types';

import {GAME_KEYS} from './playBar';

/**
 * Sends the level activity event at the student's first action on a level:
 * a game key pressed while the game plays, or a call of the function
 * returned. The function keeps one identity across renders and levels.
 */
export default function useReportLevelActivity(
  levelProperties: LevelProperties,
  playing: boolean
): () => void {
  const logLevelActivity = useLevelActivityMetrics(levelProperties);
  const logLevelActivityRef = useRef(logLevelActivity);
  logLevelActivityRef.current = logLevelActivity;

  // p5 listens for keys on window, so a game key seen here reached the game.
  // The on-screen arrows send their keys to window too.
  useEffect(() => {
    if (!playing) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (GAME_KEYS.has(event.key)) {
        logLevelActivityRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playing]);

  return useCallback(() => logLevelActivityRef.current(), []);
}
