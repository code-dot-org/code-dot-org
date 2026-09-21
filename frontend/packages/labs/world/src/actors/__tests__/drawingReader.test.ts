// A drawing read out of a file says what the running actor would draw — with
// a placement's overrides written over the actor's own values — and says when
// it met something it could not read.

import {describe, expect, it} from 'vitest';

import type {DrawCommand} from '../../engine/core/drawing';
import {STOCK_RULES} from '../../rules/stock';
import {
  ancestry,
  declarationsOf,
  declaresDrawing,
  readDrawing,
  type Files,
  type Node,
} from '../preview/drawingReader';
import {STOCK_ACTORS} from '../stock';

/** The shelf as a project, which is how every interface actor arrives. */
const SHELF: Files = Object.fromEntries([
  ...STOCK_ACTORS.map(actor => [`actors/${actor.id}.actor`, actor.contents]),
  ...STOCK_RULES.map(rule => [`rules/${rule.id}.rule`, rule.contents]),
]);

const chain = (rows: Node[]): Node =>
  rows.reduceRight((next, row) => ({...row, next: {block: next}}));

/** An actor file holding one `define drawing` over these rows. */
const drawnActor = (
  name: string,
  rows: Node[],
  size: [number, number] = [32, 32],
  more: Node[] = [],
): string =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_actor',
          fields: {NAME: name},
          next: {
            block: chain([
              ...more,
              {
                type: 'world_define_drawing',
                inputs: {
                  WIDTH: {block: {type: 'math_number', fields: {NUM: size[0]}}},
                  HEIGHT: {
                    block: {type: 'math_number', fields: {NUM: size[1]}},
                  },
                  DO: {block: chain(rows)},
                },
              },
            ]),
          },
        },
      ],
    },
  });

const num = (value: number) => ({
  block: {type: 'math_number', fields: {NUM: value}},
});
const bool = (value: boolean) => ({
  block: {type: 'logic_boolean', fields: {BOOL: value ? 'TRUE' : 'FALSE'}},
});

const rectangles = (commands: readonly DrawCommand[]) =>
  commands.filter(
    (command): command is DrawCommand & {op: 'rectangle'} =>
      command.op === 'rectangle',
  );
const text = (commands: readonly DrawCommand[]) =>
  commands.find(
    (command): command is DrawCommand & {op: 'text'} => command.op === 'text',
  )!;

describe('readDrawing, over the shelf', () => {
  it('draws a Label with the words its placement gives it', () => {
    const drawing = readDrawing(SHELF, 'actors/label', {
      Label: {text: 'WHAT IS YOUR NAME?'},
    })!;
    expect(text(drawing.commands).text).toBe('WHAT IS YOUR NAME?');
    expect(drawing.complete).toBe(true);
  });

  it('is as wide as its placement made it, box and all', () => {
    const label = readDrawing(SHELF, 'actors/label', {hasABox: {width: 200}})!;
    expect(label.width).toBe(200);
    // A Button draws its box from the same width.
    const button = readDrawing(SHELF, 'actors/button', {
      hasABox: {width: 200},
    })!;
    expect(button.width).toBe(200);
    expect(rectangles(button.commands).some(box => box.width === 200)).toBe(
      true,
    );
  });

  it('finds an inherited property under the kind that declared it', () => {
    // A Button's `text` is the Label's, which is how a map keys it.
    const drawing = readDrawing(SHELF, 'actors/button', {
      Label: {text: 'SAY HELLO'},
    })!;
    expect(text(drawing.commands).text).toBe('SAY HELLO');
  });

  it('empties a bar told its fraction is nothing', () => {
    const full = readDrawing(SHELF, 'actors/progressBar')!;
    const empty = readDrawing(SHELF, 'actors/progressBar', {
      Progress_Bar: {fraction: 0},
    })!;
    expect(rectangles(full.commands)[1].width).toBeGreaterThan(0);
    expect(rectangles(empty.commands)[1].width).toBe(0);
  });

  it('ignores an override for an owner it has no declaration for', () => {
    // A map's `positional.position` rides along with every placement.
    const drawing = readDrawing(SHELF, 'actors/label', {
      positional: {position: {x: 1, y: 2}},
      Nobody: {text: 'no'},
    })!;
    expect(text(drawing.commands).text).toBe('Label');
  });

  it('finishes every interface actor but the one that blinks', () => {
    for (const id of ['label', 'button', 'progressBar', 'healthBar']) {
      expect(readDrawing(SHELF, `actors/${id}`)?.complete, id).toBe(true);
    }
    // The Text Input's caret reads the time, which a still cannot know.
    expect(readDrawing(SHELF, 'actors/textInput')?.complete).toBe(false);
  });

  it('has nothing for an actor that wears a picture', () => {
    expect(readDrawing(SHELF, 'actors/coin')).toBeUndefined();
    expect(declaresDrawing(SHELF, 'actors/coin')).toBe(false);
    expect(declaresDrawing(SHELF, 'actors/healthBar')).toBe(true);
  });

  it('walks acts-like by module path', () => {
    expect(ancestry(SHELF, 'actors/healthBar')).toEqual([
      'actors/healthBar',
      'actors/progressBar',
    ]);
  });

  it('keys every declaration both ways', () => {
    const {defaults, blockKeyOf} = declarationsOf(SHELF);
    expect(blockKeyOf.get('Label.text')).toBe('ActorsLabel_TextProperty');
    expect(defaults.get('ActorsLabel_TextProperty')?.type).toBe('string');
    expect(blockKeyOf.get('Progress_Bar.fraction')).toBe(
      'ActorsProgressBar_FractionProperty',
    );
  });
});

