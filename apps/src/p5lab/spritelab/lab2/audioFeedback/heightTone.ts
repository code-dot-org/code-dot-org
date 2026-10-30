// The player's height as a pitch, heard while they are off the ground. This
// is the only voice whose pitch slides; proximityAudio's tones hold theirs.

import {endVoice, startVoice, wake} from './audioVoice';

const LOW_HZ = 220;
const HIGH_HZ = 880;
const VOLUME = 0.16;

const GLIDE_S = 0.02;
const ATTACK_S = 0.01;
// Fades slowly enough after landing that the landing pitch is heard.
const RELEASE_S = 0.08;

export interface PlayerHeight {
  /** 0 at the view floor, 1 at the top. */
  above: number;
  airborne: boolean;
}

/** Exponential, so a climb of one distance is one musical interval anywhere. */
export function heightPitch(above: number): number {
  const up = Math.min(Math.max(above, 0), 1);
  return LOW_HZ * Math.pow(HIGH_HZ / LOW_HZ, up);
}

export interface HeightTone {
  update(height: PlayerHeight): void;
  stop(): void;
}

export function createHeightTone(context: AudioContext): HeightTone {
  const voice = startVoice(context, 'triangle', heightPitch(0));
  let stopped = false;

  return {
    update({above, airborne}: PlayerHeight) {
      if (stopped) {
        return;
      }
      wake(context);
      const now = context.currentTime;
      // Tracked while grounded too, so a jump starts at the right pitch.
      voice.oscillator.frequency.setTargetAtTime(
        heightPitch(above),
        now,
        GLIDE_S
      );
      voice.gain.gain.setTargetAtTime(
        airborne ? VOLUME : 0,
        now,
        airborne ? ATTACK_S : RELEASE_S
      );
    },
    stop() {
      if (!stopped) {
        stopped = true;
        endVoice(voice);
      }
    },
  };
}
