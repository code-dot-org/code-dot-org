// A reference to a rule the project has not got.
//
// Removing a rule deletes its file (rules/removeRule), so this is a state a
// project can be in from one click: every `use trait` naming that rule's traits
// is now a row pointing at nothing. What used to happen was the worst available
// answer — the generated module imported a file that was not there and the
// WHOLE project stopped compiling, over one row in one actor, with a message
// naming a file the learner may never have opened.

import {beforeEach, describe, expect, it} from 'vitest';

// For the side effect, and it is load-bearing: importing it is what registers
// the ENGINE's rules, and without them "does the project have this rule?"
// answers no for Space and Appearance too. Every path that generates code
// reaches the registry through `domainBlocks`, which imports this — but a test
// that skipped it would be testing a registry the app never has.
import '../builtinMeta';
import {buildDomainPalette} from '../domainBlocks';
import {parseWorldOwnMeta} from '../ownProperties';
import {parseRuleMeta} from '../ruleMeta';
import {
  missingRuleOfBlockType,
  refFromValue,
  refResolves,
  registerProjectRules,
} from '../ruleRegistry';

/** A parsed `.rule` declaring one trait, as the project would hold it. */
const wind = parseRuleMeta(
  'rules/wind',
  JSON.stringify({
    blocks: {
      blocks: [
        {type: 'world_rule', fields: {NAME: 'Wind', ABILITY: 'Has Wind'}},
        {type: 'world_rule_trait', fields: {NAME: 'Windblown'}},
      ],
    },
  }),
)!;

beforeEach(() => registerProjectRules([]));

describe('refResolves', () => {
  it('is true while the project holds the rule', () => {
    registerProjectRules([wind]);
    expect(refResolves(refFromValue('Wind#WindblownTrait'))).toBe(true);
  });

  it('is false once the rule is gone', () => {
    // The moment after a delete. Nothing else about the reference changed —
    // the actor still says "Windblown", and the value it stores is still the
    // value it always stored; what changed is that nothing declares it.
    registerProjectRules([wind]);
    const ref = refFromValue('Wind#WindblownTrait');
    registerProjectRules([]);

    expect(refResolves(ref)).toBe(false);
    expect(ref.ruleName).toBe('Wind');
  });

  it('is true for the engine’s own, which have no file to lose', () => {
    // A built-in resolves through the registry too (`builtinMeta` registers
    // them at import), and a bare export name belongs to the runtime rather
    // than to any module.
    expect(refResolves(refFromValue('Space#PositionalTrait'))).toBe(true);
    expect(refResolves(refFromValue('CollidableTrait'))).toBe(true);
  });
});

// ── A property that belongs to no rule ──────────────────────────────────────
//
// A file's own property (`blockly/ownProperties`) carries the DECLARING FILE's
// name where a rule member carries its rule's, because that is what its block
// type is keyed from. Read as a rule name it resolves to nothing, and the block
// wore "your project does not have “My World” any more" — on a world that was
// open at the time, and on every project that keeps a score.

describe('a world’s own property', () => {
  const world = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_rule_property',
              fields: {
                TYPE: 'number',
                ACCESS: 'writable',
                NAME: 'score',
                DEFAULT: '0',
              },
            },
          },
        },
      ],
    },
  });

  it('claims no rule, so nothing says the rule is missing', () => {
    const meta = parseWorldOwnMeta('worlds/main', world)!;
    buildDomainPalette([], {ownProperties: [meta]});
    expect(
      missingRuleOfBlockType('world_get_WorldsMain_ScoreProperty'),
    ).toBeUndefined();
    expect(
      missingRuleOfBlockType('world_set_WorldsMain_ScoreProperty'),
    ).toBeUndefined();
  });

  // …and the case it must not stop reporting: a RULE's property still says so
  // once the rule is gone, which is the whole of what the warning is for.
  it('does not stop a rule’s own property from warning', () => {
    const gusty = parseRuleMeta(
      'rules/wind',
      JSON.stringify({
        blocks: {
          blocks: [
            {
              type: 'world_rule',
              fields: {NAME: 'Wind', ABILITY: 'Has Wind'},
              next: {
                block: {
                  type: 'world_rule_property',
                  fields: {
                    TYPE: 'number',
                    ACCESS: 'writable',
                    NAME: 'strength',
                    DEFAULT: '1',
                  },
                },
              },
            },
          ],
        },
      }),
    )!;
    buildDomainPalette([gusty]);
    registerProjectRules([gusty]);
    expect(
      missingRuleOfBlockType('world_get_Wind_StrengthProperty'),
    ).toBeUndefined();
    registerProjectRules([]);
    expect(missingRuleOfBlockType('world_get_Wind_StrengthProperty')).toBe(
      'Wind',
    );
  });
});
