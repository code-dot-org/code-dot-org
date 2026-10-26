// Which rule a name means, and what a reference is.
//
// The registry is the only thing that knows where a rule lives, which is what
// lets everything else refer to one by name alone. These are the properties the
// rest of the lab leans on: a name resolves wherever the rule sits, a moved rule
// is followed without touching what refers to it, and a name claimed twice is
// reported rather than silently picked.

import {describe, expect, it, beforeEach} from 'vitest';

import {BUILTIN_RULE_META} from '../builtinMeta';
import {parseRuleMeta} from '../ruleMeta';
import {
  duplicateRuleNames,
  memberValue,
  refFromValue,
  refModule,
  registerProjectRules,
  ruleByName,
  ruleLocation,
  ruleSlug,
} from '../ruleRegistry';

/** A minimal `.rule` at `modulePath`, named `name`, with one trait. */
const rule = (modulePath: string, name: string) =>
  parseRuleMeta(
    modulePath,
    JSON.stringify({
      blocks: {
        blocks: [
          {type: 'world_rule', fields: {NAME: name, ABILITY: `Has ${name}`}},
          {type: 'world_rule_trait', fields: {NAME: 'Windblown'}},
        ],
      },
    }),
  )!;

beforeEach(() => registerProjectRules([]));

describe('the rule registry', () => {
  it('resolves a built-in by name, to its world-lab export', () => {
    expect(ruleLocation('Space')).toEqual({
      source: 'builtin',
      exportName: 'SpatialRule',
    });
    expect(ruleByName('Space')?.source).toBe('builtin');
  });

  it('resolves a project rule by name, to the module it is in', () => {
    registerProjectRules([rule('rules/wind', 'Wind')]);
    expect(ruleLocation('Wind')).toEqual({
      source: 'project',
      modulePath: 'rules/wind',
    });
  });

  it('follows a rule that moved, with nothing stored changing', () => {
    // The whole point: a reference is a name, and a name is not a place.
    const ref = refFromValue('Wind#WindblownTrait');
    registerProjectRules([rule('rules/wind', 'Wind')]);
    expect(refModule(refFromValue(memberValue(ref)))).toBe('rules/wind');
    registerProjectRules([rule('mechanics/gusts', 'Wind')]);
    expect(refModule(refFromValue(memberValue(ref)))).toBe('mechanics/gusts');
  });

  it('round-trips a reference through the value a field stores', () => {
    const trait = BUILTIN_RULE_META[0].traits[0];
    const value = memberValue(trait.ref);
    expect(value).toBe('Space#PositionalTrait');
    const back = refFromValue(value);
    expect(back.source).toBe('builtin');
    expect(back.exportName).toBe('PositionalTrait');
    expect(refModule(back)).toBeUndefined(); // a built-in is imported from nowhere
  });

  it('keeps a name it has never heard of, rather than dropping it', () => {
    // A rule being written is not yet parsed; the field that names it still has
    // to hold what it holds. Only generating code needs the name to resolve.
    const ref = refFromValue('Unwritten#SomeTrait');
    expect(ref.ruleName).toBe('Unwritten');
    expect(ref.exportName).toBe('SomeTrait');
    expect(refModule(ref)).toBeUndefined();
  });

  it('reports a name two rules claim', () => {
    registerProjectRules([
      rule('rules/wind', 'Wind'),
      rule('rules/gust', 'Wind'),
    ]);
    expect(duplicateRuleNames()).toEqual(['Wind']);
    // First registered wins, so the choice is at least deterministic.
    expect(ruleLocation('Wind')).toEqual({
      source: 'project',
      modulePath: 'rules/wind',
    });
  });

  it('makes a block-type fragment of a name with spaces in it', () => {
    expect(ruleSlug('Arrow Keys')).toBe('ArrowKeys');
  });
});