describe('readDrawing, the vocabulary', () => {
  it('reads a circle, a line, an image and a lifted pen', () => {
    const files: Files = {
      'actors/badge.actor': drawnActor('Badge', [
        {
          type: 'world_pen_fill',
          inputs: {
            COLOR: {
              block: {type: 'colour_picker', fields: {COLOUR: '#ff0000'}},
            },
          },
        },
        {
          type: 'world_draw_circle',
          inputs: {X: num(16), Y: num(16), RADIUS: num(8)},
        },
        {type: 'world_pen_no_fill'},
        {
          type: 'world_pen_outline',
          inputs: {
            COLOR: {
              block: {type: 'colour_picker', fields: {COLOUR: '#00ff00'}},
            },
            WIDTH: num(2),
          },
        },
        {
          type: 'world_draw_line',
          inputs: {X1: num(0), Y1: num(0), X2: num(32), Y2: num(32)},
        },
        {
          type: 'world_draw_image',
          fields: {SPRITE: 'coin'},
          inputs: {X: num(4), Y: num(4)},
        },
      ]),
    };
    const drawing = readDrawing(files, 'actors/badge')!;
    expect(drawing.commands).toEqual([
      {op: 'circle', x: 16, y: 16, radius: 8, fill: '#ff0000', strokeWidth: 1},
      {
        op: 'line',
        x1: 0,
        y1: 0,
        x2: 32,
        y2: 32,
        stroke: '#00ff00',
        strokeWidth: 2,
      },
      {op: 'image', sprite: 'coin', x: 4, y: 4},
    ]);
    expect(drawing.complete).toBe(true);
  });

  it('takes the branch an `if` chooses, and the else when none is', () => {
    const files: Files = {
      'actors/lamp.actor': drawnActor('Lamp', [
        {
          type: 'controls_if',
          inputs: {
            IF0: bool(false),
            DO0: {
              block: {
                type: 'world_draw_circle',
                inputs: {X: num(0), Y: num(0), RADIUS: num(1)},
              },
            },
            IF1: bool(true),
            DO1: {
              block: {
                type: 'world_draw_circle',
                inputs: {X: num(0), Y: num(0), RADIUS: num(2)},
              },
            },
            ELSE: {
              block: {
                type: 'world_draw_circle',
                inputs: {X: num(0), Y: num(0), RADIUS: num(3)},
              },
            },
          },
        },
      ]),
    };
    const drawing = readDrawing(files, 'actors/lamp')!;
    expect(
      drawing.commands.map(command => (command as {radius: number}).radius),
    ).toEqual([2]);
    expect(drawing.complete).toBe(true);
  });

  it('says so when it meets a block it does not know', () => {
    const files: Files = {
      'actors/odd.actor': drawnActor('Odd', [
        {type: 'world_draw_hexagon', inputs: {X: num(0)}},
        {
          type: 'world_draw_circle',
          inputs: {X: num(0), Y: num(0), RADIUS: num(5)},
        },
      ]),
    };
    const drawing = readDrawing(files, 'actors/odd')!;
    expect(drawing.commands).toHaveLength(1);
    expect(drawing.complete).toBe(false);
  });

  it('draws the start of time, and says the picture moves', () => {
    const files: Files = {
      'actors/blink.actor': drawnActor('Blink', [
        {
          type: 'world_draw_circle',
          inputs: {
            X: num(0),
            Y: num(0),
            RADIUS: {
              block: {
                type: 'math_arithmetic',
                fields: {OP: 'ADD'},
                inputs: {A: {block: {type: 'world_time'}}, B: num(4)},
              },
            },
          },
        },
      ]),
    };
    const drawing = readDrawing(files, 'actors/blink')!;
    expect((drawing.commands[0] as {radius: number}).radius).toBe(4);
    expect(drawing.complete).toBe(false);
  });

  it('measures text when given a ruler, and cannot without one', () => {
    const files: Files = {
      'actors/ruler.actor': drawnActor('Ruler', [
        {
          type: 'world_draw_line',
          inputs: {
            X1: num(0),
            Y1: num(0),
            X2: {
              block: {
                type: 'world_text_width',
                inputs: {
                  TEXT: {block: {type: 'text', fields: {TEXT: 'abc'}}},
                  SIZE: num(10),
                },
              },
            },
            Y2: num(0),
          },
        },
      ]),
    };
    const measured = readDrawing(files, 'actors/ruler', {}, (t, size) => {
      return t.length * size;
    })!;
    expect((measured.commands[0] as {x2: number}).x2).toBe(30);
    expect(measured.complete).toBe(true);
    const blind = readDrawing(files, 'actors/ruler')!;
    expect(blind.complete).toBe(false);
  });
});
