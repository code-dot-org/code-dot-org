import {useCallback, useEffect, useRef} from 'react';

import {useLevelActivityMetrics} from '@cdo/apps/lab2/hooks/useLevelActivityMetrics';
import {LevelProperties} from '@cdo/apps/lab2/types';

import {KEYBOARD_GAME_KEYS} from './playBar';

/**
 * Sends the level activity event the first time the student acts on a
 * level. A game key pressed while the game plays counts. For any other
 * action, call the returned function.
 *
 * The returned function is the same on every render and every level, so an
 * effect that depends on it does not run again when the level changes.
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
      if (KEYBOARD_GAME_KEYS.has(event.key)) {
        logLevelActivityRef.current();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playing]);

  return useCallback(() => logLevelActivityRef.current(), []);
}
