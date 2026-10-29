// A game whose Main Screen is a `.screen` file: the world built from the
// screen's data, with the level inside a Viewport (specs/SCREEN_MAP_PLAN.md,
// step 4).
//
// COMPILED AND RUN, since what is claimed is that data stands in for every
// row `define world` held: a value declared in the screen's data has to be
// minted, emitted and given its starting value; a rule setting has to reach
// the rule; and the level has to land in the Viewport's space rather than
// the root's.

import {describe, expect, it} from 'vitest';

import {projectOwnMetas} from '../blockly/projectModules';
import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {worldRuleProperties} from '../mapEditor/worldRuleProperties';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

/** The screen's size in tiles of 32 pixels, and so the game's. */
const COLUMNS = 12;
const ROWS = 9;

/**
 * The starter, whose Main Screen holds a Viewport onto `maps/main.map`, at
 * a size of its own and with `screen` laid over its data.
 */
function simpleOnAScreen(screen: object = {}): Record<string, string> {
  const files = {...projectFiles(WORLD_SCENARIOS.simple.source)};
  expect(files['worlds/main.world']).toBeUndefined();
  files['screens/main.screen'] = JSON.stringify({
    ...JSON.parse(files['screens/main.screen']),
    size: {width: COLUMNS, height: ROWS},
    ...screen,
  });
  return files;
}

describe('a Main Screen', () => {
  it('builds the game with the level inside its Viewport', async () => {
    const {world} = await compileProject(simpleOnAScreen());

    const [viewport] = world.actors.ofType('actors/viewport');
    const [player] = world.actors.ofType('actors/player');
    expect(viewport).toBeDefined();
    expect(player).toBeDefined();
    // The Viewport is the screen's; the player is the level's, in the World
    // the Viewport shows (specs/ONE_WORLD_PLAN.md).
    expect(world.spaceOf(viewport).id).toBe('main');
    expect(world.spaceOf(player)).toBe(world.spaces[0].mirrorOf);
    expect(world.spaceOf(player).id).toBe('world');
    expect(world.spaces).toHaveLength(1);
  });

  it('is shown at its own size', async () => {
    const {world} = await compileProject(simpleOnAScreen());

    // The screen's own view, which its camera is told.
    const view = world.viewSize(world.camera('main'));
    expect({x: view.x, y: view.y}).toEqual({x: COLUMNS * 32, y: ROWS * 32});
  });

  it('declares and starts the game-wide values its data holds', async () => {
    const files = simpleOnAScreen({
      properties: [{name: 'score', type: 'number', value: '3'}],
      events: [{name: 'quit'}],
    });
    const {world, modules} = await compileProject(files);

    const screen = modules['screens/main'];
    expect(screen.QuitEvent).toBeDefined();
    expect(world.get(screen.ScoreProperty as never)).toBe(3);
    // …and offered to every file as a world's are, named by the screen.
    const own = projectOwnMetas(files).find(
      meta => meta.modulePath === 'screens/main',
    );
    expect(own?.properties.map(property => property.name)).toEqual(['score']);
    expect(own?.events.map(event => event.name)).toEqual(['quit']);
  });

  it('gives a rule the setting its data holds', async () => {
    const plain = simpleOnAScreen();
    const [setting] = worldRuleProperties(plain).filter(
      property => property.type === 'number',
    );
    expect(setting).toBeDefined();
    const value = String(Number(setting.default || 0) + 7);

    const {world, code} = await compileProject(
      simpleOnAScreen({
        rules: [{setter: setting.setter, type: 'number', value}],
      }),
    );

    expect(code['screens/main']).toContain(`, ${value})`);
    world.tick(0);
    const read = Object.values(world.snapshot().world);
    expect(read).toContain(Number(value));
  });

  it('paints the color its data holds behind the screen', async () => {
    const {world} = await compileProject(
      simpleOnAScreen({backgroundColor: '#112233'}),
    );

    expect(world.snapshot().screenColor.slice(0, 3)).toEqual([
      0x11 / 255,
      0x22 / 255,
      0x33 / 255,
    ]);
  });

  it('runs what it does when it loads once its actors are placed', async () => {
    // The game starting is the Main Screen loading: the hat runs after the
    // world block, which places the screen's actors and declares its values.
    const {world, modules} = await compileProject(
      simpleOnAScreen({
        properties: [{name: 'score', type: 'number', value: '3'}],
        blocks: {
          blocks: {
            languageVersion: 0,
            blocks: [
              {
                type: 'world_on_screen_loads',
                next: {
                  block: {
                    type: 'world_set_ScreensMain_ScoreProperty',
                    // A read, which only the built World can answer: the
                    // level's one Player is already placed.
                    inputs: {
                      VALUE: {
                        block: {
                          type: 'world_count_of_kind',
                          fields: {TYPE: 'actors/player'},
                          inputs: {
                            LIST: {block: {type: 'world_all_actors'}},
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
      }),
    );

    const screen = modules['screens/main'];
    expect(world.get(screen.ScoreProperty as never)).toBe(1);
  });

  it('adds to the World, and counts what is in it, from its own code', async () => {
    // A world block means the game from any code, the screen's included
    // (specs/ONE_WORLD_PLAN.md): `add actor` adds to the World, and `all
    // actors` is the World's, and not the screen's own Viewport.
    const count = (kind: string) => ({
      type: 'world_count_of_kind',
      fields: {TYPE: kind},
      inputs: {LIST: {block: {type: 'world_all_actors'}}},
    });
    const {world, modules} = await compileProject(
      simpleOnAScreen({
        properties: [
          {name: 'score', type: 'number', value: '-1'},
          {name: 'boxes', type: 'number', value: '-1'},
        ],
        blocks: {
          blocks: {
            languageVersion: 0,
            blocks: [
              {
                type: 'world_on_screen_loads',
                next: {
                  block: {
                    type: 'world_add_actor',
                    id: 'added',
                    fields: {ACTOR: 'actors/ball'},
                    next: {
                      block: {
                        type: 'world_set_ScreensMain_BoxesProperty',
                        inputs: {VALUE: {block: count('actors/viewport')}},
                        next: {
                          block: {
                            type: 'world_set_ScreensMain_ScoreProperty',
                            inputs: {VALUE: {block: count('actors/ball')}},
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
      }),
    );

    // The level has a ball of its own; the screen's code added one more.
    const [viewport] = world.actors.ofType('actors/viewport');
    const balls = world.actors.ofType('actors/ball');
    const level = world.viewportSpaceOf(viewport)!.mirrorOf;
    expect(balls.every(ball => world.spaceOf(ball) === level)).toBe(true);
    const screen = modules['screens/main'];
    expect(world.get(screen.BoxesProperty as never)).toBe(0);
    expect(world.get(screen.ScoreProperty as never)).toBe(balls.length);
    expect(balls.length).toBeGreaterThan(1);
  });
});
