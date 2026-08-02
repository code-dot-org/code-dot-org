import {afterEach, describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {
  setProjectRuleMeta,
  setProjectRules,
  traitOptions,
} from '../traitOptions';

// `traitOptions` reads rule metadata (built-ins derived from the engine's real
// rule graph, so this exercises the actual `requires` graph, not a mirror).
afterEach(() => {
  setProjectRules([]);
  setProjectRuleMeta([]);
  registerProjectRules([]);
});

/** Register a parsed project rule the way `refreshProjectDropdowns` does. */
const project = (...metas: Array<ReturnType<typeof parseRuleMeta>>): void => {
  const parsed = metas.filter(m => m !== undefined);
  setProjectRuleMeta(parsed);
  registerProjectRules(parsed);
};

describe('traitOptions (traits from the rules in play)', () => {
  it('lists a rule’s traits plus those of every rule it requires', () => {
    // Animation requires Space, so attaching just Animation puts both their
    // traits in play — labelled by name, valued by the rule and export the
    // generator resolves. (Gravity, collision and motion used to be the examples
    // here; all three are stock `.rule` files now, not built-ins.)
    setProjectRules(['Appearance']);
    const byValue = new Map(
      traitOptions().map(([label, value]) => [value, label]),
    );
    expect(byValue.get('Appearance#AppearanceTrait')).toBe('Has Appearance');
    expect(byValue.get('Space#PositionalTrait')).toBe('Can Be Positioned');
  });

  it('unions the traits across every attached rule', () => {
    setProjectRules(['Space', 'Appearance']);
    const values = traitOptions().map(([, value]) => value);
    expect(values).toContain('Space#PositionalTrait');
    expect(values).toContain('Appearance#AppearanceTrait');
    expect(values).not.toContain('Collisions#CanCollideTrait'); // neither pulls it
  });

  it('follows a project rule’s `use rule` dependency to the required rule’s traits', () => {
    // Has Wind requires AnimationRule (a `use rule` in its body) and provides a
    // Windblown trait. Attaching it should surface both its own trait and the
    // required rule's (transitively, Collision → Motion → Space).
    const wind = parseRuleMeta(
      'rules/wind',
      JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_rule',
              fields: {NAME: 'Has Wind'},
              next: {
                block: {
                  type: 'world_use_rule',
                  fields: {RULE: 'Appearance'},
                },
              },
            },
            // A trait is a top block beside the rule.
            {type: 'world_rule_trait', fields: {NAME: 'Windblown'}},
          ],
        },
      }),
    );
    project(wind);
    setProjectRules(['Has Wind']);
    const values = traitOptions().map(([, value]) => value);
    expect(values).toContain('Has Wind#WindblownTrait'); // its own trait
    expect(values).toContain('Appearance#AppearanceTrait'); // via Animation
    expect(values).toContain('Space#PositionalTrait'); // Animation → Space
  });

  it('offers a project `.rule`’s traits when a world attaches it', () => {
    // A declarative project rule, referenced by the name it gives itself (as a
    // world's `use rule` names it) — its traits join the dropdown, valued the
    // same way every other reference is.
    const wind = parseRuleMeta(
      'rules/wind',
      JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_rule',
              fields: {NAME: 'Has Wind'},
            },
            {type: 'world_rule_trait', fields: {NAME: 'Windblown'}},
          ],
        },
      }),
    );
    project(wind);
    setProjectRules(['Has Wind', 'Appearance']);
    const byValue = new Map(
      traitOptions().map(([label, value]) => [value, label]),
    );
    // A trait's value names its RULE, which is what the generator resolves to a
    // module — the project's own and the engine's, in the same form.
    expect(byValue.get('Has Wind#WindblownTrait')).toBe('Windblown');
    expect(byValue.get('Appearance#AppearanceTrait')).toBe('Has Appearance');
  });

  it('is sorted by label and falls back to (none) with no rules', () => {
    setProjectRules(['Appearance']);
    const labels = traitOptions().map(([label]) => label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    setProjectRules([]);
    expect(traitOptions()).toEqual([['(none)', '']]);
  });
});
