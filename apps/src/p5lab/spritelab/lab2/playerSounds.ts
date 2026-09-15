// Short blips for what the player does on the ground. Jumping isn't here:
// that is the height tone sliding (heightTone.ts).

import {startVoice, wake} from './audioVoice';

export type PlayerSoundEvent = 'step' | 'blocked';

interface Sweep {
  from: number;
  to: number;
  seconds: number;
  type: OscillatorType;
  volume: number;
}

// Both stay above ~200Hz: laptop speakers can't really play below that.
const SWEEPS: Record<PlayerSoundEvent, Sweep> = {
  // The quieter of the two: it plays several times a second.
  step: {from: 300, to: 200, seconds: 0.07, type: 'triangle', volume: 0.18},
  // Sawtooth because it should sound wrong, and it is the game's only
  // buzz. Louder than a footstep, or a bump reads as another step.
  blocked: {from: 320, to: 140, seconds: 0.12, type: 'sawtooth', volume: 0.22},
};

// The other foot, a little lower. Alternating sounds like walking.
const OTHER_FOOT = 0.84;

// Long enough that the blip doesn't start with a click.
const ATTACK_S = 0.01;

// Exponential ramps can't reach zero.
const SILENCE = 0.0001;

export interface PlayerSounds {
  play(event: PlayerSoundEvent): void;
  stop(): void;
}

export function createPlayerSounds(context: AudioContext): PlayerSounds {
  let stopped = false;
  let otherFoot = false;

  return {
    play(event: PlayerSoundEvent) {
      if (stopped) {
        return;
      }
      wake(context);
      const {from, to, seconds, type, volume} = SWEEPS[event];
      if (event === 'step') {
        otherFoot = !otherFoot;
      }
      const pitch = event === 'step' && otherFoot ? OTHER_FOOT : 1;
      const now = context.currentTime;
      const {oscillator, gain} = startVoice(context, type, from * pitch);
      oscillator.frequency.exponentialRampToValueAtTime(
        to * pitch,
        now + seconds
      );
      gain.gain.linearRampToValueAtTime(volume, now + ATTACK_S);
      gain.gain.exponentialRampToValueAtTime(SILENCE, now + seconds);
      // Each blip owns its nodes, so overlapping ones just stack up.
      oscillator.stop(now + seconds);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    },
    stop() {
      stopped = true;
    },
  };
}
