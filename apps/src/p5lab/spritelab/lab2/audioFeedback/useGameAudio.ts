// The game's audio cues for a student who cannot see the screen, behind one
// setting. One audio context lasts while the setting is on: made or woken in
// a user gesture, suspended while nothing plays, closed when the setting
// turns off or the view unmounts. Browsers limit how many a page may hold,
// and Safari lets a context resume without a gesture only once it has
// started inside one.

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {wake} from './audioVoice';
import {createHeightTone} from './heightTone';
import {createPlayerObserver, PlayerObserver} from './playerObserver';
import {createPlayerSounds} from './playerSounds';
import {createProximityAudio} from './proximityAudio';

const NAVIGATION_SOUNDS_KEY = 'spritelab2ProximitySound';

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
    // Chrome caps the contexts a page may hold; Sounds.js guards the same way.
    return null;
  }
}

interface GameAudioOptions {
  /** Some scene in the project is a platformer, so the setting is offered. */
  hasPlatformScene: boolean;
  /** On the Play tab, running, and on screen. */
  playing: boolean;
}

export interface GameAudio {
  /** The settings-panel entries, or none when no scene is a platformer. */
  settings: ReturnType<typeof useStoredToggle>[1][];
  /** Call from the click or key that opens Play: browsers let a context
      start only inside a user gesture, and the run's effect is outside it. */
  unlock: () => void;
}

export default function useGameAudio(
  engineRef: React.RefObject<AudioEngine | null>,
  {hasPlatformScene, playing}: GameAudioOptions
): GameAudio {
  // Off by default: the cues are for a student who cannot see the screen,
  // and are noise to one who can.
  const [navigationSounds, storedSetting] = useStoredToggle(
    NAVIGATION_SOUNDS_KEY,
    'Obstacle sounds',
    'off'
  );

  const contextRef = useRef<AudioContext | null>(null);
  const startContext = () => {
    contextRef.current ||= audioContext();
    if (contextRef.current) {
      wake(contextRef.current);
    }
  };
  const wanted = hasPlatformScene && navigationSounds;
  const wantedRef = useRef(wanted);
  wantedRef.current = wanted;
  const unlock = useCallback(() => {
    if (wantedRef.current) {
      startContext();
    }
  }, []);

  // Turning the setting on is a gesture too.
  const setting = useMemo(
    () => ({
      ...storedSetting,
      onChange: (value: string) => {
        storedSetting.onChange(value);
        if (value === 'on' && hasPlatformScene) {
          startContext();
        }
      },
    }),
    [storedSetting, hasPlatformScene]
  );

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !hasPlatformScene || !playing || !navigationSounds) {
      return;
    }
    const context = (contextRef.current ||= audioContext());
    if (!context) {
      return;
    }
    wake(context);
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
      context.suspend().catch(() => undefined);
    };
  }, [engineRef, hasPlatformScene, playing, navigationSounds]);

  // The context lives as long as the setting is on.
  useEffect(() => {
    if (!wanted) {
      return;
    }
    return () => {
      contextRef.current?.close().catch(() => undefined);
      contextRef.current = null;
    };
  }, [wanted]);

  return {settings: hasPlatformScene ? [setting] : [], unlock};
}
