import {afterEach, describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../ruleMeta';
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
});

describe('traitOptions (traits from the rules in play)', () => {
  it('lists a rule’s traits plus those of every rule it requires', () => {
    // Motion requires Space, so attaching just Motion puts both their traits in
    // play — labelled by name, valued by the `world-lab` export the generator
    // writes. (Gravity and collision used to be the examples here; both are
    // stock `.rule` files now, not built-ins.)
    setProjectRules(['MotionRule']);
    const byExport = new Map(
      traitOptions().map(([label, exp]) => [exp, label]),
    );
    expect(byExport.get('MovableTrait')).toBe('Can Move');
    expect(byExport.get('PositionalTrait')).toBe('Can Be Positioned'); // via Space
    // Appearance isn't attached, so its trait is not offered.
    expect(byExport.has('AppearanceTrait')).toBe(false);
  });

  it('unions the traits across every attached rule', () => {
    setProjectRules(['MotionRule', 'AnimationRule']);
    const exports = traitOptions().map(([, exp]) => exp);
    expect(exports).toContain('MovableTrait'); // Motion
    expect(exports).toContain('AppearanceTrait'); // Animation
    expect(exports).toContain('PositionalTrait'); // Motion requires Spatial
    expect(exports).not.toContain('CollidableTrait'); // neither pulls Collision
  });

  it('follows a project rule’s `use rule` dependency to the required rule’s traits', () => {
    // Has Wind requires MotionRule (a `use rule` in its body) and provides a
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
                  fields: {RULE: 'MotionRule'},
                },
              },
            },
            // A trait is a top block beside the rule.
            {type: 'world_rule_trait', fields: {NAME: 'Windblown'}},
          ],
        },
      }),
    );
    setProjectRuleMeta([wind!]);
    setProjectRules(['rules/wind']);
    const values = traitOptions().map(([, value]) => value);
    expect(values).toContain('rules/wind#WindblownTrait'); // its own trait
    expect(values).toContain('MovableTrait'); // via the required MotionRule
    expect(values).toContain('PositionalTrait'); // Motion → Space, transitively
  });

  it('offers a project `.rule`’s traits when a world attaches it (by module path)', () => {
    // A declarative project rule, referenced by its module path (as a world's
    // `use rule` names it) — its traits join the dropdown, valued by the project
    // export the generator will write.
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
    setProjectRuleMeta([wind!]);
    setProjectRules(['rules/wind', 'MotionRule']);
    const byValue = new Map(
      traitOptions().map(([label, value]) => [value, label]),
    );
    // A project trait's value carries its module, so `use trait` imports it.
    expect(byValue.get('rules/wind#WindblownTrait')).toBe('Windblown');
    // A built-in trait is still valued by its bare export name.
    expect(byValue.get('MovableTrait')).toBe('Can Move');
  });

  it('is sorted by label and falls back to (none) with no rules', () => {
    setProjectRules(['MotionRule']);
    const labels = traitOptions().map(([label]) => label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    setProjectRules([]);
    expect(traitOptions()).toEqual([['(none)', '']]);
  });
});
