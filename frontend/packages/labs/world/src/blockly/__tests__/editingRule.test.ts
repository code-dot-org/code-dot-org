// A rule cannot use itself.
//
// A rule that names itself among the rules it uses would generate a module
// that imports its own default export — a cycle the compiler resolves to
// `undefined`, and the project dies reading `.id` of it before anything is
// drawn. A file that already says so does not get to require itself.

import {describe, expect, it, beforeEach} from 'vitest';

import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';

/** A `.rule` naming itself in a `use rule`, as a workspace could already hold. */
const selfUsing = parseRuleMeta(
  'rules/wind',
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_rule',
          fields: {NAME: 'Wind', ABILITY: 'Has Wind'},
          next: {block: {type: 'world_use_rule', fields: {RULE: 'Wind'}}},
        },
      ],
    },
  }),
)!;

beforeEach(() => {
  registerProjectRules([selfUsing]);
});

describe('a rule that names itself anyway', () => {
  it('does not require itself, and does not import itself', () => {
    expect(selfUsing.requires).toEqual([]);
    const module_ = ruleMetaToModule(selfUsing);
    expect(module_).not.toContain('rules/wind');
    expect(module_).not.toContain('rule.requires(');
  });
});
