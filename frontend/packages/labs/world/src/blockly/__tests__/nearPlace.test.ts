// `the ⟨any Coin⟩ within ⟨80⟩ of ⟨place⟩`, and its sibling asked by ability.
//
// The question every search has to ask and the language could not: what is near
// somewhere I am NOT. `the actors in ⟨…⟩ within ⟨…⟩ of ⟨…⟩` filters a list you
// already hold, measured from an actor; these ask the world, measured from a
// point, and go through the index rather than measuring everything
// (`core/spatialIndex`).
//
// What is pinned is the CALL, because the failure to fear is silent: a
// generator that emits a slightly wrong name compiles into a module that throws
// as it loads, and a stand-in block compiles into nothing at all.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../domainBlocks';

/** One block out of the palette, generated with the fields and sockets given. */
const codeFor = (
  type: string,
  fields: Record<string, string> = {},
  values: Record<string, string> = {},
): string => {
  const block = buildDomainPalette([]).blocks.find(
    candidate => candidate.type === type,
  ) as {
    generator: {javascript: (b: unknown, g: unknown, e: unknown) => unknown};
  };
  const generated = block.generator.javascript(
    {
      getFieldValue: (name: string) => fields[name] ?? null,
      getParent: () => null,
      getInputTargetBlock: () => null,
      workspace: {getTopBlocks: () => []},
      id: 'b1',
    },
    {
      valueToCode: (_b: unknown, name: string) => values[name] ?? '',
      statementToCode: () => '',
      definitions_: {},
    },
    {},
  );
  return String(Array.isArray(generated) ? generated[0] : generated);
};

describe('the actors near a place', () => {
  it('asks the world, from the point, for the kind chosen', () => {
    expect(
      codeFor(
        'world_near_place_kind',
        {ACTOR: 'actors/coin'},
        {DISTANCE: '80', PLACE: 'here'},
      ),
    ).toBe('world.actorsNear(here, 80, {type: "actors/coin"})');
  });

  it('asks for every kind when the dropdown says any', () => {
    // `(any)` is the empty value, and "every kind" is what the word means —
    // not "no kinds", which is what a narrowing on nothing would give.
    expect(
      codeFor('world_near_place_kind', {}, {DISTANCE: '80', PLACE: 'here'}),
    ).toBe('world.actorsNear(here, 80)');
  });

  it('finds nothing for a trait nothing declares', () => {
    // The bargain every unfinished dropdown here makes: no actors, visibly,
    // rather than a call on a name that is not there.
    expect(
      codeFor('world_near_place_trait', {}, {DISTANCE: '80', PLACE: 'here'}),
    ).toBe('[]');
  });

  it('reads an empty socket as no distance rather than as an error', () => {
    expect(codeFor('world_near_place_kind', {}, {PLACE: 'here'})).toBe(
      'world.actorsNear(here, 0)',
    );
  });
});
