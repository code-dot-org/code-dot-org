// What a new project weighs, and where the weight is.
//
// A project carries its own copy of every rule it uses, which is the right
// OWNERSHIP — the rule is the learner's, editable, unconnected to the library
// — and it is why a starter project nobody has typed into is over a megabyte
// of JSON. Every save, every load, every diff and every tutor context pays for
// it, and the number grows quietly: a rule gains a step, the starter gains a
// rule, and nothing anywhere says so.
//
// So this says so. It is not a performance test and it does not know what a
// good number would be; it knows what today's number is, and it fails when
// that changes by more than a rounding. A rule that legitimately grows updates
// the ceiling in the same commit, which is the point — the number moves where
// somebody can see it move.
//
// THE SHAPE OF THE ASSERTIONS IS THE FINDING. Nine tenths of a starter project
// is rules the learner did not write, and two fifths of it is one rule. When
// specs/NEXT.md §2 lands — a rule the learner has not edited being a reference
// rather than a copy — these are the numbers that change, and `dominated by
// rules nobody typed` is the test that should fail and be rewritten.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../constants';
import {STOCK_RULES} from '../rules/stock';

/** Serialized size in UTF-8 bytes, which is what a save actually costs. */
const bytes = (text: string): number => new TextEncoder().encode(text).length;

interface Weighed {
  name: string;
  size: number;
}

const files: readonly Weighed[] = Object.values(
  DEFAULT_PROJECT.source.files,
).map(file => ({
  name: file.name ?? '',
  size: bytes(file.contents ?? ''),
}));

const rules = files.filter(file => file.name.endsWith('.rule'));
const total = (weighed: readonly Weighed[]): number =>
  weighed.reduce((sum, one) => sum + one.size, 0);

describe('what a new project weighs', () => {
  it('is a megabyte before anybody has typed anything', () => {
    // The whole thing as it goes to storage. 1.19MB on 2026-09-03.
    const whole = bytes(JSON.stringify(DEFAULT_PROJECT.source));

    expect(whole).toBeLessThan(1_300_000);
  });

  it('is dominated by rules nobody typed', () => {
    // Twelve rule workspaces, 1.10MB of the 1.19MB — and the other nineteen
    // files, which are everything the starter level actually IS (a world, six
    // actors, a map, an animation, six sprites, an effect), come to 40KB.
    //
    // This is the assertion specs/NEXT.md §2 exists to break.
    expect(rules).toHaveLength(12);
    expect(total(rules)).toBeLessThan(1_200_000);
    expect(total(files) - total(rules)).toBeLessThan(60_000);
    expect(total(rules) / total(files)).toBeGreaterThan(0.9);
  });

  it('has one rule that is two fifths of the project', () => {
    // `solid.rule` is 409 blocks and 500KB. It is in the starter because a
    // platformer needs bodies that stop each other, and a learner who opens it
    // to see how it works is shown a wall — the other half of the same fact,
    // and specs/NEXT.md §3.
    const biggest = [...rules].sort((a, b) => b.size - a.size)[0];

    expect(biggest.name).toBe('solid.rule');
    expect(biggest.size).toBeLessThan(550_000);
  });

  it('has a library the same weight problem scales with', () => {
    // What a project can copy FROM: 47 rules, 4.19MB. A project holds only
    // what it uses, so this is not a project's cost — it is the ceiling on
    // one, and the reason the ceiling rises every time a rule is added.
    const shelf = STOCK_RULES.map(rule => bytes(rule.contents));

    expect(shelf).toHaveLength(47);
    expect(shelf.reduce((sum, one) => sum + one, 0)).toBeLessThan(4_600_000);
  });
});
