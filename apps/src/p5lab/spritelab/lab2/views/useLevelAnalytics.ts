import {useEffect, useRef} from 'react';

import {
  LevelSessionMetrics,
  useLevelSessionMetrics,
} from '@cdo/apps/lab2/hooks/useLevelSessionMetrics';
import {LevelProperties} from '@cdo/apps/lab2/types';

import {ARROW_AND_SPACE_KEYS, isOnScreenGameKey} from './playBar';

const noPresses = () => ({
  keyboardPressesWhilePlaying: 0,
  buttonPressesWhilePlaying: 0,
});

/**
 * The shared level session analytics, plus how the game was played: a game
 * key pressed while the game runs counts as activity, and the session-end
 * event says how many came from the keyboard and how many from the
 * on-screen buttons.
 */
export default function useLevelAnalytics(
  levelProperties: LevelProperties,
  playing: boolean,
  enabled: boolean
): LevelSessionMetrics {
  const presses = useRef(noPresses());
  const metrics = useLevelSessionMetrics(levelProperties, {
    enabled,
    getSessionDetails: () => presses.current,
  });
  const {reportActivity} = metrics;

  // After the shared hook's cleanup has sent the previous level's counts.
  useEffect(() => {
    presses.current = noPresses();
  }, [levelProperties.id]);

  // p5 listens for keys on window, so a game key seen here reached the game.
  useEffect(() => {
    if (!playing) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (!ARROW_AND_SPACE_KEYS.has(event.key) || event.repeat) {
        return;
      }
      if (isOnScreenGameKey(event)) {
        presses.current.buttonPressesWhilePlaying++;
      } else {
        presses.current.keyboardPressesWhilePlaying++;
      }
      reportActivity();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [playing, reportActivity]);

  return metrics;
}
