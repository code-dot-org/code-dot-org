// The game's audio: two settings, and the voices they switch on. Rebuilt
// per visit to the Play tab, over one context — browsers limit how many.

import {useEffect, useMemo, useState} from 'react';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {createHeightTone} from './heightTone';
import {createPlayerObserver, PlayerObserver} from './playerObserver';
import {createPlayerSounds} from './playerSounds';
import {createProximityAudio} from './proximityAudio';

const PROXIMITY_SOUND_KEY = 'spritelab2ProximitySound';
const SOUND_EFFECTS_KEY = 'spritelab2SoundEffects';

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
  // Noise to anyone who can see the hazard coming, so off by default.
  const [proximitySound, proximitySetting] = useStoredToggle(
    PROXIMITY_SOUND_KEY,
    'Obstacle sounds',
    'off'
  );
  // Short, and what a platformer should sound like, so on by default.
  const [soundEffects, soundEffectsSetting] = useStoredToggle(
    SOUND_EFFECTS_KEY,
    'Sound effects',
    'on'
  );

  useEffect(() => {
    const engine = engineRef.current;
    const wanted = proximitySound || soundEffects;
    if (!engine || !hasPlatformer || !playing || !wanted) {
      return;
    }
    const context = audioContext();
    if (!context) {
      return;
    }
    const proximity = proximitySound ? createProximityAudio(context) : null;
    const height = soundEffects ? createHeightTone(context) : null;
    const sounds = createPlayerSounds(context);
    engine.setPlayerObserver(
      createPlayerObserver({
        // Hitting something is an obstacle; footsteps are ordinary sound.
        onSound: event => {
          if (event === 'blocked' ? proximitySound : soundEffects) {
            sounds.play(event);
          }
        },
        // Absent when nothing listens, so the observer skips the work.
        onHeight: height?.update,
        onProximity: proximity?.update,
      })
    );
    return () => {
      engine.setPlayerObserver(null);
      proximity?.stop();
      height?.stop();
      sounds.stop();
      context.close().catch(() => undefined);
    };
  }, [engineRef, hasPlatformer, playing, proximitySound, soundEffects]);

  return hasPlatformer ? [soundEffectsSetting, proximitySetting] : [];
}
