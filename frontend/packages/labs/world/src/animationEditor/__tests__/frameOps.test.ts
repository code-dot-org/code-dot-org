// Reversing and ping-ponging a list of frames.

import {describe, expect, it} from 'vitest';

import {pingPong, reversed} from '../frameOps';

const frames = ['a', 'b', 'c', 'd'];
/** What the editor passes: a copy with an identity of its own. */
const copy = (frame: string) => `${frame}'`;

describe('reversed', () => {
  it('plays the frames backwards', () => {
    expect(reversed(frames)).toEqual(['d', 'c', 'b', 'a']);
  });

  it('leaves the list it was given alone', () => {
    const before = [...frames];
    reversed(frames);
    expect(frames).toEqual(before);
  });
});

describe('pingPong', () => {
  it('adds the middle again, backwards', () => {
    expect(pingPong(frames, copy)).toEqual(['a', 'b', 'c', 'd', "c'", "b'"]);
  });

  it('never repeats an end — those are where the loop joins', () => {
    const out = pingPong(frames, copy);
    expect(out[0]).toBe('a');
    expect(out[out.length - 1]).not.toBe('a');
    expect(out.filter(frame => frame === 'd')).toHaveLength(1);
  });

  it('copies the frames it adds rather than repeating them', () => {
    // The same frame twice in one list is one frame two things point at:
    // deleting it, or retiming it, would happen twice.
    expect(pingPong(frames, copy).slice(4)).toEqual(["c'", "b'"]);
  });

  it('leaves too-short an animation as it is', () => {
    // Two frames already play out and back; one has nowhere to go.
    expect(pingPong(['a', 'b'], copy)).toEqual(['a', 'b']);
    expect(pingPong(['a'], copy)).toEqual(['a']);
    expect(pingPong([], copy)).toEqual([]);
  });

  it('turns three frames into four', () => {
    expect(pingPong(['a', 'b', 'c'], copy)).toEqual(['a', 'b', 'c', "b'"]);
  });
});
