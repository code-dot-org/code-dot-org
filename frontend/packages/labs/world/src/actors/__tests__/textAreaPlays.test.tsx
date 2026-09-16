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
