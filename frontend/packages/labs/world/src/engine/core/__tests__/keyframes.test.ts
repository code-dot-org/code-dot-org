// An animation as a timeline of keyframes (specs/ANIMATION_PLAN.md, step 1).

import {describe, expect, it} from 'vitest';

import {
  endOf,
  isKeyAt,
  timeIn,
  valueAt,
  withKey,
  withKeyMoved,
  withoutKey,
  type Timeline,
  type Track,
} from '../keyframes';

/** A bob: up four pixels and back, over six tenths of a second. */
const BOB: Track<{x: number; y: number}> = [
  {at: 0, value: {x: 0, y: 0}},
  {at: 0.3, value: {x: 0, y: -4}},
  {at: 0.6, value: {x: 0, y: 0}},
];

/** A coin's spin: three pictures, a tenth of a second each. */
const SPIN: Track<string> = [
  {at: 0, value: 'coin.png#0'},
  {at: 0.1, value: 'coin.png#1'},
  {at: 0.2, value: 'coin.png#2'},
];

describe('what a track says at a moment', () => {
  it('moves a vector in a straight line between keys', () => {
    expect(valueAt(BOB, 0.15)).toEqual({x: 0, y: expect.closeTo(-2)});
    expect(valueAt(BOB, 0.45)).toEqual({x: 0, y: expect.closeTo(-2)});
  });

  it('moves a number the same way', () => {
    const turn: Track<number> = [
      {at: 0, value: 0},
      {at: 1, value: 90},
    ];
    expect(valueAt(turn, 0.25)).toBe(22.5);
  });

  it('holds a picture until the next key, which is a flipbook', () => {
    expect(valueAt(SPIN, 0.05)).toBe('coin.png#0');
    expect(valueAt(SPIN, 0.1)).toBe('coin.png#1');
    expect(valueAt(SPIN, 0.19)).toBe('coin.png#1');
  });

  it('holds an on and off, as it holds a picture', () => {
    const on: Track<boolean> = [
      {at: 0.2, value: true},
      {at: 0.4, value: false},
    ];
    expect(valueAt(on, 0.3)).toBe(true);
    expect(valueAt(on, 0.5)).toBe(false);
  });

  it('says nothing before its first key, and the last value after its last', () => {
    // An effect switched on at 0.2 says nothing about it before then: the
    // actor keeps what it had.
    expect(valueAt([{at: 0.2, value: true}], 0.1)).toBeUndefined();
    expect(valueAt(BOB, 2)).toEqual({x: 0, y: 0});
    expect(valueAt([], 0)).toBeUndefined();
  });

  it('holds where two keys cannot be moved between', () => {
    const mixed: Track = [
      {at: 0, value: 1},
      {at: 1, value: 'two'},
    ];
    expect(valueAt(mixed, 0.5)).toBe(1);
  });
});

describe('where an animation is', () => {
  const spin: Timeline = {tracks: {sprite: SPIN}, loop: true};

  it('ends at its last key, on any track', () => {
    expect(endOf({tracks: {sprite: SPIN, drawnOffset: BOB}})).toBe(0.6);
    expect(endOf({tracks: {}})).toBe(0);
  });

  it('wraps at its end when it loops, and never ends', () => {
    expect(timeIn(spin, 0.25)).toEqual({t: expect.closeTo(0.05), ended: false});
    expect(timeIn(spin, 1000)).toMatchObject({ended: false});
  });

  it('stops at its end when it does not, and has ended from then on', () => {
    const once = {...spin, loop: false};
    expect(timeIn(once, 0.1)).toEqual({t: 0.1, ended: false});
    expect(timeIn(once, 0.5)).toEqual({t: 0.2, ended: true});
  });

  it('is a still picture when every key is at 0', () => {
    const still: Timeline = {tracks: {sprite: [{at: 0, value: 'p.png'}]}};
    expect(timeIn(still, 0)).toEqual({t: 0, ended: true});
    expect(timeIn({...still, loop: true}, 3)).toEqual({t: 0, ended: false});
  });
});

describe('editing a timeline', () => {
  const empty: Timeline = {tracks: {}};

  it('puts a key in its place in time, and replaces one already there', () => {
    let timeline = withKey(empty, 'turn', 0.5, 45);
    timeline = withKey(timeline, 'turn', 0, 0);
    timeline = withKey(timeline, 'turn', 0.5, 90);
    expect(timeline.tracks.turn).toEqual([
      {at: 0, value: 0},
      {at: 0.5, value: 90},
    ]);
  });

  it('keeps times to the millisecond, so a key is found where it was put', () => {
    const timeline = withKey(empty, 'turn', 0.1 + 0.2, 10);
    expect(timeline.tracks.turn[0].at).toBe(0.3);
    expect(isKeyAt(timeline.tracks.turn, 0.3)).toBe(true);
    expect(withKey(timeline, 'turn', 0.3, 20).tracks.turn).toHaveLength(1);
  });

  it('takes a key away, and the track with its last key', () => {
    const one = withKey(empty, 'opacity', 0, 1);
    expect(withoutKey(one, 'opacity', 0).tracks).toEqual({});
    expect(withoutKey(one, 'opacity', 2)).toBe(one);
  });

  it('moves a key, ease and all, over one already where it lands', () => {
    const timeline: Timeline = {
      tracks: {
        turn: [
          {at: 0, value: 0, ease: 'linear'},
          {at: 1, value: 90},
        ],
      },
    };
    const moved = withKeyMoved(timeline, 'turn', 0, 1);
    expect(moved.tracks.turn).toEqual([{at: 1, value: 0, ease: 'linear'}]);
    expect(withKeyMoved(timeline, 'turn', 0.5, 2)).toBe(timeline);
  });

  it('leaves the rest of the animation as it was', () => {
    const timeline: Timeline = {tracks: {sprite: SPIN}, loop: true, length: 2};
    const edited = withKey(timeline, 'turn', 1, 90);
    expect(edited.tracks.sprite).toBe(SPIN);
    expect(edited).toMatchObject({loop: true, length: 2});
    expect(timeline.tracks.turn).toBeUndefined();
  });
});
