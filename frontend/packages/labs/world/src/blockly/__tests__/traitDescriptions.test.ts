// A trait's description, carried from where it is written to where it is
// read: a rule's `define trait` and an engine rule's `addTrait` both reach the
// editor's metadata (the `use trait` tooltip) and the running trait (the map
// editor's inspector, which reads the sandbox's live actors).

import {describe, expect, it} from 'vitest';

import {starterFile} from '../../constants';
import {PositionalTrait} from '../../engine';
import {resolveRuleContents} from '../../rules/ruleReference';
import {BUILTIN_RULE_META} from '../builtinMeta';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';

import {registerDefaultProjectRules} from './defaultProjectRules';

registerDefaultProjectRules();

describe('a trait’s description', () => {
  it('is handed to the running trait by the rule’s module', () => {
    const source = resolveRuleContents(starterFile('inputRule').contents);
    const meta = parseRuleMeta('rules/input', source)!;
    const said = meta.traits[0].description!;
    expect(said).toBeTruthy();
    expect(ruleMetaToModule(meta)).toContain(
      `description: ${JSON.stringify(said)}`,
    );
  });

  it('is an engine trait’s too, in the editor and at run time', () => {
    const positional = BUILTIN_RULE_META.flatMap(rule => rule.traits).find(
      trait => trait.name === 'Can Be Positioned',
    );
    expect(positional?.description).toBe(PositionalTrait.description);
    expect(PositionalTrait.description).toBeTruthy();
  });
});
