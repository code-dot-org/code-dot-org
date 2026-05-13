// Watches the run/playback state in Redux and fires `onRun` on the rising
// edge of either:
// - `state.lab2System.isRunning` (general lab2 "Run" button), or
// - `state.music.isPlaying` (Music Lab's play button).
//
// This lets the AI Tutor evaluate the student's work the moment they hit
// Run, without requiring them to click "Check my work" manually.

import {useEffect, useRef} from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';

export function useAutoCheckOnRun(onRun: () => void, enabled: boolean = true) {
  const isRunning = useAppSelector(state => !!state.lab2System?.isRunning);
  // `state.music` may not be registered if the Music chunk hasn't been loaded
  // yet — guard with the unknown narrowing dance.
  const isPlayingMusic = useAppSelector(state => {
    const s = state as unknown as {music?: {isPlaying?: boolean}};
    return !!s.music?.isPlaying;
  });
  const prevSignal = useRef(false);
  const signal = isRunning || isPlayingMusic;

  useEffect(() => {
    if (!enabled) {
      prevSignal.current = signal;
      return;
    }
    if (signal && !prevSignal.current) {
      onRun();
    }
    prevSignal.current = signal;
  }, [signal, enabled, onRun]);
}
