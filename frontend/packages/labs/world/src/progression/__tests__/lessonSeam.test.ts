// The way back, for callers that cannot use a hook.
//
// Two halves, and the second is the one worth a test: `lessonFor` answers
// NOTHING when no progression is mounted, whatever the catalogue says. A
// Blockly field asking this is deciding whether to draw a button, and a button
// that opens nothing is worse than no button — so the seam refuses to claim
// there is a lesson when there is nowhere to open it.

import {beforeEach, describe, expect, it, vi} from 'vitest';

import {lessonFor, openLesson, setLessonOpener} from '../lessonSeam';

beforeEach(() => setLessonOpener(null));

describe('the lesson seam', () => {
  it('finds nothing while nothing is mounted', () => {
    expect(lessonFor({kind: 'rule', id: 'gravity'})).toBeUndefined();
  });

  it('finds the tile that granted a rule', () => {
    setLessonOpener(() => {});
    expect(lessonFor({kind: 'rule', id: 'gravity'})).toBe('motion/gravity');
  });

  it('finds the tile that granted an actor', () => {
    setLessonOpener(() => {});
    expect(lessonFor({kind: 'actor', id: 'coin'})).toBe('platformer/pickups');
  });

  it('finds nothing for something no lesson grants', () => {
    setLessonOpener(() => {});
    expect(lessonFor({kind: 'rule', id: 'not-a-rule'})).toBeUndefined();
  });

  it('opens through whatever is registered', () => {
    const opener = vi.fn();
    setLessonOpener(opener);
    openLesson('motion/gravity');
    expect(opener).toHaveBeenCalledWith('motion/gravity');
  });

  // The unmount case: a stale closure over a provider that is gone is the bug
  // this shape exists to prevent, so clearing has to actually clear.
  it('opens nothing once the progression has gone', () => {
    const opener = vi.fn();
    setLessonOpener(opener);
    setLessonOpener(null);
    expect(() => openLesson('motion/gravity')).not.toThrow();
    expect(opener).not.toHaveBeenCalled();
  });
});
