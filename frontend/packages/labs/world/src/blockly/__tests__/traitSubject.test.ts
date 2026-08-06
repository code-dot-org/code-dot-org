// Which traits `use trait` offers, and where.
//
// A trait belongs to whatever takes it (`TraitMeta.subject`), so the dropdown
// has to know where it is being asked from. Offering every trait everywhere
// would put "Affected by Gravity" on a camera — the meaningless-trait problem
// this project has already avoided twice, once by keeping cameras out of
// `world.actors` and once by giving traits a subject at all. This is the third
// place it would have come back.

import {describe, expect, it} from 'vitest';

import type {Blockly} from '@code-dot-org/blockly';

import {traitSubjectFor} from '../traitOptions';

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
