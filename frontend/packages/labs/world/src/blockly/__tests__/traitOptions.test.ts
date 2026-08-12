import {afterEach, describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';
import {
  anyTraitOptions,
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
    //
    // Asked of `has trait`, because these two are exactly the traits `use
    // trait` no longer OFFERS — every actor has them (blockly/foundation). What
    // is being tested is the closure, and the closure is the same one.
    setProjectRules(['Appearance']);
    const byValue = new Map(
      anyTraitOptions().map(([label, value]) => [value, label]),
    );
    expect(byValue.get('Appearance#AppearanceTrait')).toBe('Has Appearance');
    expect(byValue.get('Space#PositionalTrait')).toBe('Can Be Positioned');
  });

  it('does not offer electing a trait every actor has already', () => {
    // The `use trait` half of the same answer `use rule` gives: an actor is
    // positioned and has an appearance whether it says so or not
    // (ActorBuilder's FOUNDATION_TRAITS), so a row for either is a tautology.
    setProjectRules(['Space', 'Appearance']);
    expect(traitOptions()).toEqual([['(none)', '']]);
    // Still ASKABLE, which is the distinction between the two dropdowns: `has
    // trait` interrogates a value rather than electing anything.
    expect(anyTraitOptions().map(([, value]) => value)).toContain(
      'Space#PositionalTrait',
    );
  });

  it('still offers them as one trait’s dependency on another', () => {
    // Under `define trait` the row generates `requires`, not `useTraits`: it is
    // a statement about the trait, and "this only means anything on something
    // positioned" is a thing four of the stock rules say (motion, collisions,
    // bounds, wrap). Only a row that would GIVE an actor a trait it has is a
    // tautology.
    setProjectRules(['Space', 'Appearance']);
    const inTrait = {
      getSourceBlock: () => ({
        getParent: () => ({
          type: 'world_rule_trait',
          getFieldValue: () => 'actor',
          getParent: () => null,
        }),
      }),
    };
    expect(traitOptions(inTrait as never).map(([, value]) => value)).toContain(
      'Space#PositionalTrait',
    );
  });

  it('unions the traits across every attached rule', () => {
    setProjectRules(['Space', 'Appearance']);
    const values = anyTraitOptions().map(([, value]) => value);
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
    // `has trait` again for the two the electing dropdown leaves out: the
    // dependency being followed is the point, and both ends of it are traits
    // every actor carries anyway.
    expect(traitOptions().map(([, value]) => value)).toContain(
      'Has Wind#WindblownTrait',
    ); // its own trait
    const values = anyTraitOptions().map(([, value]) => value);
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
    // A trait's value names its RULE, which is what the generator resolves to a
    // module — the project's own and the engine's, in the same form. Read off
    // `has trait`, which offers both, so the two forms can be compared.
    const byValue = new Map(
      anyTraitOptions().map(([label, value]) => [value, label]),
    );
    expect(byValue.get('Has Wind#WindblownTrait')).toBe('Windblown');
    expect(byValue.get('Appearance#AppearanceTrait')).toBe('Has Appearance');
    // And the project's own is what a learner may actually elect.
    expect(traitOptions()).toEqual([['Windblown', 'Has Wind#WindblownTrait']]);
  });

  it('is sorted by label and falls back to (none) with no rules', () => {
    setProjectRules(['Appearance']);
    const labels = traitOptions().map(([label]) => label);
    expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    setProjectRules([]);
    expect(traitOptions()).toEqual([['(none)', '']]);
  });
});
