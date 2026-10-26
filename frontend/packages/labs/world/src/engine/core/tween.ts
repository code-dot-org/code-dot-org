// A property moved from one value to another over time.
//
// Nine of the stock rule sources already do this arithmetic by hand — Grid
// lerps to a deadline, Camera Ease compounds a fraction, Drag and Steering and
// Drive and Gravity each integrate their own — and `cameraEase` carries the
// clearest statement of why the obvious form is wrong:
//
//   Moving `smoothness` of the way each frame … eases twice as fast at 120fps
//   as at 60, and lags on a slow frame.
//
// That reasoning is written down once and re-derived everywhere. This is where
// it should live, and where a `fade in` a learner writes gets it for free.
//
// A TWEEN OUTLIVES THE HANDLER THAT STARTS IT. `fade to 0 over half a second`
// returns immediately and keeps working for thirty frames, which is the whole
// reason this is a runtime and not a block that loops. Nothing here suspends —
// the engine has no way to — so a tween is state that a step advances.

import type {Actor} from './Actor';
import type {Property} from './types';
import {Vector} from './Vector';

/** How a tween's progress maps to its output: 0 → 0 and 1 → 1 either way. */
export type Curve = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

/** The value kinds a tween can move between. Nothing else is a path. */
export type Tweenable = number | Vector;

/**
 * One tween in flight on one actor.
 *
 * `from` is captured when it STARTS, not when it is defined: `fade out` means
 * "from wherever you are now", and a definition that fixed the start would
 * snap before it moved.
 */
/** One property a tween moves, and the two ends it moves between. */
export interface TweenStep {
  readonly property: Property<Tweenable>;
  /**
   * Captured when the tween STARTS, not when it is defined: "fade out" means
   * from however visible you are now, and a definition that fixed the start
   * would snap before it moved.
   */
  readonly from: Tweenable;
  readonly to: Tweenable;
}

/**
 * One tween in flight on one actor.
 *
 * SEVERAL PROPERTIES, one clock. Moving and fading together is the ordinary
 * case — a character entering a scene does both — and a tween per property
 * would raise a `finishes` for each, so a handler waiting for "the entrance is
 * over" would fire twice and be right neither time.
 *
 * One duration and one curve for all of them. Phaser allows a timing per
 * property; two different timings here is two tweens, which reads better than
 * a block with a duration on every row.
 */
export interface TweenRun {
  /** Names the definition, for the finished event and for replacing itself. */
  readonly id: string;
  readonly steps: readonly TweenStep[];
  /** Seconds. Zero is legal and lands on every `to` immediately. */
  readonly duration: number;
  readonly curve: Curve;
  /** Seconds so far. */
  elapsed: number;
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/**
 * The curves, as pure functions of progress.
 *
 * Deliberately few. Each is a shape a learner can name from watching it —
 * "starts slow", "ends slow", "both" — and a longer list is a dropdown nobody
 * can choose from. Cubic rather than quadratic because the difference is
 * visible and the cost is not.
 */
const CURVES: Record<Curve, (t: number) => number> = {
  linear: t => t,
  'ease-in': t => t * t * t,
  'ease-out': t => 1 - (1 - t) ** 3,
  'ease-in-out': t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
};

/** Whether two values can be moved between — the same kind, and a kind with a path. */
export const isTweenable = (value: unknown): value is Tweenable =>
  typeof value === 'number' || value instanceof Vector;

/** Where a tween sits between its ends, at progress `t`. */
export const tweenValue = (
  from: Tweenable,
  to: Tweenable,
  t: number,
): Tweenable => {
  if (typeof from === 'number' && typeof to === 'number') {
    return from + (to - from) * t;
  }
  const start = from as Vector;
  const end = to as Vector;
  return new Vector(
    start.x + (end.x - start.x) * t,
    start.y + (end.y - start.y) * t,
  );
};

/**
 * Advance one tween by `delta` seconds and write its value.
 *
 * Returns whether it has finished, which is the caller's cue to drop it and
 * raise the event. A zero-length tween finishes on its first tick having
 * written `to` — the answer somebody asking for no duration wants, and better
 * than dividing by zero.
 */
export const advanceTween = (
  run: TweenRun,
  actor: Actor,
  delta: number,
): boolean => {
  run.elapsed += delta;
  const t = run.duration > 0 ? clamp01(run.elapsed / run.duration) : 1;
  const eased = CURVES[run.curve](t);
  for (const step of run.steps) {
    actor.set(step.property, tweenValue(step.from, step.to, eased));
  }
  return t >= 1;
};

/** A tween as its definition describes it: destinations, with no start yet. */
export interface TweenPlan {
  readonly id: string;
  readonly duration: number;
  readonly curve: Curve;
  readonly steps: ReadonlyArray<{property: Property<Tweenable>; to: Tweenable}>;
}

/**
 * Turn a plan into a run by reading where each property is NOW.
 *
 * The one thing a definition cannot know. It is called at the moment of
 * playing, which is what makes "fade out" mean "from however visible you are"
 * rather than from whatever you were when the file loaded.
 *
 * A destination whose value has no path between two of its kind is dropped and
 * said out loud: a sprite name or a color has no midpoint, and easing to one
 * over half a second would either do nothing or snap at the end. Dropping the
 * row rather than the tween keeps the rest of it working.
 */
export const beginTween = (plan: TweenPlan, actor: Actor): TweenRun => {
  const steps: TweenStep[] = [];
  for (const step of plan.steps) {
    const from = actor.get(step.property);
    if (!isTweenable(from) || !isTweenable(step.to)) {
      console.warn(
        `The tween "${plan.id}" cannot move "${step.property.name ?? step.property.id}": ` +
          'there is no half way between two of those. That row is ignored.',
      );
      continue;
    }
    steps.push({property: step.property, from, to: step.to});
  }
  return {
    id: plan.id,
    duration: plan.duration,
    curve: plan.curve,
    steps,
    elapsed: 0,
  };
};

/**
 * What generated code passes as `startTween`'s `onReplace`.
 *
 * The engine has no console and no opinion about where a warning belongs, so
 * `Actor.startTween` only reports; this is the report a WORLD makes, and it
 * goes where every other message from a running game goes.
 *
 * Worth saying at all because the alternative is silence: fading a thing out
 * while fading it in is a real mistake, and honouring the newer one looks
 * exactly like the older one never ran.
 */
export const tweenDisplaced = (displaced: TweenRun): void => {
  console.warn(
    `The tween "${displaced.id}" was stopped: something else started ` +
      `moving a property it was moving. The newest one wins.`,
  );
};
