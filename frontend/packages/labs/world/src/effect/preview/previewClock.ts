/**
 * The one clock every preview reads.
 *
 * `uTime` is the *engine* clock: in a game, every filter sees the same value.
 * If each preview measured time from its own mount, a node thumbnail opened
 * mid-animation would start over at zero and run out of phase with the output
 * preview beside it — which reads as the previews disagreeing about what the
 * effect does. One shared epoch keeps every canvas at the same instant, and
 * makes opening a preview an act of *observing* the animation, not restarting
 * it.
 */
const epoch = performance.now();

/** Seconds since the editor loaded — the shared `uTime` for all previews. */
export function previewTime(): number {
  return (performance.now() - epoch) / 1000;
}

/**
 * `uEffectTime` gets its own epoch: in a game it counts from the moment the
 * effect is applied, and restarting it is a real thing a game does. The
 * editor's analogue is the restart button above the Effect Time knob.
 */
let effectEpoch = epoch;

/** Seconds since the effect "started" — the shared `uEffectTime`. */
export function previewEffectTime(): number {
  return (performance.now() - effectEpoch) / 1000;
}

/** What applying the effect again would do: `uEffectTime` back to zero. */
export function restartEffectTime(): void {
  effectEpoch = performance.now();
}
