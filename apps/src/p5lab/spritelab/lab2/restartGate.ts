// When a scene's "restart scene" block takes effect. A condition that holds
// from a scene's first frames (the player spawned touching a foe) would
// restart it again at once, run after run; so a restart asked for in a
// run's first frames is held until the run has been seen, then done once.
// A restart asked for after that is a real event of the run, and goes
// through at once: a player that lands on lava half a second into a run
// must not be ignored. One restart per run; the first asked wins.

// About half a second: long enough to see the scene run again.
export const RESTART_QUIET_FRAMES = 30;

export interface RestartGate {
  /** A restart asked for `frame` frames into the run: true to restart
      now; false when it is held for later, or one is already on its way. */
  request(frame: number): boolean;
  /** Whether a held restart falls due at `frame`; true once. */
  due(frame: number): boolean;
  /** A new run has begun. */
  reset(): void;
}

export function createRestartGate(
  quietFrames = RESTART_QUIET_FRAMES
): RestartGate {
  let asked = false;
  let held = false;
  return {
    request(frame) {
      if (asked) {
        return false;
      }
      asked = true;
      held = frame < quietFrames;
      return !held;
    },
    due(frame) {
      if (held && frame >= quietFrames) {
        held = false;
        return true;
      }
      return false;
    },
    reset() {
      asked = false;
      held = false;
    },
  };
}
