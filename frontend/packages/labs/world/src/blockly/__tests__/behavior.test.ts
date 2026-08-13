// A behavior parsed as what it is: a rule with exactly one trait of the same
// name (specs/BEHAVIORS.md).
//
// One block plays both roles, so the same root is walked twice — once for what
// a RULE declares, once for what a TRAIT does. What these pin is that each walk
// takes its own half: a member claimed by both would be declared twice, once
// world-scoped and once actor-scoped, and the second copy is the one nothing
// would ever find.

import {describe, expect, it} from 'vitest';

import {parseRuleMeta} from '../ruleMeta';

/** A `.behavior` file: the hat, and the chain below that it runs. */
const behavior = (members: object[]) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_behavior',
          fields: {NAME: 'Chase'},
          next: {
            block: members.reduceRight<object | undefined>(
              (next, block) => ({
                ...block,
                ...(next ? {next: {block: next}} : {}),
              }),
              undefined,
            ),
          },
        },
      ],
    },
  });

const SPEED = {
  type: 'world_rule_property',
  fields: {TYPE: 'number', ACCESS: 'writable', NAME: 'speed', DEFAULT: '2'},
};

describe('a `.behavior` file', () => {
  it('is a rule with one trait of the same name', () => {
    const meta = parseRuleMeta('rules/chase', behavior([SPEED]))!;

    expect(meta.name).toBe('Chase');
    expect(meta.traits.map(trait => trait.name)).toEqual(['Chase']);
    // The reference an actor's `use trait` stores, and the export the module
    // writes — the same shape a rule's trait has, because it is one.
    expect(meta.traits[0].ref.exportName).toBe('ChaseTrait');
  });

  it('lifts a `define property` out of the body it is written in', () => {
    // The double-walk trap. Declared twice, an actor would carry one copy and
    // the world another, and `set speed` would write to whichever the block
    // happened to name.
    const meta = parseRuleMeta('rules/chase', behavior([SPEED]))!;

    expect(meta.properties).toHaveLength(1);
    expect(meta.properties[0].scope).toBe('actor');
    expect(meta.properties[0].ownerTraitId).toBe('Chase');
  });

  it('keeps `use rule` as its own dependency', () => {
    // The one thing in the chain that IS the behavior's rather than its
    // trait's: a behavior written against another rule's traits says so, and
    // says it where a rule says it.
    const meta = parseRuleMeta(
      'rules/chase',
      behavior([{type: 'world_use_rule', fields: {RULE: 'Physics'}}, SPEED]),
    )!;

    expect(meta.requires).toEqual(['Physics']);
    expect(meta.properties).toHaveLength(1);
  });

  it('IS its step — one, per actor, in `decide`', () => {
    // No `each frame` row inside it: the behavior is the step, so its body is
    // the implementation and there is nothing between the two
    // (specs/BEHAVIORS.md).
    const meta = parseRuleMeta('rules/chase', behavior([SPEED]))!;

    expect(meta.steps).toHaveLength(1);
    expect(meta.steps[0].name).toBe('Chase');
    expect(meta.steps[0].scope).toBe('actor');
    expect(meta.steps[0].ownerTraitId).toBe('Chase');
    expect(meta.steps[0].order).toEqual({kind: 'phase', phase: 'decide'});
  });

  it('is still nothing without a root', () => {
    expect(
      parseRuleMeta('rules/x', '{"blocks":{"blocks":[]}}'),
    ).toBeUndefined();
  });
});
