// The Scroll View, PLAYED: a finger over something taller than the window.
//
// The engine half is pinned without an actor in `engine/scrolling.test`; this
// is the half a learner meets — that dragging moves the page with the finger,
// that it stops at both ends, and that the arrows work once the keyboard is on
// it (specs/SCROLLING_PLAN.md).

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {
  ViewportContentProperty,
  ViewportScrollProperty,
} from '../../engine/rules/viewport';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** One Scroll View, middle of the screen, showing the long map below. */
const WORLD = JSON.stringify({
  blocks: {
    blocks: [
      {
        type: 'world_world',
        fields: {NAME: 'My World'},
        next: {
          block: {
            type: 'world_add_actor',
            fields: {ACTOR: 'actors/scrollView'},
            inputs: {
              DO: {
                block: {
                  type: 'world_set_position',
                  inputs: {ACTOR: me(), X: number(160), Y: number(160)},
                  next: {
                    block: {
                      type: 'world_set_Viewport_ViewportMapProperty',
                      inputs: {
                        ACTOR: me(),
                        VALUE: {
                          block: {type: 'text', fields: {TEXT: 'maps/long'}},
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

/** Ten rows down a column three windows tall. */
const LONG_MAP = JSON.stringify({
  type: 'map',
  size: {width: 10, height: 20},
  tile: {width: 32, height: 32},
  actors: Array.from({length: 10}, (_, at) => ({
    type: 'actors/label',
    id: `Row${at}`,
    properties: {
      positional: {position: {x: 160, y: 30 + at * 60}},
      Label: {text: `row ${at}`},
    },
  })),
});

const play = async () => {
  const source = importStockActor(
    WORLD_SCENARIOS.empty.source,
    stockActorById('scrollView')!,
  ).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const maps = Object.values(source.folders).find(
    folder => folder.name === 'maps' && folder.parentId === '0',
  );
  const {world} = await compileProject(
    projectFiles({
      ...source,
      files: {
        ...source.files,
        [main.id]: {...main, contents: WORLD},
        longMap: {
          id: 'longMap',
          name: 'long.map',
          language: 'map',
          contents: LONG_MAP,
          folderId: maps?.id ?? '0',
        },
      },
    }),
  );
  world.tick(1 / 60);
  world.tick(1 / 60);

  // The Viewport rule is the ENGINE's own — a foundation rule in play in every
  // world — so its properties come from the engine rather than from a project
  // module (`engine/rules/viewport`).
  const view = [...world.actors].find(
    actor => actor.type === 'actors/scrollView',
  )!;
  const down = (by: number) => {
    // A press, then a move past the drag threshold, is what Gestures calls a
    // drag; each further move is another `is dragged by`.
    world.setPointer({x: 160, y: 160}, ['left']);
    world.tick(1 / 60);
    world.setPointer({x: 160, y: 160 - by}, ['left']);
    world.tick(1 / 60);
    world.setPointer({x: 160, y: 160 - by}, []);
    world.tick(1 / 60);
  };
  return {
    world,
    view,
    at: () => (view.get(ViewportScrollProperty) as {x: number; y: number}).y,
    content: () =>
      (view.get(ViewportContentProperty) as {x: number; y: number}).y,
    down,
    press: (key: string) => {
      world.setInput([key]);
      world.tick(1 / 60);
      world.setInput([]);
      world.tick(1 / 60);
    },
    click: () => {
      world.setPointer({x: 160, y: 160}, ['left']);
      world.tick(1 / 60);
      world.setPointer({x: 160, y: 160}, []);
      world.tick(1 / 60);
    },
  };
};

describe('the Scroll View', () => {
  it('knows how tall what it holds is, and starts at the top', async () => {
    const {at, content} = await play();
    expect(content()).toBe(640);
    expect(at()).toBe(0);
  });

  it('moves the page with the finger', async () => {
    const {at, down} = await play();
    down(50);
    // Dragging UP carries the page up, so the window goes down it.
    expect(at()).toBeGreaterThan(0);
  });

  it('stops at the bottom rather than running off it', async () => {
    const {at, down} = await play();
    for (let pull = 0; pull < 20; pull += 1) {
      down(200);
    }
    // Twenty tiles of map, ten of window: the last place the top can be.
    expect(at()).toBe(640 - 200);
  });

  it('stops at the top, however hard it is pushed back', async () => {
    const {at, down} = await play();
    down(80);
    expect(at()).toBeGreaterThan(0);
    for (let pull = 0; pull < 20; pull += 1) {
      down(-200);
    }
    expect(at()).toBe(0);
  });

  it('answers the arrows once the keyboard is on it', async () => {
    const {at, click, press} = await play();
    // Not before: a Scroll View nobody has focused must not eat the arrows
    // from whatever else is on the screen.
    press('down arrow');
    expect(at()).toBe(0);

    click();
    press('down arrow');
    expect(at()).toBeGreaterThan(0);
  });
});
