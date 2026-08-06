// Which traits `use trait` offers, and where.
//
// A trait belongs to whatever takes it (`TraitMeta.subject`), so the dropdown
// has to know where it is being asked from. Offering every trait everywhere
// would put "Affected by Gravity" on a camera — the meaningless-trait problem
// this project has already avoided twice, once by keeping cameras out of
// `world.actors` and once by giving traits a subject at all. This is the third
// place it would have come back.

import {beforeEach, describe, expect, it} from 'vitest';

import type {Blockly} from '@code-dot-org/blockly';

import {
  anyTraitOptions,
  setProjectRuleMeta,
  setProjectRules,
  traitOptions,
  traitSubjectFor,
} from '../traitOptions';

/**
 * A `use trait` field whose block sits under the given chain, innermost first.
 *
 * Ordinary parents rather than surround parents, because `use trait` chains
 * BELOW `define actor` and `define camera` alike — their bodies are stacks, so
 * being next-connected is being inside.
 */
const fieldUnder = (
  ...blocks: Array<string | {type: string; subject?: string}>
): {getSourceBlock(): unknown} => {
  let parent: unknown = null;
  for (const entry of [...blocks].reverse()) {
    const spec = typeof entry === 'string' ? {type: entry} : entry;
    const above = parent;
    parent = {
      type: spec.type,
      getParent: () => above,
      getFieldValue: (name: string) =>
        name === 'SUBJECT' ? (spec.subject ?? null) : null,
    };
  }
  return {getSourceBlock: () => parent};
};

describe('what a `use trait` is electing for', () => {
  it('is an actor under `define actor`', () => {
    expect(
      traitSubjectFor(
        fieldUnder('world_use_trait', 'world_actor') as Blockly.FieldDropdown,
      ),
    ).toBe('actor');
  });

  it('is a camera under `define camera`', () => {
    expect(
      traitSubjectFor(
        fieldUnder(
          'world_use_trait',
          'world_define_camera',
        ) as Blockly.FieldDropdown,
      ),
    ).toBe('camera');
  });

  it('is the trait’s own subject inside `define trait`', () => {
    // A camera trait's dependencies are camera traits: `requires` means "and
    // this too", so it must mean something the same subject can take.
    expect(
      traitSubjectFor(
        fieldUnder('world_use_trait', {
          type: 'world_rule_trait',
          subject: 'camera',
        }) as Blockly.FieldDropdown,
      ),
    ).toBe('camera');
    expect(
      traitSubjectFor(
        fieldUnder('world_use_trait', {
          type: 'world_rule_trait',
          subject: 'actor',
        }) as Blockly.FieldDropdown,
      ),
    ).toBe('actor');
  });

  it('is an actor for a trait declared before the field existed', () => {
    expect(
      traitSubjectFor(
        fieldUnder('world_use_trait', {
          type: 'world_rule_trait',
        }) as Blockly.FieldDropdown,
      ),
    ).toBe('actor');
  });

  it('is an actor for a block that is nowhere', () => {
    // A floating block, and the flyout's preview of one. Actor is the answer
    // that shows the traits a learner is most likely to be reaching for.
    expect(
      traitSubjectFor(fieldUnder('world_use_trait') as Blockly.FieldDropdown),
    ).toBe('actor');
    expect(traitSubjectFor(undefined)).toBe('actor');
  });

  it('takes the innermost of two that could answer', () => {
    // A `define camera` inside a world whose body also holds actors: the
    // nearest declaration is the one electing.
    expect(
      traitSubjectFor(
        fieldUnder(
          'world_use_trait',
          'world_define_camera',
          'world_world',
        ) as Blockly.FieldDropdown,
      ),
    ).toBe('camera');
  });
});

