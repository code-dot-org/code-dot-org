// The game's audio: two settings, and the voices they switch on. Built on
// each visit to the Play tab and torn down on the way out, over a single
// context, because browsers limit how many a page may open.

import {useEffect, useMemo, useState} from 'react';

import {tryGetLocalStorage, trySetLocalStorage} from '@cdo/apps/utils';

import {createHeightTone, PlayerHeight} from './heightTone';
import {createPlayerSounds, PlayerSoundEvent} from './playerSounds';
import {createProximityAudio, ProximityDistances} from './proximityAudio';

const PROXIMITY_SOUND_KEY = 'spritelab2ProximitySound';
const SOUND_EFFECTS_KEY = 'spritelab2SoundEffects';

const ON_OFF = [
  {value: 'on', text: 'On'},
  {value: 'off', text: 'Off'},
];

interface AudioEngine {
  onPlayerSound: ((event: PlayerSoundEvent) => void) | null;
  onPlayerFrame: ((frame: ProximityDistances & PlayerHeight) => void) | null;
}

/** A remembered on/off entry for the settings panel. */
function useStoredToggle(key: string, label: string, fallback: 'on' | 'off') {
  // tryGetLocalStorage returns null for a key that was never set; its
  // fallback only covers localStorage throwing.
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
  return Context ? new Context() : null;
}

/** Returns the two entries for the settings panel. */
export default function useGameAudio(
  engineRef: React.RefObject<AudioEngine | null>,
  playing: boolean
) {
  // Off by default: noise to anyone who can see the hazard coming.
  const [proximitySound, proximitySetting] = useStoredToggle(
    PROXIMITY_SOUND_KEY,
    'Obstacle sounds',
    'off'
  );
  // On by default: short, and what a platformer should sound like.
  const [soundEffects, soundEffectsSetting] = useStoredToggle(
    SOUND_EFFECTS_KEY,
    'Sound effects',
    'on'
  );

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !playing || (!proximitySound && !soundEffects)) {
      return;
    }
    const context = audioContext();
    if (!context) {
      return;
    }
    const proximity = proximitySound ? createProximityAudio(context) : null;
    const height = soundEffects ? createHeightTone(context) : null;
    const sounds = createPlayerSounds(context);
    // Hitting something is an obstacle; footsteps are ordinary sound.
    engine.onPlayerSound = event => {
      if (event === 'blocked' ? proximitySound : soundEffects) {
        sounds.play(event);
      }
    };
    engine.onPlayerFrame = frame => {
      proximity?.update(frame);
      height?.update(frame);
    };
    return () => {
      engine.onPlayerSound = null;
      engine.onPlayerFrame = null;
      proximity?.stop();
      height?.stop();
      sounds.stop();
      context.close().catch(() => undefined);
    };
  }, [engineRef, playing, proximitySound, soundEffects]);

  return [soundEffectsSetting, proximitySetting];
}
