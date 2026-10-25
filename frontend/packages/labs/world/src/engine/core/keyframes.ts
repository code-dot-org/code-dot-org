// An animation as a timeline of keyframes (specs/ANIMATION_PLAN.md, step 1;
// SIMPLE_INTERFACE.md, "Animations").
//
// An animation is a set of TRACKS, one per property it moves, and a track is
// a list of keys: a time in seconds and the value the property has then.
// Between two keys a number or a vector moves in a straight line; anything
// else — a sprite, an effect's on and off — holds until the next key. A
// flipbook is the case with only a sprite track; a tween is the case with
// only numbers. They are the same thing, which is why one timeline makes
// both.
//
// Pure values and pure functions, as `layout` is: the engine plays them
// (`rules/animation`), the Actor Editor edits them, and neither owns the
// arithmetic. Values are as a file holds them — a vector is `{x, y}` and not
// a `Vector` — since a timeline is read from an actor's file and written
// back to it.

/** How a key is left for the next one. Only a straight line, for now. */
export type Ease = 'linear';

/** One key: when, and what the property is then. */
export interface Key<V = unknown> {
  /** Seconds from the start of the animation. */
  at: number;
  value: V;
  /** How to move from this key to the next; absent is a straight line. */
  ease?: Ease;
}

/** A property's keys, in time order. */
export type Track<V = unknown> = readonly Key<V>[];

/** An animation: its tracks, whether it loops, and how long its timeline is. */
export interface Timeline {
  /** By the property each moves (`sprite`, `drawnOffset`, `effect:…`). */
  tracks: Readonly<Record<string, Track>>;
  /** Whether it starts again at its end. Absent does not. */
  loop?: boolean;
  /**
   * How long the editor's timeline is drawn, in seconds; absent is
   * `DEFAULT_LENGTH`. Not when it ENDS, which is its last key.
   */
  length?: number;
}

/** How long a new animation's timeline is (SIMPLE_INTERFACE.md). */
export const DEFAULT_LENGTH = 5;

/**
 * Times are kept to the millisecond. A key dragged to 0.30000000000000004
 * would not be the key at 0.3, and a second key would be written beside it.
 */
const toMs = (seconds: number): number => Math.round(seconds * 1000) / 1000;

const isVector = (value: unknown): value is {x: number; y: number} =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as {x?: unknown}).x === 'number' &&
  typeof (value as {y?: unknown}).y === 'number';

/** Whether two values can be moved between, rather than held. */
const movable = (a: unknown, b: unknown): boolean =>
  (typeof a === 'number' && typeof b === 'number') ||
  (isVector(a) && isVector(b));

const lerp = (a: number, b: number, f: number): number => a + (b - a) * f;

/**
 * What a track says at `t`.
 *
 * NOTHING BEFORE ITS FIRST KEY: a track that switches an effect on at 0.2
 * says nothing about it before then, and the property is left as the actor
 * has it. After the last key, the last value holds.
 */
export function valueAt<V>(track: Track<V>, t: number): V | undefined {
  if (track.length === 0 || t < track[0].at) {
    return undefined;
  }
  let at = 0;
  while (at + 1 < track.length && track[at + 1].at <= t) {
    at++;
  }
  const key = track[at];
  const next = track[at + 1];
  if (!next || !movable(key.value, next.value)) {
    return key.value;
  }
  const f = (t - key.at) / (next.at - key.at);
  if (typeof key.value === 'number') {
    return lerp(key.value, next.value as number, f) as V;
  }
  const from = key.value as {x: number; y: number};
  const to = next.value as {x: number; y: number};
  return {x: lerp(from.x, to.x, f), y: lerp(from.y, to.y, f)} as V;
}

/** Whether `t` falls on a key of the track, rather than between two. */
export const isKeyAt = (track: Track, t: number): boolean =>
  track.some(key => key.at === toMs(t));

/** When an animation ends: its last key, on any track. */
export function endOf(timeline: Timeline): number {
  let end = 0;
  for (const track of Object.values(timeline.tracks)) {
    for (const key of track) {
      end = Math.max(end, key.at);
    }
  }
  return end;
}

/**
 * Where in its timeline an animation is, `elapsed` seconds after it began,
 * and whether it has ended.
 *
 * A loop wraps at its end and never ends. One that does not loop stops at
 * its end and has ended from then on — at once, for one whose every key is
 * at 0, which is a still picture.
 */
export function timeIn(
  timeline: Timeline,
  elapsed: number,
): {t: number; ended: boolean} {
  const end = endOf(timeline);
  if (timeline.loop) {
    return {t: end > 0 ? elapsed % end : 0, ended: false};
  }
  return {t: Math.min(elapsed, end), ended: elapsed >= end};
}

/** The timeline with one track replaced; an empty track is removed. */
const withTrack = (
  timeline: Timeline,
  property: string,
  track: Track,
): Timeline => {
  const tracks = {...timeline.tracks};
  if (track.length) {
    tracks[property] = track;
  } else {
    delete tracks[property];
  }
  return {...timeline, tracks};
};

/**
 * The timeline with `property` set to `value` at `at`: the key there
 * replaced, or a new one put in its place in time.
 */
export function withKey(
  timeline: Timeline,
  property: string,
  at: number,
  value: unknown,
): Timeline {
  const time = toMs(Math.max(0, at));
  const kept = (timeline.tracks[property] ?? []).filter(key => key.at !== time);
  const track = [...kept, {at: time, value}].sort((a, b) => a.at - b.at);
  return withTrack(timeline, property, track);
}

/** The timeline without `property`'s key at `at`, if it had one. */
export function withoutKey(
  timeline: Timeline,
  property: string,
  at: number,
): Timeline {
  const time = toMs(at);
  const track = timeline.tracks[property] ?? [];
  return track.some(key => key.at === time)
    ? withTrack(
        timeline,
        property,
        track.filter(key => key.at !== time),
      )
    : timeline;
}

/**
 * The timeline with `property`'s key at `from` moved to `to`, and any key
 * already at `to` replaced by it. Nothing changes when there is no key at
 * `from`.
 */
export function withKeyMoved(
  timeline: Timeline,
  property: string,
  from: number,
  to: number,
): Timeline {
  const key = (timeline.tracks[property] ?? []).find(
    one => one.at === toMs(from),
  );
  if (!key) {
    return timeline;
  }
  // The key itself, ease and all, rather than a new one with its value.
  const time = toMs(Math.max(0, to));
  const track = [
    ...(timeline.tracks[property] ?? []).filter(
      one => one !== key && one.at !== time,
    ),
    {...key, at: time},
  ].sort((a, b) => a.at - b.at);
  return withTrack(timeline, property, track);
}
