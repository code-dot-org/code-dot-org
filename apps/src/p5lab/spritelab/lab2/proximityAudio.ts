// A steady tone per hazard, growing louder as the player nears it. The
// blips (playerSounds.ts) say what has happened; these say what is about
// to. Both hold their pitch, because a sliding note means height.

import {endVoice, startVoice, Voice, wake} from './audioVoice';

// How far off a hazard starts to be heard, in pixels: about two tiles.
export const PROXIMITY_RANGE = 100;

// A fifth apart, which stays clearest when both sound at once.
const WALL_HZ = 200;
const EDGE_HZ = 300;

const WALL_VOLUME = 0.13;
const EDGE_VOLUME = 0.13;

// How fast the volume moves. Slow enough not to click, in seconds.
const GLIDE_S = 0.04;

/** Gaps to the hazards ahead, in canvas px; Infinity for "nothing there". */
export interface ProximityDistances {
  wall: number;
  edge: number;
}

export interface ProximityAudio {
  update(distances: ProximityDistances): void;
  stop(): void;
}

/**
 * Loudness for a hazard `distance` px away, 0 (too far) to 1 (touching).
 * Squared, so open ground stays quiet and the last step is the loud one.
 */
export function proximityLevel(
  distance: number,
  range: number = PROXIMITY_RANGE
): number {
  // Negated, so Infinity and NaN land here too.
  if (!(distance < range)) {
    return 0;
  }
  const near = 1 - Math.max(0, distance) / range;
  return near * near;
}

export function createProximityAudio(context: AudioContext): ProximityAudio {
  const wall = startVoice(context, 'sine', WALL_HZ);
  const edge = startVoice(context, 'sine', EDGE_HZ);
  let stopped = false;

  const set = (voice: Voice, level: number, ceiling: number) =>
    voice.gain.gain.setTargetAtTime(
      level * ceiling,
      context.currentTime,
      GLIDE_S
    );

  return {
    update(distances: ProximityDistances) {
      if (stopped) {
        return;
      }
      wake(context);
      set(wall, proximityLevel(distances.wall), WALL_VOLUME);
      // A drop behind a wall can't be walked off: the wall stops you.
      set(
        edge,
        distances.edge < distances.wall ? proximityLevel(distances.edge) : 0,
        EDGE_VOLUME
      );
    },
    stop() {
      if (!stopped) {
        stopped = true;
        [wall, edge].forEach(endVoice);
      }
    },
  };
}
