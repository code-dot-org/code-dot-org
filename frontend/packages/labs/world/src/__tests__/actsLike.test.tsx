// One kind of actor being everything another one is, and going on being itself.
//
// `acts like ⟨…⟩` is subclassing, and what it is NOT is the half worth pinning.
// A kind is an identity — an instance carries the module it was placed from,
// and `is a ⟨…⟩` compares that — so a child is never among `any ⟨parent⟩`.
// What it qualifies under is every TRAIT relationship, which asks what a thing
// can do rather than what it is called.
//
// COMPILED AND RUN, because everything here is a fact about a built actor: a
// slot present, a step scheduled, a picture drawn, a `.type` that did not
// change. A file reads correctly whichever way any of those went.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../blockly/domainBlocks';
import {projectOwnMetas} from '../blockly/projectModules';
import {IntrinsicSizeProperty} from '../engine/rules/spatial';

import {compileProject} from './support/compileProject';

const me = () => ({block: {type: 'world_this_actor'}});

/**
 * The parent: a kind that keeps a number, counts every frame, and has a size.
 *
 * The three things a builder holds separately — an own property's SLOT, a
 * step, and a drawing — so a child missing any one of them fails differently.
 */
const BAR = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Bar'},
        next: {
          block: {
            type: 'world_rule_property',
            fields: {
              TYPE: 'number',
              ACCESS: 'writable',
              NAME: 'ticks',
              DEFAULT: '0',
            },
            next: {
              block: {
                type: 'world_trait_step',
                fields: {PHASE: 'act', NAME: 'count'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_ActorsBar_TicksProperty',
                      inputs: {
                        ACTOR: me(),
                        VALUE: {
                          block: {
                            type: 'math_arithmetic',
                            fields: {OP: 'ADD'},
                            inputs: {
                              A: {
                                block: {
                                  type: 'world_get_ActorsBar_TicksProperty',
                                  inputs: {ACTOR: me()},
                                },
                              },
                              B: {
                                block: {
                                  type: 'math_number',
                                  fields: {NUM: 1},
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                next: {
                  block: {
                    type: 'world_define_drawing',
                    fields: {WIDTH: 40, HEIGHT: 6},
                    inputs: {
                      DO: {
                        block: {
                          type: 'world_draw_rectangle',
                          inputs: {
                            X: {block: {type: 'math_number', fields: {NUM: 0}}},
                            Y: {block: {type: 'math_number', fields: {NUM: 0}}},
                            WIDTH: {
                              block: {type: 'math_number', fields: {NUM: 40}},
                            },
                            HEIGHT: {
                              block: {type: 'math_number', fields: {NUM: 6}},
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
});

/** The child: everything the Bar is, and nothing said twice. */
const FUEL = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Fuel Bar'},
        next: {
          block: {type: 'world_acts_like', fields: {ACTOR: 'actors/bar'}},
        },
      },
    ],
  },
});

const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/bar'},
            next: {
              block: {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/fuelBar'},
              },
            },
          },
        },
      },
    ],
  },
});

const project = {
  'actors/bar.actor': BAR,
  'actors/fuelBar.actor': FUEL,
  'worlds/main.world': WORLD,
};

/** The placed actor of a kind, by the module it was placed from. */
const placed = (world: {actors: Iterable<unknown>}, type: string) =>
  [...world.actors].find(one => (one as {type?: string}).type === type) as {
    get(p: unknown): unknown;
    type: string;
  };

describe('an actor that acts like another', () => {
  it('carries the parent’s property, and its own slot for it', async () => {
    // The slot is the point. An inherited property whose slot did not come
    // across throws on first READ naming the kind that declared it
    // (`Traited.get`) — from a step, every frame, with nothing on screen
    // saying which block did it.
    const {world, modules} = await compileProject(project);
    const ticks = modules['actors/bar'].TicksProperty;

    expect(placed(world, 'actors/fuelBar').get(ticks)).toBe(0);
  });

  it('runs the parent’s per-frame work, on itself', async () => {
    // Two actors, two counts, and the child's is its own — a step folded in
    // by kind runs once per actor of that kind (`World.useActorKind`).
    const {world, modules} = await compileProject(project);
    const ticks = modules['actors/bar'].TicksProperty;

    for (let frame = 0; frame < 5; frame++) {
      world.tick(1 / 60);
    }

    expect(placed(world, 'actors/bar').get(ticks)).toBe(5);
    expect(placed(world, 'actors/fuelBar').get(ticks)).toBe(5);
  });

  it('is drawn as the parent is, having said nothing about a picture', async () => {
    // READ THROUGH `intrinsic size`, which is the observable end of a drawing
    // and the reason this matters beyond looks: a declared picture IS the
    // actor's size, so everything that asks how big it is — the click box, the
    // collision box, "Stays in the Map" — reads it (`World.place`,
    // specs/DRAWING.md). An actor that inherited no picture has no size
    // either.
    //
    // …and 40x6 on the CHILD says the drawing was registered under the child's
    // own type rather than the parent's, which is where an inherited one could
    // quietly have gone.
    const {world} = await compileProject(project);

    expect(placed(world, 'actors/fuelBar').get(IntrinsicSizeProperty)).toEqual(
      expect.objectContaining({x: 40, y: 6}),
    );
  });

  it('is NOT one of the parent’s kind', async () => {
    // The half that is deliberately not inherited. `is a ⟨Bar⟩` and
    // `any ⟨Bar⟩` both compare `.type`, which is the module an instance was
    // placed from — so a Fuel Bar is a Fuel Bar however much of a Bar it is.
    // Trait membership is the relationship that DOES carry, and it is the one
    // that asks what a thing can do.
    const {world} = await compileProject(project);

    expect(placed(world, 'actors/fuelBar').type).toBe('actors/fuelBar');
    expect(
      [...world.actors].filter(
        one => (one as {type?: string}).type === 'actors/bar',
      ),
    ).toHaveLength(1);
  });

  it('works for an actor a world defines for itself', async () => {
    // WHICH IS NOT OBVIOUS, and I had it written down wrong. `define block`
    // and `define event` are refused inside a world's own `define actor`,
    // because each emits an `export const` and that body generates into a
    // block scope — so it is easy to assume `acts like` is refused there too.
    // It is not: it emits a CALL, and a block scope takes one quite happily.
    //
    // What a world-defined actor cannot do is name a file the project does not
    // hold, which is a fact about the project rather than about where the row
    // sits.
    const bar = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_actor',
            id: 'gaugeDef',
            fields: {NAME: 'Gauge'},
            next: {
              block: {type: 'world_acts_like', fields: {ACTOR: 'actors/bar'}},
            },
          },
          {
            type: 'world_world',
            fields: {NAME: 'My World'},
            next: {
              block: {
                type: 'world_add_actor',
                fields: {ACTOR: 'local:gaugeDef'},
              },
            },
          },
        ],
      },
    });
    const {world, modules} = await compileProject({
      'actors/bar.actor': BAR,
      'worlds/main.world': bar,
    });
    const gauge = [...world.actors][0];

    // The slot and the picture both, which is the whole of what came across.
    expect(gauge.get(modules['actors/bar'].TicksProperty as never)).toBe(0);
    expect(gauge.get(IntrinsicSizeProperty)).toEqual(
      expect.objectContaining({x: 40, y: 6}),
    );
    // …and it is still its own kind: a world-defined actor's type is the id
    // its definition was stamped with, not the file it acts like.
    expect(gauge.type).not.toBe('actors/bar');
  });

  it('puts the parent’s blocks in the child’s drawer as well', async () => {
    // A learner looking in the Fuel Bar's drawer for the thing that fills a
    // bar should find it there, rather than having to know it came from the
    // Bar. The same blocks, not a second minting: a type carries the file that
    // declared it, so this is one drawer's worth of them listed twice.
    const {toolbox} = buildDomainPalette([], {
      fileKind: 'actor',
      ownProperties: projectOwnMetas({
        'actors/bar.actor': BAR,
        'actors/fuelBar.actor': FUEL,
      }),
      ownActorModule: 'actors/fuelBar',
    });
    const drawer = (name: string) =>
      (toolbox as Array<{name?: string; blocks?: string[]}>).find(
        category => category.name === name,
      )?.blocks;

    expect(drawer('Fuel Bar')).toEqual([
      'world_set_ActorsBar_TicksProperty',
      'world_get_ActorsBar_TicksProperty',
    ]);
    expect(drawer('Bar')).toEqual([
      'world_set_ActorsBar_TicksProperty',
      'world_get_ActorsBar_TicksProperty',
    ]);
  });
});
