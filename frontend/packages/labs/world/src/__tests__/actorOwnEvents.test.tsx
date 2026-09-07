// An actor that declares its own event, raises it, and is heard.
//
// The fourth thing a kind of actor may declare for itself, after state
// (`define property`), per-frame work (`each frame`) and a named thing it does
// (`define block`): something that HAPPENS to it. What it buys is a way for
// one kind to tell the rest of the project about a moment — a beacon that has
// flashed, a speech box that has finished — without a `.rule` file in between
// to own the event.
//
// COMPILED AND RUN, because every part of the claim is about generated code
// meeting the engine. `defineEvent` has to be emitted before the hat that
// names it (`assembleActorModule`), the `emit` has to reach the same object
// the hat registered against, and a world that merely imports the actor has to
// be able to name the event at all. A palette assertion would see none of it.

import {describe, expect, it} from 'vitest';

import {buildDomainPalette} from '../blockly/domainBlocks';
import {projectOwnMetas} from '../blockly/projectModules';

import {compileProject} from './support/compileProject';

/** `this actor`, in the socket every subject takes. */
const me = () => ({block: {type: 'world_this_actor'}});

/**
 * A Beacon: it flashes every frame, and counts the flashes it hears.
 *
 * The count is the observation. Emitting and handling are two halves of one
 * object, so a beacon whose `emit` reached a different `FlashesEvent` than its
 * hat registered against — which is what a declaration written twice, or
 * written after the hat, would produce — counts nothing at all.
 */
const BEACON = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_actor',
        fields: {NAME: 'Beacon'},
        next: {
          block: {
            type: 'world_rule_event',
            extraState: {parts: [{kind: 'label', text: 'flashes'}]},
            next: {
              block: {
                type: 'world_rule_property',
                fields: {
                  TYPE: 'number',
                  ACCESS: 'writable',
                  NAME: 'flashes seen',
                  DEFAULT: '0',
                },
                next: {
                  block: {
                    type: 'world_trait_step',
                    fields: {PHASE: 'act', NAME: 'flash'},
                    inputs: {
                      DO: {
                        block: {
                          type: 'world_emit_ActorsBeacon_FlashesEvent',
                          inputs: {ACTOR: me()},
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
      // The hat, a top-level block of its own as every hat is.
      {
        type: 'world_on_ActorsBeacon_FlashesEvent',
        inputs: {ACTOR: me()},
        next: {
          block: {
            type: 'world_set_ActorsBeacon_FlashesSeenProperty',
            inputs: {
              ACTOR: me(),
              VALUE: {
                block: {
                  type: 'math_arithmetic',
                  fields: {OP: 'ADD'},
                  inputs: {
                    A: {
                      block: {
                        type: 'world_get_ActorsBeacon_FlashesSeenProperty',
                        inputs: {ACTOR: me()},
                      },
                    },
                    B: {block: {type: 'math_number', fields: {NUM: 1}}},
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

const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/beacon'},
          },
        },
      },
    ],
  },
});

const project = {
  'actors/beacon.actor': BEACON,
  'worlds/main.world': WORLD,
};

/**
 * The same beacon, heard by the WORLD instead of by itself.
 *
 * The motivating case, and the one the actor's own hat does not prove: the
 * world names an event declared in a file it merely imports, and counts the
 * flashes in a world property of its own. `⟨any Beacon⟩` in the subject socket
 * rather than `this actor` — a `.world` at module scope has no actor, and
 * `kind` is how a hat there says which actors it is about.
 */
const WORLD_HEARS = JSON.stringify({
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
              NAME: 'flashes',
              DEFAULT: '0',
            },
            next: {
              block: {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/beacon'},
              },
            },
          },
        },
      },
      {
        type: 'world_on_ActorsBeacon_FlashesEvent',
        inputs: {
          ACTOR: {
            block: {
              type: 'world_actor_kind',
              fields: {ACTOR: 'actors/beacon'},
            },
          },
        },
        next: {
          block: {
            type: 'world_set_WorldsMain_FlashesProperty',
            inputs: {
              VALUE: {
                block: {
                  type: 'math_arithmetic',
                  fields: {OP: 'ADD'},
                  inputs: {
                    A: {block: {type: 'world_get_WorldsMain_FlashesProperty'}},
                    B: {block: {type: 'math_number', fields: {NUM: 1}}},
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

describe('an actor that declares its own event', () => {
  it('hears what it raises', async () => {
    const {world, modules} = await compileProject(project);
    const seen = modules['actors/beacon'].FlashesSeenProperty;
    const beacon = [...world.actors][0];

    // Three ticks, three flashes. Events are dispatched after each tick's
    // steps, so the count is exactly the number of frames rather than one
    // behind — and a beacon hearing nothing reads as 0, which is the failure
    // this is here to catch.
    for (let frame = 0; frame < 3; frame++) {
      world.tick(1 / 60);
    }

    expect(beacon.get(seen as never)).toBe(3);
  });

  it('is heard by a world that only imports the actor', async () => {
    // What the event is FOR. The world imports `FlashesEvent as
    // ActorsBeacon_FlashesEvent` — the alias every cross-file member gets
    // (`ruleRegistry.memberLocalName`) — and registers against the imported
    // template, whose handlers every instance is made with.
    const {world, modules} = await compileProject({
      'actors/beacon.actor': BEACON,
      'worlds/main.world': WORLD_HEARS,
    });
    const flashes = modules['worlds/main'].FlashesProperty;

    for (let frame = 0; frame < 3; frame++) {
      world.tick(1 / 60);
    }

    expect(world.get(flashes as never)).toBe(3);
  });

  it('exports the event, so anything that imports the actor can name it', async () => {
    // An event declared in an `.actor` file is an `export const`, exactly as
    // an own property is: the whole point of one is that something ELSE hears
    // it. Module-local, a world's hat would import a name the module does not
    // offer and the project would not compile.
    const {modules} = await compileProject(project);

    expect(modules['actors/beacon'].FlashesEvent).toMatchObject({
      id: 'flashes',
      name: 'flashes',
      ownerId: 'Beacon',
    });
  });

  it('puts the hat and the emit in that actor’s drawer', async () => {
    // Both, where a rule's `emit` is offered only while writing that rule. A
    // kind of actor raises its own events from its own file and nothing else
    // would do it instead, so withholding the raiser leaves a declaration
    // nobody can use.
    const metas = projectOwnMetas({
      'actors/beacon.actor': project['actors/beacon.actor'],
    });
    const {toolbox, rootTypes} = buildDomainPalette([], {
      fileKind: 'actor',
      ownProperties: metas,
    });
    const drawer = (toolbox as Array<{name?: string; blocks?: string[]}>).find(
      category => category.name === 'Beacon',
    )?.blocks;

    expect(drawer).toContain('world_on_ActorsBeacon_FlashesEvent');
    expect(drawer).toContain('world_emit_ActorsBeacon_FlashesEvent');
    // …and `define event` itself is offered in an `.actor`, which is what
    // makes any of the above reachable — a declaration nobody can drag in
    // declares nothing (`ROOT_HOMES`).
    const actorDrawer = (
      toolbox as Array<{name?: string; blocks?: string[]}>
    ).find(category => category.name === 'Actor')?.blocks;
    expect(actorDrawer).toContain('world_rule_event');
    // …and the hat is a ROOT, so the generator does not chain the block after
    // it into the handler's body.
    expect(rootTypes.has('world_on_ActorsBeacon_FlashesEvent')).toBe(true);
  });
});
