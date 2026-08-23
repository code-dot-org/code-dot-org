// A tween DEFINED IN A FILE and played, end to end.
//
// The unit tests either side of this one cover the registry and the runtime.
// Neither can see whether the two blocks AGREE: `define tween` emits a `const`,
// `play tween` names that same `const`, and the generator has to have put them
// in one module in an order where the name is already bound. Real files, real
// generator, real ticks.

import {describe, expect, it} from 'vitest';

import {OpacityProperty} from '../engine';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const PLAYER = JSON.stringify({
  blocks: {
    blocks: [{type: 'world_actor', x: 20, y: 20, fields: {NAME: 'Player'}}],
  },
});

/**
 * A world that describes a fade, places a Player, and starts the fade on it.
 *
 * `define tween` is a ROOT here rather than chained under the world, which is
 * how a definition is meant to sit — the same shape `define actor` and `define
 * drawing` have, and what makes the generated `const` reachable from anywhere
 * in the module.
 */
const world = (seconds = 1) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_define_tween',
          id: 'fadeDef',
          x: 20,
          y: 300,
          fields: {
            NAME: 'fade out',
            PROP: 'Appearance_OpacityProperty',
            CURVE: 'linear',
          },
          inputs: {
            TO: {block: {type: 'math_number', fields: {NUM: 0}}},
            SECONDS: {block: {type: 'math_number', fields: {NUM: seconds}}},
          },
        },
        {
          type: 'world_world',
          x: 20,
          y: 20,
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/player'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_play_tween',
                    fields: {TWEEN: 'fadeDef'},
                    inputs: {ACTOR: {block: {type: 'world_this_actor'}}},
                  },
                },
              },
            },
          },
        },
      ],
    },
  });

const project = (seconds?: number) =>
  projectFiles({
    files: {
      p: {
        id: 'p',
        name: 'player.actor',
        language: 'actor',
        contents: PLAYER,
        folderId: 'actors',
      },
      w: {
        id: 'w',
        name: 'main.world',
        language: 'world',
        contents: world(seconds),
        folderId: 'worlds',
      },
    },
    folders: {
      actors: {id: 'actors', name: 'actors', parentId: '0'},
      worlds: {id: 'worlds', name: 'worlds', parentId: '0'},
    },
    openFiles: [],
  } as never);

describe('a tween defined in a file and played', () => {
  it('compiles — the play block names a const the definition bound', async () => {
    // The agreement the unit tests cannot see. A mismatch here is a
    // ReferenceError at module scope, which takes the whole world with it.
    await expect(compileProject(project())).resolves.toBeDefined();
  });

  it('moves the property while the game runs', async () => {
    const {world: built} = await compileProject(project());
    const actor = [...built.actors][0];

    expect(actor.get(OpacityProperty)).toBe(1);

    built.tick(0.25);

    expect(actor.get(OpacityProperty)).toBeCloseTo(0.75, 6);
  });

  it('arrives exactly, and stops', async () => {
    const {world: built} = await compileProject(project());
    const actor = [...built.actors][0];

    for (let frame = 0; frame < 90; frame++) {
      built.tick(1 / 60);
    }

    // Landed on the end rather than sailing past it, and no longer running —
    // a tween that never finished would go on writing every frame.
    expect(actor.get(OpacityProperty)).toBe(0);
    expect(actor.tweens()).toHaveLength(0);
  });

  it('takes as long as it was told to', async () => {
    // The duration is read from the block, not assumed: a tween that ignored
    // it would pass every test above.
    const {world: built} = await compileProject(project(2));
    const actor = [...built.actors][0];

    built.tick(1);

    expect(actor.get(OpacityProperty)).toBeCloseTo(0.5, 6);
  });
});
