// A rule nobody has typed into, and the moment it becomes theirs.
//
// specs/NEXT.md §2. The claim is that a reference is invisible: everything
// downstream of `projectFiles` sees the rule, byte for byte, and the file on
// disk is one line. The risk is the other half — a reference that survives an
// edit would be a learner's work thrown away on the next load, which is the
// worst failure this lab could have.

import {describe, expect, it} from 'vitest';

import {renameRuleInSource} from '../../blockly/renameRule';
import {parseRuleMeta} from '../../blockly/ruleMeta';
import {DEFAULT_PROJECT, starterFile} from '../../constants';
import {projectFiles} from '../../runtime/projectFiles';
import {
  isRuleReference,
  parseRuleReference,
  referenceToStock,
  resolveRuleContents,
  ruleReferenceFor,
  stockVersion,
} from '../ruleReference';
import {STOCK_RULES, stockRule} from '../stock';

const gravity = stockRule('gravity')!;

describe('what a reference is', () => {
  it('names the rule and the shelf it was taken from', () => {
    expect(parseRuleReference(ruleReferenceFor(gravity))).toEqual({
      stock: 'gravity',
      version: stockVersion(gravity),
    });
  });

  it('is a line where the rule is a hundred kilobytes', () => {
    expect(ruleReferenceFor(gravity).length).toBeLessThan(60);
    expect(gravity.contents.length).toBeGreaterThan(50_000);
  });

  it('gives a different version to different contents', () => {
    // Not a claim about collisions — a claim that the hash reads the rule at
    // all. A constant would satisfy every other test in this file.
    const versions = new Set(STOCK_RULES.map(rule => stockVersion(rule)));

    expect(versions.size).toBeGreaterThan(STOCK_RULES.length - 3);
  });

  it('refuses to name a rule the shelf does not have', () => {
    // A starter project names its rules in source, so this is a build error
    // rather than a project holding a file that resolves to nothing.
    expect(() => referenceToStock('no-such-rule')).toThrow('no-such-rule');
  });
});

describe('telling one from a rule', () => {
  it('does not mistake any real rule for a reference', () => {
    // The recognition is a string prefix, because `projectFiles` runs over
    // every file in a project and a rule can be half a megabyte — parsing them
    // to find out what they are would cost more than the copies did.
    for (const rule of STOCK_RULES) {
      expect(`${rule.id}: ${isRuleReference(rule.contents)}`).toBe(
        `${rule.id}: false`,
      );
    }
  });

  it('is not fooled by a file that merely starts like one', () => {
    expect(parseRuleReference('{"stock":')).toBeUndefined();
    expect(parseRuleReference('{"stock": 12}')).toBeUndefined();
  });
});

describe('what a reference resolves to', () => {
  it('is the shelf’s copy, byte for byte', () => {
    // Byte-identical is load-bearing: a lesson check asks whether a rule file
    // still equals the library's to find out if the learner has edited it.
    expect(resolveRuleContents(ruleReferenceFor(gravity))).toBe(
      gravity.contents,
    );
  });

  it('leaves a workspace alone', () => {
    // Which is every file that is not a reference, so this runs over the whole
    // project on every read.
    for (const rule of STOCK_RULES.slice(0, 5)) {
      expect(resolveRuleContents(rule.contents)).toBe(rule.contents);
    }
  });

  it('resolves a rule the shelf has lost to nothing, rather than throwing', () => {
    // A rule renamed out of the library leaves a project holding a file that
    // declares no rule — which is what deleting a rule file by hand already
    // does, and which the lab already survives. Throwing would take the whole
    // project down over one entry in someone else's list.
    expect(resolveRuleContents('{"stock":"gone","version":"0"}')).toBe('');
  });

  it('is what the palette and the compiler actually see', () => {
    const files = projectFiles(DEFAULT_PROJECT.source);
    const meta = parseRuleMeta('rules/gravity', files['rules/gravity.rule']);

    expect(meta?.name).toBe('Gravity');
    expect(meta?.traits.map(trait => trait.ref.exportName)).toContain(
      'AffectedByGravityTrait',
    );
  });
});

describe('the moment a rule becomes the learner’s', () => {
  // COPY ON EDIT, and it has no promotion step: every project-wide rewrite
  // goes through `mapWorkspaces`, which resolves on the way in and writes what
  // comes back. A rewrite that changed something is an edit.
  const renamed = renameRuleInSource(
    DEFAULT_PROJECT.source,
    'Gravity',
    'Moon Gravity',
  );
  const contentsOf = (key: string) =>
    renamed.files[starterFile(key).id].contents;

  it('starts as a reference', () => {
    expect(isRuleReference(starterFile('gravityRule').contents)).toBe(true);
  });

  it('is a workspace once it has been renamed', () => {
    const after = contentsOf('gravityRule');

    expect(isRuleReference(after)).toBe(false);
    expect(parseRuleMeta('rules/gravity', after)?.name).toBe('Moon Gravity');
  });

  it('takes the rules that named it with it', () => {
    // `jump.rule` says `use rule Gravity`. It no longer says what the
    // library's copy says, so it is no longer the library's copy.
    expect(isRuleReference(contentsOf('jumpRule'))).toBe(false);
    expect(
      parseRuleMeta('rules/jump', contentsOf('jumpRule'))?.requires,
    ).toContain('Moon Gravity');
  });

  it('leaves every rule that did not name it as a reference', () => {
    // The saving is only real if this holds: one edit must not materialize the
    // library. Eleven of the twelve starter rules do not mention Gravity.
    const untouched = Object.values(renamed.files).filter(
      file =>
        (file.name ?? '').endsWith('.rule') && isRuleReference(file.contents),
    );

    expect(untouched.length).toBeGreaterThanOrEqual(9);
  });
});
