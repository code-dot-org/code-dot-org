// A screen other than the Main Screen, compiled and shown
// (specs/SCREEN_STACK_PLAN.md, step 4).

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../fixtures/scenarios';
import {projectFiles} from '../runtime/projectFiles';

import {compileProject} from './support/compileProject';

const number = (value: number) => ({
  shadow: {type: 'math_number', fields: {NUM: value}},
});
const chain = (blocks: object[]): object =>
  blocks.reduceRight((next, block) => ({...block, next: {block: next}}));

/**
 * A settings screen: its own `volume` and `changed`, set and raised as it
 * loads, and a hat on `changed` that counts, on the Main Screen, by name.
 */
const SETTINGS = {
  type: 'map',
  name: 'Settings',
  backgroundColor: '#000000',
  properties: [{name: 'volume', type: 'number', value: '5'}],
  events: [{name: 'changed'}],
  actors: [],
  blocks: {
    blocks: {
      languageVersion: 0,
      blocks: [
        {
          type: 'world_on_map_loads',
          x: 20,
          y: 20,
          next: {
            block: chain([
              {
                type: 'world_set_ScreensSettings_VolumeProperty',
                inputs: {
                  VALUE: {
                    block: {
                      type: 'math_arithmetic',
                      fields: {OP: 'ADD'},
                      inputs: {
                        A: {
                          block: {
                            type: 'world_get_ScreensSettings_VolumeProperty',
                          },
                        },
                        B: number(1),
                      },
                    },
                  },
                },
              },
              {type: 'world_emit_ScreensSettings_ChangedEvent'},
            ]),
          },
        },
        {
          type: 'world_on_ScreensSettings_ChangedEvent',
          x: 20,
          y: 200,
          next: {
            block: chain([
              {
                type: 'world_set_ScreensMain_HeardProperty',
                inputs: {
                  VALUE: {
                    block: {
                      type: 'math_arithmetic',
                      fields: {OP: 'ADD'},
                      inputs: {
                        A: {
                          block: {type: 'world_get_ScreensMain_HeardProperty'},
                        },
                        B: {
                          block: {
                            type: 'world_get_ScreensSettings_VolumeProperty',
                          },
                        },
                      },
                    },
                  },
                },
              },
              // …and the screen is done with.
              {type: 'world_go_back'},
            ]),
          },
        },
      ],
    },
  },
};

/** The empty game, its Main Screen holding `heard`, and the settings. */
const project = (): Record<string, string> => {
  const files = projectFiles(WORLD_SCENARIOS.empty.source);
  const main = JSON.parse(files['screens/main.screen']) as Record<
    string,
    unknown
  >;
  return {
    ...files,
    'screens/main.screen': JSON.stringify({
      ...main,
      properties: [{name: 'heard', type: 'number', value: '0'}],
    }),
    'screens/settings.screen': JSON.stringify(SETTINGS),
  };
};

describe('a screen the game shows', () => {
  it('is registered by path, and declares its own words', async () => {
    const {world, code} = await compileProject(project());
    expect(code['screens/settings']).toContain('export const');
    expect(code['screens/settings']).not.toContain('from "screens/main"');
    expect(world.showScreen('screens/settings')).toEqual([]);
    expect(world.screens()).toHaveLength(2);
  }, 60000);

  it('reads and sets its own copy, and the game’s values by name', async () => {
    const {world} = await compileProject(project());
    world.showScreen('screens/settings');
    world.tick(1 / 60);
    // Loaded: 5 + 1 = 6, raised, and heard: 0 + 6; and gone back.
    expect(world.valueNamed('heard')).toBe(6);
    expect(world.screens()).toHaveLength(1);

    // A second copy starts from 5 again, and only it hears its own event.
    world.showScreen('screens/settings');
    world.tick(1 / 60);
    expect(world.valueNamed('heard')).toBe(12);
  }, 60000);

  it('is shown by `show screen`, from the Main Screen’s code', async () => {
    const files = project();
    const main = JSON.parse(files['screens/main.screen']) as Record<
      string,
      unknown
    >;
    const shows = {
      ...files,
      'screens/main.screen': JSON.stringify({
        ...main,
        blocks: {
          blocks: {
            languageVersion: 0,
            blocks: [
              {
                type: 'world_on_screen_loads',
                x: 20,
                y: 20,
                next: {
                  block: {
                    type: 'world_show_screen',
                    fields: {SCREEN: 'screens/settings'},
                  },
                },
              },
            ],
          },
        },
      }),
    };
    const {world} = await compileProject(shows);
    expect(world.screens()).toHaveLength(2);
    world.tick(1 / 60);
    expect(world.screens()).toHaveLength(1);
  }, 60000);

  it('hears nothing once it is taken off', async () => {
    const {world} = await compileProject(project());
    world.showScreen('screens/settings');
    world.goBack();
    world.tick(1 / 60);
    expect(world.valueNamed('heard')).toBe(0);
  }, 60000);
});