describe('which traits each dropdown offers', () => {
  // A `.rule` giving an actor trait and a camera trait, in play.
  const rule = {
    id: 'follow',
    name: 'Camera Follow',
    ability: 'Follows',
    modulePath: 'rules/follow',
    source: 'project' as const,
    ref: {
      source: 'project' as const,
      exportName: 'CameraFollowRule',
      ruleName: 'Camera Follow',
      modulePath: 'rules/follow',
    },
    requires: [],
    traits: [
      {
        id: 'follows',
        name: 'Follows',
        subject: 'camera' as const,
        requires: [],
        ref: {
          source: 'project' as const,
          exportName: 'FollowsTrait',
          ruleName: 'Camera Follow',
          modulePath: 'rules/follow',
        },
      },
      {
        id: 'watched',
        name: 'Watched',
        subject: 'actor' as const,
        requires: [],
        ref: {
          source: 'project' as const,
          exportName: 'WatchedTrait',
          ruleName: 'Camera Follow',
          modulePath: 'rules/follow',
        },
      },
    ],
    properties: [],
    actions: [],
    queries: [],
    events: [],
    steps: [],
    enums: [],
  };

  beforeEach(() => {
    setProjectRuleMeta([rule as never]);
    setProjectRules(['rules/follow']);
  });

  const names = (rows: Array<[string, string]>) => rows.map(([label]) => label);

  it('offers `use trait` only what the thing electing can take', () => {
    expect(
      names(
        traitOptions(
          fieldUnder(
            'world_use_trait',
            'world_define_camera',
          ) as Blockly.FieldDropdown,
        ),
      ),
    ).toEqual(['Follows']);
    expect(
      names(
        traitOptions(
          fieldUnder('world_use_trait', 'world_actor') as Blockly.FieldDropdown,
        ),
      ),
    ).toEqual(['Watched']);
  });

  it('offers `has trait` every trait, wherever it sits', () => {
    // The bug this pair exists for: inside `for each actor` — walking `all
    // cameras` — there is no `define camera` above, so a filtered dropdown
    // answered "actor" and hid every camera trait from the one loop that
    // needed them.
    expect(names(anyTraitOptions())).toEqual(['Follows', 'Watched']);
  });
});

describe('a rule seeing the traits it declares', () => {
  // Until now `traitOptions` answered "what may a WORLD use", which is right in
  // an `.actor` or a `.world` and wrong in the rule being written: a learner
  // who defines a trait cannot then name it in the same file's step, which is
  // the very next thing they try.

  /** A field on a block in a `.rule` workspace declaring the given traits. */
  const inRuleWorkspace = (
    ruleName: string,
    ...traits: Array<{name: string; subject?: string}>
  ) => {
    const tops = [
      {type: 'world_rule', getFieldValue: () => ruleName},
      ...traits.map(trait => ({
        type: 'world_rule_trait',
        getFieldValue: (name: string) =>
          name === 'NAME' ? trait.name : (trait.subject ?? null),
      })),
    ];
    return {
      getSourceBlock: () => ({
        getParent: () => null,
        workspace: {getTopBlocks: () => tops},
      }),
    } as unknown as Blockly.FieldDropdown;
  };

  beforeEach(() => {
    // Nothing in play: no world attaches this rule yet, which is the case.
    setProjectRuleMeta([]);
    setProjectRules([]);
  });

  it('offers its own traits though no world attaches it', () => {
    expect(
      anyTraitOptions(inRuleWorkspace('Camera Follow', {name: 'Follows'})),
    ).toEqual([['Follows', 'Camera Follow#FollowsTrait']]);
  });

  it('stores the same reference a registered trait would', () => {
    // `<Rule Name>#<ExportName>`, which `refFromValue` decodes even while the
    // rule defining it is still being written.
    expect(
      anyTraitOptions(
        inRuleWorkspace('Camera Follow', {name: 'actor to follow'}),
      )[0][1],
    ).toBe('Camera Follow#ActorToFollowTrait');
  });

  it('still narrows `use trait` by subject among its own', () => {
    const field = inRuleWorkspace(
      'Camera Follow',
      {name: 'Follows', subject: 'camera'},
      {name: 'Watched', subject: 'actor'},
    );
    // The workspace has no `define camera` above the field, so electing here
    // is an actor's — and only the actor trait is offered.
    expect(traitOptions(field).map(([label]) => label)).toEqual(['Watched']);
  });

  it('offers nothing of its own in a workspace that is not a rule', () => {
    const notARule = {
      getSourceBlock: () => ({
        getParent: () => null,
        workspace: {getTopBlocks: () => [{type: 'world_world'}]},
      }),
    } as unknown as Blockly.FieldDropdown;

    expect(anyTraitOptions(notARule)).toEqual([['(none)', '']]);
  });
});
