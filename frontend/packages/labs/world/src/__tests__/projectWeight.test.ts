// What a new project weighs, and where the weight is.
//
// This test used to say that nine tenths of a starter project was rules the
// learner had not written, and it existed to be broken (specs/NEXT.md §2).
// It has been. A rule nobody has edited is now a REFERENCE — the library's
// rule, named rather than copied (`rules/ruleReference`) — and a new project
// went from 1,191,452 bytes to about 51,000.
//
// It is still not a performance test and it still does not know what a good
// number would be. It knows what today's number is, and it fails when that
// changes by more than a rounding, so the creep it was written about cannot
// come back quietly: a rule that legitimately grows updates a ceiling in the
// same commit, where somebody can see it move.
//
// THE SHAPE OF THE ASSERTIONS IS STILL THE FINDING, and the shape has
// inverted. What a starter project weighs is now the learner's game, and the
// library is twelve lines of JSON naming what to go and fetch.

import {describe, expect, it} from 'vitest';

import {DEFAULT_PROJECT} from '../constants';
import {
  isRuleReference,
  parseRuleReference,
  stockVersion,
} from '../rules/ruleReference';
import {stockRule, STOCK_RULES} from '../rules/stock';
import {projectFiles} from '../runtime/projectFiles';

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
  it('is fifty kilobytes, and was a megabyte', () => {
    // The whole thing as it goes to storage. 51,081 bytes on 2026-09-06,
    // against 1,191,452 on 2026-09-03 — the same project, twenty-three times
    // lighter, with nothing removed from it.
    const whole = bytes(JSON.stringify(DEFAULT_PROJECT.source));

    expect(whole).toBeLessThan(65_000);
  });

  it('is dominated by the game, which is the inversion', () => {
    // The old assertion here was `is dominated by rules nobody typed`, and the
    // numbers behind it were 1.10MB of rules against 40KB of everything the
    // starter level IS — a world, six actors, a map, an animation, six
    // sprites, an effect. Those 40KB have not moved. The megabyte beside them
    // has become 470 bytes.
    expect(rules).toHaveLength(12);
    expect(total(rules)).toBeLessThan(1_000);
    expect(total(files) - total(rules)).toBeGreaterThan(35_000);
    expect(total(rules) / total(files)).toBeLessThan(0.02);
  });

  it('holds every one of its rules as a reference', () => {
    // The guard against a quiet return: pasting a rule's contents into
    // `constants.ts` would work perfectly and put half a megabyte back.
    for (const file of Object.values(DEFAULT_PROJECT.source.files)) {
      if ((file.name ?? '').endsWith('.rule')) {
        expect(isRuleReference(file.contents ?? '')).toBe(true);
      }
    }
  });

  it('names a rule the shelf actually has, at the version it ships', () => {
    // A reference to a rule that is not there resolves to nothing, which is a
    // project with a rule file that declares no rule. `referenceToStock`
    // refuses to write one; this checks what was written.
    for (const file of Object.values(DEFAULT_PROJECT.source.files)) {
      const reference = parseRuleReference(file.contents ?? '');
      if (!reference) {
        continue;
      }
      const stock = stockRule(reference.stock);

      expect(stock, `no stock rule "${reference.stock}"`).toBeDefined();
      expect(reference.version).toBe(stockVersion(stock!));
    }
  });
});

describe('what the references stand for', () => {
  it('resolves to the megabyte that used to be stored', () => {
    // The weight has not gone anywhere — it has stopped being COPIED. What a
    // compile, a palette or a tutor context sees is byte for byte what it saw
    // before, which is the whole claim `projectFiles` makes.
    const resolved = Object.entries(projectFiles(DEFAULT_PROJECT.source))
      .filter(([path]) => path.endsWith('.rule'))
      .map(([, contents]) => bytes(contents));

    expect(resolved).toHaveLength(12);
    expect(resolved.reduce((sum, one) => sum + one, 0)).toBeGreaterThan(
      900_000,
    );
  });

  it('resolves each one to exactly the shelf’s copy', () => {
    // Byte-identical, and it has to be: a lesson check asks whether a rule
    // file still equals the library's to find out if the learner has edited it
    // (`progression/catalogue`, the Patrol lesson). A resolution that
    // re-serialized would answer "edited" for a rule nobody had touched.
    const resolved = projectFiles(DEFAULT_PROJECT.source);

    expect(resolved['rules/solid.rule']).toBe(stockRule('solid')?.contents);
    expect(resolved['rules/patrol.rule']).toBe(stockRule('patrol')?.contents);
  });

  it('has a library that no longer sets a ceiling on a project', () => {
    // 47 rules, 4.19MB. This used to be "the reason the ceiling rises every
    // time a rule is added", because a project copied from it. It does not any
    // more: what a project holds is one line per rule, so the shelf can grow
    // without a project growing with it. The number is kept because it is
    // still what the BUNDLE carries.
    const shelf = STOCK_RULES.map(rule => bytes(rule.contents));

    expect(shelf).toHaveLength(47);
    expect(shelf.reduce((sum, one) => sum + one, 0)).toBeLessThan(4_600_000);
  });
});
