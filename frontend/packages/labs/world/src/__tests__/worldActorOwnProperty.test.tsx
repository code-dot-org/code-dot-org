// A property declared by an actor a WORLD defines, written from the world.
//
// The declaration used to be emitted inside the block a `define actor` opens,
// where its own drawing could read it and nothing else in the file could. The
// get and set blocks are offered project-wide all the same, so `set ⟨id⟩ of
// ⟨this actor⟩` in an `add actor` body — the shape every world uses to place
// two of a kind and tell them apart — was a block the palette handed over and
// the module threw on as it loaded:
//
//   ReferenceError: IdProperty is not defined
//
// It is why `memory/actor-state` is the one lesson with two files, and it is
// the second half of specs/PROGRESSION.md's "what is missing" pair.
//
// COMPILED AND RUN, because the failure was at module scope: a codegen
// assertion would have passed on the broken version, since the text it emitted
// was fine and only its POSITION was wrong.

import {describe, expect, it} from 'vitest';

import {compileProject} from './support/compileProject';

/** `Bar`, defined by the world, keeping a number of its own. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        id: 'worldDef',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            id: 'addOne',
            fields: {ACTOR: 'local:barDef'},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_WorldsMainBarDef_IdProperty',
                  inputs: {
                    ACTOR: {block: {type: 'world_this_actor'}},
                    VALUE: {block: {type: 'math_number', fields: {NUM: 7}}},
                  },
                },
              },
            },
          },
        },
      },
      {
        type: 'world_actor',
        id: 'barDef',
        fields: {NAME: 'Bar'},
        next: {
          block: {
            type: 'world_rule_property',
            fields: {
              TYPE: 'number',
              ACCESS: 'writable',
              NAME: 'id',
              DEFAULT: '1',
            },
          },
        },
      },
    ],
  },
});

describe('a world-defined actor’s own property', () => {
  it('can be written from the world that defines the actor', async () => {
    const {world} = await compileProject({'worlds/main.world': WORLD});

    const bar = [...world.actors][0];
    const id = bar.ownProperties().find(property => property.id === 'id');

    expect(id, 'the actor declared it').toBeDefined();
    expect(bar.get(id!)).toBe(7);
  });
});
