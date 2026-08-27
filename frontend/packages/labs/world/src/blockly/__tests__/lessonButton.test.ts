// The mortarboard on a `use rule` / `use trait` / `add actor` block: when it is
// there, and which lesson it points at.
//
// The same three-way agreement the eye beside it needs, with one term changed:
// the block has to name something, a lesson has to have granted it, and there
// has to be a progression mounted to open. Each is a way for the button to be
// wrong — one that opens nothing, or a missing one on a rule the learner was
// actually taught.

import type {Block} from 'blockly';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {setLessonOpener} from '../../progression/lessonSeam';
import {unlockNamedBy} from '../extensions/lessonButton';

import {registerDefaultProjectRules} from './defaultProjectRules';

/** A block that answers `getFieldValue` and nothing else. */
const block = (fields: Record<string, string>) =>
  ({
    getFieldValue: (name: string) => fields[name] ?? null,
  }) as unknown as Block;

registerDefaultProjectRules();

beforeEach(() => setLessonOpener(null));

describe('what a block was taught by', () => {
  it('resolves a rule by the name the block holds', () => {
    expect(unlockNamedBy(block({RULE: 'Gravity'}))).toEqual({
      kind: 'rule',
      id: 'gravity',
    });
  });

  // By NAME, not by file: the tile granted the stock rule, and the project's
  // copy of it is called whatever the learner called the file.
  it('resolves a trait through the rule it belongs to', () => {
    expect(
      unlockNamedBy(block({TRAIT: 'Gravity#AffectedByGravityTrait'})),
    ).toEqual({kind: 'rule', id: 'gravity'});
  });

  it('resolves an actor by the file it was imported as', () => {
    expect(unlockNamedBy(block({ACTOR: 'actors/coin'}))).toEqual({
      kind: 'actor',
      id: 'coin',
    });
  });

  it('names nothing for a rule the learner wrote', () => {
    expect(unlockNamedBy(block({RULE: 'My Own Rule'}))).toBeUndefined();
  });

  it('names nothing for a built-in, which no lesson granted', () => {
    expect(unlockNamedBy(block({RULE: 'Space'}))).toBeUndefined();
  });

  it('names nothing for an actor the world defines itself', () => {
    // `local:<block id>` is a kind declared inside a world — a real value this
    // field holds, and not a file at all.
    expect(unlockNamedBy(block({ACTOR: 'local:abc123'}))).toBeUndefined();
  });

  it('names nothing for a block that names nothing', () => {
    expect(unlockNamedBy(block({}))).toBeUndefined();
  });
});

describe('whether there is a lesson to open', () => {
  it('is no while nothing is listening', async () => {
    const {lessonFor} = await import('../../progression/lessonSeam');
    expect(lessonFor({kind: 'rule', id: 'gravity'})).toBeUndefined();
  });

  it('is the tile that granted it once something is', async () => {
    const {lessonFor} = await import('../../progression/lessonSeam');
    setLessonOpener(vi.fn());
    expect(lessonFor({kind: 'rule', id: 'gravity'})).toBe('motion/gravity');
  });
});
