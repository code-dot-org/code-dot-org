// The game's audio cues for a student who cannot see the screen, behind one
// setting. Rebuilt per visit to the Play tab, over one context, since
// browsers limit how many a page may hold.

import {useEffect, useMemo, useState} from 'react';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {createHeightTone} from './heightTone';
import {createPlayerObserver, PlayerObserver} from './playerObserver';
import {createPlayerSounds} from './playerSounds';
import {createProximityAudio} from './proximityAudio';

const OBSTACLE_SOUNDS_KEY = 'spritelab2ProximitySound';

const ON_OFF = [
  {value: 'on', text: 'On'},
  {value: 'off', text: 'Off'},
];

interface AudioEngine {
  setPlayerObserver(observer: PlayerObserver | null): void;
}

function useStoredToggle(key: string, label: string, fallback: 'on' | 'off') {
  // tryGetLocalStorage returns null for a key that was never set.
  const [on, setOn] = useState(
    () => (tryGetLocalStorage(key, fallback) ?? fallback) === 'on'
  );
  const setting = useMemo(
    () => ({
      id: key,
      label,
      options: ON_OFF,
      selectedValue: on ? 'on' : 'off',
      onChange: (value: string) => {
        setOn(value === 'on');
        trySetLocalStorage(key, value);
      },
    }),
    [key, label, on]
  );
  return [on, setting] as const;
}

function audioContext(): AudioContext | null {
  const Context =
    window.AudioContext ||
    (window as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
  if (!Context) {
    return null;
  }
  try {
    return new Context();
  } catch {
    // Chrome refuses one often enough to warrant Sounds.js's own guard.
    return null;
  }
}

interface GameAudioOptions {
  hasPlatformer: boolean;
  /** On the Play tab, running, and on screen. */
  playing: boolean;
}

/** The settings-panel entries, or none where the level makes no sound. */
export default function useGameAudio(
  engineRef: React.RefObject<AudioEngine | null>,
  {hasPlatformer, playing}: GameAudioOptions
) {
  // Off by default: the cues are for a student who cannot see the screen,
  // and are noise to one who can.
  const [obstacleSounds, obstacleSoundsSetting] = useStoredToggle(
    OBSTACLE_SOUNDS_KEY,
    'Obstacle sounds',
    'off'
  );

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !hasPlatformer || !playing || !obstacleSounds) {
      return;
    }
    const context = audioContext();
    if (!context) {
      return;
    }
    const proximity = createProximityAudio(context);
    const height = createHeightTone(context);
    const sounds = createPlayerSounds(context);
    engine.setPlayerObserver(
      createPlayerObserver({
        onSound: sounds.play,
        onHeight: height.update,
        onProximity: proximity.update,
      })
    );
    return () => {
      engine.setPlayerObserver(null);
      proximity.stop();
      height.stop();
      sounds.stop();
      context.close().catch(() => undefined);
    };
  }, [engineRef, hasPlatformer, playing, obstacleSounds]);

  return hasPlatformer ? [obstacleSoundsSetting] : [];
}
