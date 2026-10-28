// The Scroll View, PLAYED: a finger over something taller than the window.
//
// The engine half is pinned without an actor in `engine/scrollsChildren.test`;
// this is the half a learner meets — that dragging moves the page with the finger,
// that it stops at both ends, and that the arrows work once the keyboard is on
// it (specs/SCROLLING_PLAN.md).

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../__tests__/support/compileProject';
import {ContentProperty, ScrollProperty} from '../../engine/rules/scrolling';
import {EMPTY_APP_PROJECT} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

/**
 * One Scroll View, 200 tall, in the middle of the screen, holding ten rows
 * down a column three windows tall: its children, each placed in its frame,
 * which is measured from its middle.
 */
const SCREEN = JSON.stringify({
  type: 'map',
  name: 'Main',
  actors: [
    {
      type: 'actors/scrollView',
      id: 'Page',
      properties: {
        positional: {position: {x: 160, y: 160}},
        hasABox: {width: 280, height: 200},
      },
    },
    ...Array.from({length: 10}, (_, at) => ({
      type: 'actors/label',
      id: `Row${at}`,
      properties: {
        positional: {parent: 'Page', position: {x: 0, y: -70 + at * 60}},
        Label: {text: `row ${at}`},
      },
    })),
  ],
});

const play = async () => {
  const source = importStockActor(
    EMPTY_APP_PROJECT,
    stockActorById('scrollView')!,
  ).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.screen',
  )!;
  const {world} = await compileProject(
    projectFiles({
      ...source,
      files: {...source.files, [main.id]: {...main, contents: SCREEN}},
    }),
  );
  world.tick(1 / 60);
  world.tick(1 / 60);

  // Scrolls Its Children is the ENGINE's own — a foundation rule in play in
  // every world — so its properties come from the engine rather than from a
  // project module (`engine/rules/scrolling`).
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
    at: () => (view.get(ScrollProperty) as {x: number; y: number}).y,
    content: () => (view.get(ContentProperty) as {x: number; y: number}).y,
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
    // The last row's middle is 470 below the top of the window, and half a
    // label's height below that is the bottom of the page.
    expect(content()).toBeGreaterThan(470);
    expect(at()).toBe(0);
  });

  it('moves the page with the finger', async () => {
    const {at, down} = await play();
    down(50);
    // Dragging UP carries the page up, so the window goes down it.
    expect(at()).toBeGreaterThan(0);
  });

  it('stops at the bottom rather than running off it', async () => {
    const {at, content, down} = await play();
    for (let pull = 0; pull < 20; pull += 1) {
      down(200);
    }
    // The page less the window: the last place the top can be.
    expect(at()).toBe(content() - 200);
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
