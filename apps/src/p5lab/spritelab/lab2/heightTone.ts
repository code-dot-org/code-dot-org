// The player's height as a pitch, played while they are off the ground. It
// is the only voice that slides, so a moving note always means height, and
// the note you land on tells you how far you fell.

import {endVoice, startVoice, wake} from './audioVoice';

const LOW_HZ = 220;
const HIGH_HZ = 880;
const VOLUME = 0.16;

// How quickly the pitch chases the player.
const GLIDE_S = 0.02;
const ATTACK_S = 0.01;
// Outlasts the landing, so the note you land on can be heard.
const RELEASE_S = 0.08;

export interface PlayerHeight {
  /** 0 at the view floor, 1 at the top. */
  above: number;
  airborne: boolean;
}

/** Curved, so the same climb sounds like the same step anywhere. */
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
      // Followed on the ground too, so a jump opens on the right note.
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
