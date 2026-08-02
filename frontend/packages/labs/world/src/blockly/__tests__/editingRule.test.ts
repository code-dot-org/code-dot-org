// A rule cannot use itself.
//
// `use rule Gravity` inside `rules/gravity.rule` generates a module that imports
// its own default export — a cycle the compiler resolves to `undefined`, and the
// project dies reading `.id` of it before anything is drawn. Two halves to that:
// the dropdown does not offer the rule whose workspace it is in, and a file that
// already holds one does not get to require itself anyway.

import {describe, expect, it, beforeEach} from 'vitest';

import {DOMAIN_BLOCKS} from '../domainBlocks';
import {editingRuleFor, setEditingRule} from '../editingRule';
import {setProjectRuleModules} from '../moduleOptions';
import {parseRuleMeta, ruleMetaToModule} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {setProjectRuleMeta} from '../traitOptions';

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

/** The `use rule` dropdown's live options, as a field on `workspace` sees them. */
const useRuleOptions = (workspace?: object): Array<[string, string]> => {
  const block = DOMAIN_BLOCKS.find(
    b => b.type === 'world_use_rule',
  ) as unknown as {
    args0: Array<{options: (field?: unknown) => Array<[string, string]>}>;
  };
  const field = workspace ? {getSourceBlock: () => ({workspace})} : undefined;
  return block.args0[0].options(field);
};

beforeEach(() => {
  setProjectRuleModules([['wind', 'rules/wind']]);
  setProjectRuleMeta([selfUsing]);
  registerProjectRules([selfUsing]);
});

describe('the `use rule` dropdown', () => {
  it('offers a project rule from a workspace that is not it', () => {
    const other = {};
    setEditingRule(other as never, 'rules/other');
    expect(useRuleOptions(other).map(([, value]) => value)).toContain('Wind');
  });

  it('does not offer the rule whose own workspace it is in', () => {
    const own = {};
    setEditingRule(own as never, 'rules/wind');
    expect(useRuleOptions(own).map(([, value]) => value)).not.toContain('Wind');
    // The built-ins are still there — a rule may use those.
    expect(useRuleOptions(own).map(([, value]) => value)).toContain('Space');
  });

  it('asks the workspace a flyout block would be dragged into', () => {
    // A block in the flyout belongs to the flyout's workspace, and is a preview
    // of one you might drag out — so the answer has to come from where it would
    // land, or the toolbox offers what the workspace refuses.
    const own = {};
    setEditingRule(own as never, 'rules/wind');
    const flyout = {isFlyout: true, targetWorkspace: own};
    expect(useRuleOptions(flyout).map(([, value]) => value)).not.toContain(
      'Wind',
    );
  });

  it('offers everything where nothing is being edited', () => {
    // The headless generator's workspace, which tags nothing: its palette is
    // never shown, and a value it could not offer is one it would drop while
    // deserializing a file it is about to generate from.
    expect(useRuleOptions({}).map(([, value]) => value)).toContain('Wind');
    expect(useRuleOptions().map(([, value]) => value)).toContain('Wind');
  });

  it('reads no rule from a field with no block yet', () => {
    expect(editingRuleFor(undefined)).toBeUndefined();
  });
});

describe('a rule that names itself anyway', () => {
  it('does not require itself, and does not import itself', () => {
    expect(selfUsing.requires).toEqual([]);
    const module_ = ruleMetaToModule(selfUsing);
    expect(module_).not.toContain('rules/wind');
    expect(module_).not.toContain('rule.requires(');
  });
});
