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
// the hat registered against, and a screen that merely imports the actor has to
// be able to name the event at all. A palette assertion would see none of it.

import {describe, expect, it} from 'vitest';

import {actorDocument} from '../actors/actorDocument';
import {buildDomainPalette} from '../blockly/domainBlocks';
import {projectOwnMetas} from '../blockly/projectModules';

import {compileProject} from './support/compileProject';
import {levelScreen} from './support/levelScreen';

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
const BEACON = actorDocument({
  name: 'Beacon',
  members: [{kind: 'event', parts: [{kind: 'label', text: 'flashes'}]}],
  properties: [
    {name: 'flashes seen', type: 'number', access: 'writable', value: '0'},
  ],
  steps: [
    {
      name: 'flash',
      phase: 'act',
      body: {
        type: 'world_emit_ActorsBeacon_FlashesEvent',
        inputs: {ACTOR: me()},
      },
    },
  ],
  code: [
    // The hat, a root of its own as every hat is.
    {
      type: 'world_on_ActorsBeacon_FlashesEvent',
      next: {
        block: {
          type: 'world_set_ActorsBeacon_FlashesSeenProperty',
          inputs: {
            ACTOR: me(),
            VALUE: {
              block: {
                type: 'math_arithmetic',
                fields: {OP: 'ADD', SUBJECT: 'actors/beacon'},
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
});

const WORLD = levelScreen({
  blocks: {
    blocks: [
      {
        type: 'world_on_screen_loads',
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
  'screens/main.screen': WORLD,
};

/**
 * The same beacon, heard by the Main Screen instead of by itself.
 *
 * The motivating case, and the one the actor's own hat does not prove: the
 * screen names an event declared in a file it merely imports, and counts the
 * flashes in a property of its own. `⟨any Beacon⟩` in the subject socket
 * rather than `this actor` — a screen's code has no actor, and `kind` is how
 * a hat there says which actors it is about.
 */
const SCREEN_HEARS = levelScreen(
  {
    blocks: {
      blocks: [
        {
          type: 'world_on_screen_loads',
          next: {
            block: {type: 'world_add_actor', fields: {ACTOR: 'actors/beacon'}},
          },
        },
        {
          type: 'world_on_ActorsBeacon_FlashesEvent',
          next: {
            block: {
              type: 'world_set_ScreensMain_FlashesProperty',
              inputs: {
                VALUE: {
                  block: {
                    type: 'math_arithmetic',
                    fields: {OP: 'ADD'},
                    inputs: {
                      A: {
                        block: {type: 'world_get_ScreensMain_FlashesProperty'},
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
  },
  {properties: [{name: 'flashes', type: 'number', value: '0'}]},
);

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

  it('is heard by a screen that only imports the actor', async () => {
    // What the event is FOR. The screen imports `FlashesEvent as
    // ActorsBeacon_FlashesEvent` — the alias every cross-file member gets
    // (`ruleRegistry.memberLocalName`) — and registers against the imported
    // template, whose handlers every instance is made with.
    const {world, modules} = await compileProject({
      'actors/beacon.actor': BEACON,
      'screens/main.screen': SCREEN_HEARS,
    });
    const flashes = modules['screens/main'].FlashesProperty;

    for (let frame = 0; frame < 3; frame++) {
      world.tick(1 / 60);
    }

    expect(world.get(flashes as never)).toBe(3);
  });

  it('exports the event, so anything that imports the actor can name it', async () => {
    // An event declared in an `.actor` file is an `export const`, exactly as
    // an own property is: the whole point of one is that something ELSE hears
    // it. Module-local, a screen's hat would import a name the module does not
    // offer and the project would not compile.
    const {modules} = await compileProject(project);

    expect(modules['actors/beacon'].FlashesEvent).toMatchObject({
      id: 'flashes',
      name: 'flashes',
      ownerId: 'Beacon',
    });
  });

  /** The Beacon's drawer, as the palette of some file builds it. */
  const beaconDrawer = (editing?: string) => {
    const {toolbox, rootTypes} = buildDomainPalette([], {
      fileKind: editing ? 'actor' : 'screen',
      ownProperties: projectOwnMetas({
        'actors/beacon.actor': project['actors/beacon.actor'],
      }),
      ownActorModule: editing,
    });
    const categories = toolbox as Array<{name?: string; blocks?: string[]}>;
    return {
      categories,
      rootTypes,
      blocks: categories.find(category => category.name === 'Beacon')?.blocks,
    };
  };

  it('puts the hat and the emit in its own file\u2019s drawer', () => {
    const {blocks, rootTypes, categories} = beaconDrawer('actors/beacon');

    expect(blocks).toContain('world_on_ActorsBeacon_FlashesEvent');
    expect(blocks).toContain('world_emit_ActorsBeacon_FlashesEvent');
    // …and `define event` itself is NOT offered in an actor's code: an
    // actor's events are designed in the Actor Editor
    // (specs/ACTOR_BLOCKS_PLAN.md).
    expect(
      categories.find(category => category.name === 'Actor')?.blocks,
    ).not.toContain('world_rule_event');
    // …and the hat is a ROOT, so the generator does not chain the block after
    // it into the handler's body.
    expect(rootTypes.has('world_on_ActorsBeacon_FlashesEvent')).toBe(true);
  });

  it('offers only the hat everywhere else', () => {
    // The drawer is in every file's toolbox, because an event exists to be
    // HEARD somewhere else — a screen that wants to know the beacon flashed is
    // the whole point of declaring one. Raising it is the opposite: only the
    // kind that declared the event knows when it happened, so an `emit` in a
    // screen would be that screen forging the actor's own notifications.
    const {blocks} = beaconDrawer(undefined);

    expect(blocks).toContain('world_on_ActorsBeacon_FlashesEvent');
    expect(blocks).not.toContain('world_emit_ActorsBeacon_FlashesEvent');
  });
});
