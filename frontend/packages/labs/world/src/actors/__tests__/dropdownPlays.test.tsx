// The Dropdown, played: a click opens it and grows it, a click on a row
// chooses that row and closes it, a press elsewhere closes it, and it says
// when the choice changed.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {
  type Actor,
  PositionProperty,
  type Property,
  RotationProperty,
} from '../../engine';
import {HeightProperty} from '../../engine/rules/boxed';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const kind = (path: string) => ({
  block: {type: 'world_actor_kind', fields: {ACTOR: path}},
});
const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});
const chain = (rows: object[]) =>
  rows.reduceRight((next, row) => ({...row, next: {block: next}}));

/** A Dropdown at (100, 100) and a Label that hears it choose. */
const project = (): MultiFileSource => {
  let source = WORLD_SCENARIOS.empty.source;
  source = importStockActor(source, stockActorById('dropdown')!).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const world = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Menu'},
          next: {
            block: chain([
              {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/dropdown'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_position',
                      inputs: {ACTOR: me(), X: number(100), Y: number(100)},
                    },
                  },
                },
              },
              {
                type: 'world_add_actor',
                fields: {ACTOR: 'actors/label'},
                inputs: {
                  DO: {
                    block: {
                      type: 'world_set_position',
                      inputs: {ACTOR: me(), X: number(100), Y: number(300)},
                    },
                  },
                },
              },
            ]),
          },
        },
        {
          type: 'world_on_ActorsDropdown_ChosenEvent',
          fields: {SUBJECT: 'actors/dropdown'},
          next: {
            block: {
              type: 'world_set_ActorsLabel_TextProperty',
              inputs: {
                ACTOR: kind('actors/label'),
                VALUE: {block: {type: 'text', fields: {TEXT: 'CHOSEN'}}},
              },
            },
          },
        },
      ],
    },
  });
  return {
    ...source,
    files: {...source.files, [main.id]: {...main, contents: world}},
  };
};

describe('a Dropdown', () => {
  const open = async () => {
    const {world, modules} = await compileProject(projectFiles(project()));
    const actors = [...world.actors] as Actor[];
    const menu = actors.find(actor => actor.type === 'actors/dropdown')!;
    const label = actors.find(actor => actor.type === 'actors/label')!;
    const text = modules['actors/label'].TextProperty as Property<string>;
    // The box is the `Has a Box` trait's, not the Label's — a foundation rule
    // in every world, so it comes from the engine (specs/BOXES_PLAN.md).
    const height = HeightProperty;
    const isOpen = modules['actors/dropdown'].OpenProperty as Property<boolean>;
    // A frame, as the driver plays one: a tick, then the snapshot the
    // driver draws from — which is where a grown menu's size reaches its
    // click box (`World.renderSnapshot` publishes the drawn size).
    const frame = () => {
      world.tick(1 / 60);
      world.renderSnapshot();
    };
    const click = (x: number, y: number) => {
      world.setPointer({x, y}, ['left']);
      frame();
      world.setPointer({x, y}, []);
      frame();
      frame();
    };
    return {
      world,
      menu,
      click,
      says: () => menu.get(text),
      heard: () => label.get(text),
      tall: () => menu.get(height),
      isOpen: () => menu.get(isOpen),
      y: () => menu.get(PositionProperty).y,
      /** Turn it, as the map editor's rotate handle does. */
      turn: (degrees: number) => {
        menu.set(RotationProperty, degrees);
        frame();
      },
    };
  };

  it('opens on a click, growing down to hold its rows', async () => {
    const d = await open();
    expect(d.says()).toBe('ONE');
    expect(d.tall()).toBe(24);
    expect(d.isOpen()).toBe(false);
    d.click(100, 100);
    expect(d.isOpen()).toBe(true);
    // Three rows of 24 below a face of 24, grown about the centre: the box
    // is 96 tall and has moved down by 36, so the face is where it was.
    expect(d.tall()).toBe(96);
    expect(d.y()).toBe(136);
    expect(d.y() - d.tall() / 2).toBe(88);
  }, 60000);

  it('chooses the row a click lands on, and closes', async () => {
    const d = await open();
    d.click(100, 100);
    // The rows start at 112: row 1 is 112–136, row 2 is 136–160.
    d.click(100, 150);
    expect(d.says()).toBe('TWO');
    expect(d.isOpen()).toBe(false);
    expect(d.tall()).toBe(24);
    expect(d.y()).toBe(100);
    d.world.tick(1 / 60);
    expect(d.heard()).toBe('CHOSEN');
  }, 60000);

  it('picks a row by its OWN down when it has been turned', async () => {
    // SAME FAULT, SAME SHAPE, fourth time: the hit test had it, the Slider's
    // drag had it, the List's rows had it, and an open menu picked its row by
    // how far down the SCREEN the click was (`workspace.alongY`).
    //
    // Turned a quarter, the menu's own "down" is the screen's LEFT — a
    // rotation takes local +y to (−sin, cos).
    //
    // The grown box is 120 by 96 about (100, 136), so turned it covers x 52
    // to 148 and y 76 to 196. The point below is inside it either way, and
    // the two readings disagree: 24 to the RIGHT of the middle is 24 UP the
    // menu's own length, which is the FIRST row — while its plain screen `y`
    // of 176 is 64 below the box's top edge, which by the old arithmetic was
    // the third. One click, two answers, and only one of them is what the
    // thing on screen shows.
    const d = await open();
    d.click(100, 100);
    expect(d.isOpen()).toBe(true);
    d.turn(90);

    d.click(124, 176);

    expect(d.says()).toBe('ONE');
    expect(d.isOpen()).toBe(false);
  }, 60000);

  it('chooses with the arrows and Enter once it holds the focus', async () => {
    const d = await open();
    const tap = (key: string) => {
      // The world's own key names (`engine/core/keys`).
      d.world.setInput([key]);
      d.world.tick(1 / 60);
      d.world.setInput([]);
      d.world.tick(1 / 60);
      d.world.renderSnapshot();
      d.world.tick(1 / 60);
    };
    // A click brings the keyboard here and opens the menu.
    d.click(100, 100);
    expect(d.isOpen()).toBe(true);
    tap('down arrow');
    tap('down arrow');
    tap('enter');
    expect(d.says()).toBe('THREE');
    expect(d.isOpen()).toBe(false);
    // Enter again opens; Up walks back; Enter chooses.
    tap('enter');
    expect(d.isOpen()).toBe(true);
    tap('up arrow');
    tap('enter');
    expect(d.says()).toBe('TWO');
  }, 60000);

  it('closes on a press anywhere else, choosing nothing', async () => {
    const d = await open();
    d.click(100, 100);
    expect(d.isOpen()).toBe(true);
    d.click(300, 300);
    expect(d.isOpen()).toBe(false);
    expect(d.says()).toBe('ONE');
    expect(d.y()).toBe(100);
    d.world.tick(1 / 60);
    expect(d.heard()).toBe('Label');
  }, 60000);
});
