// The Text Area, played: typing, a new line on Enter, and a caret that walks
// up and down the lines keeping its column.

import {describe, expect, it} from 'vitest';

import type {MultiFileSource} from '@code-dot-org/core/api';

import {compileProject} from '../../__tests__/support/compileProject';
import {type Actor, type Property} from '../../engine';
import {WORLD_SCENARIOS} from '../../fixtures/scenarios';
import {projectFiles} from '../../runtime/projectFiles';
import {importStockActor} from '../importStockActor';
import {stockActorById} from '../stock';

const me = () => ({block: {type: 'world_this_actor'}});
const number = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});

/** A Text Area at (100, 100). */
const project = (): MultiFileSource => {
  let source = WORLD_SCENARIOS.empty.source;
  source = importStockActor(source, stockActorById('textArea')!).source;
  const main = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const world = JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'Notes'},
          next: {
            block: {
              type: 'world_add_actor',
              fields: {ACTOR: 'actors/textArea'},
              inputs: {
                DO: {
                  block: {
                    type: 'world_set_position',
                    inputs: {ACTOR: me(), X: number(100), Y: number(100)},
                  },
                },
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

describe('a Text Area', () => {
  const open = async () => {
    const {world, modules} = await compileProject(projectFiles(project()));
    const area = ([...world.actors] as Actor[]).find(
      actor => actor.type === 'actors/textArea',
    )!;
    const text = modules['actors/label'].TextProperty as Property<string>;
    const caret = modules['actors/textArea'].CaretProperty as Property<number>;
    const scroll = modules['actors/textArea']
      .ScrollProperty as Property<number>;
    const settle = () => {
      world.tick(1 / 60);
      world.tick(1 / 60);
    };
    return {
      world,
      says: () => area.get(text),
      caret: () => area.get(caret),
      click: () => {
        world.setPointer({x: 100, y: 100}, ['left']);
        settle();
        world.setPointer({x: 100, y: 100}, []);
        settle();
      },
      type: (characters: string) => {
        world.addTyped([...characters]);
        settle();
      },
      scrolled: () => area.get(scroll),
      /** Turn the wheel over it, in pixels. */
      wheel: (by: number) => {
        world.setPointer({x: 100, y: 100}, []);
        world.tick(1 / 60);
        world.scrollWheel(by);
        settle();
      },
      /** Type `n` lines, so there is more paragraph than box. */
      fill: (n: number) => {
        for (let at = 1; at <= n; at++) {
          world.addTyped([...`L${at}`]);
          settle();
          if (at < n) {
            world.setInput(['enter']);
            world.tick(1 / 60);
            world.setInput([]);
            settle();
          }
        }
      },
      tap: (key: string) => {
        // The world's own key names: the driver translates the browser's at
        // the door (`engine/core/keys`).
        world.setInput([key]);
        world.tick(1 / 60);
        world.setInput([]);
        settle();
      },
    };
  };

  describe('the window over the words', () => {
    it('starts at the top and stays there while the words fit', async () => {
      const a = await open();
      a.click();
      a.type('ONE');
      expect(a.scrolled()).toBe(0);
    });

    it('follows the caret DOWN, making its line the bottom-most', async () => {
      // Typing off the foot of the box is the ordinary way to lose the caret,
      // and the window has to come after it (`reveal`).
      const a = await open();
      a.click();
      a.fill(20);

      expect(a.scrolled()).toBeGreaterThan(0);
    });

    it('follows the caret UP, making its line the top-most', async () => {
      const a = await open();
      a.click();
      a.fill(20);
      const atBottom = a.scrolled();

      // All the way back up, a line at a time.
      for (let at = 0; at < 25; at++) {
        a.tap('up arrow');
      }

      expect(a.scrolled()).toBeLessThan(atBottom);
      expect(a.scrolled()).toBe(0);
    });

    it('does not move for a caret already in view', async () => {
      const a = await open();
      a.click();
      a.fill(20);
      const before = a.scrolled();

      // One line up is still on the screen, so nothing should shift.
      a.tap('up arrow');

      expect(a.scrolled()).toBe(before);
    });

    it('scrolls with the wheel, without moving the bar', async () => {
      // Looking somewhere other than where you are typing, which is the one
      // thing the caret's own following cannot give you.
      const a = await open();
      a.click();
      a.fill(20);
      const wasAt = a.scrolled();
      const caretWas = a.caret();
      expect(wasAt).toBeGreaterThan(40);

      a.wheel(-40);

      expect(a.scrolled()).toBe(wasAt - 40);
      expect(a.caret()).toBe(caretWas);
    });

    it('will not scroll past either end', async () => {
      const a = await open();
      a.click();
      a.fill(20);

      a.wheel(-5000);
      expect(a.scrolled()).toBe(0);

      a.wheel(5000);
      // At the foot: the last line is showing and no further.
      const atEnd = a.scrolled();
      a.wheel(5000);
      expect(a.scrolled()).toBe(atEnd);
    });
  });

  it('takes typing, and Enter starts a new line', async () => {
    const a = await open();
    a.click();
    a.type('HI');
    a.tap('enter');
    a.type('YO');
    expect(a.says()).toBe('HI\nYO');
    expect(a.caret()).toBe(5);
  }, 60000);

  it('walks the caret up and down, keeping its column where it can', async () => {
    const a = await open();
    a.click();
    a.type('ABCD');
    a.tap('enter');
    a.type('XY');
    // Caret after Y: line 2, column 2. Up: same column on ABCD.
    a.tap('up arrow');
    expect(a.caret()).toBe(2);
    // Down: back to column 2 of XY, which is its end.
    a.tap('down arrow');
    expect(a.caret()).toBe(7);
    // Right to the end of ABCD, then down: XY has room for two, not four.
    a.tap('up arrow');
    a.tap('right arrow');
    a.tap('right arrow');
    expect(a.caret()).toBe(4);
    a.tap('down arrow');
    expect(a.caret()).toBe(7);
    // Up from the first line goes nowhere.
    a.tap('up arrow');
    a.tap('up arrow');
    expect(a.caret()).toBe(2);
  }, 60000);

  it('joins two lines when backspace takes the newline', async () => {
    const a = await open();
    a.click();
    a.type('AB');
    a.tap('enter');
    a.tap('backspace');
    a.type('C');
    expect(a.says()).toBe('ABC');
    expect(a.caret()).toBe(3);
  }, 60000);
});
