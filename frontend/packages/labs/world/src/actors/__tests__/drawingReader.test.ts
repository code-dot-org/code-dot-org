// A drawing read out of a file says what the running actor would draw — with
// a placement's overrides written over the actor's own values — and says when
// it met something it could not read.

import {describe, expect, it} from 'vitest';

import type {DrawCommand} from '../../engine/core/drawing';
import {STOCK_RULES} from '../../rules/stock';
import {STOCK_STYLES} from '../../styles/stock';
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

  it('finishes every interface actor that CAN be finished', () => {
    // EVERY KIND, not the four this used to name. Adding a pen block the
    // reader did not know turned the Button's still incomplete, and exactly
    // one assertion noticed — where the symptom is that an interface picture
    // in the map editor falls back to the sandbox's slow path, for however
    // many kinds happened to use the new block (specs/STYLES_PLAN.md).
    for (const id of [
      'label',
      'button',
      'toggle',
      'panel',
      'speechBox',
      'dropdown',
      'slider',
      'progressBar',
      'healthBar',
      'viewport',
    ]) {
      expect(readDrawing(SHELF, `actors/${id}`)?.complete, id).toBe(true);
    }
  });

  it('and says so about the four that cannot be', () => {
    // ASSERTED RATHER THAN LEFT OUT, so that a kind which becomes readable
    // says so here rather than nowhere. Each of these draws from something a
    // still has no way to know: the caret blinks against the clock, and the
    // other three draw a WINDOW onto content — which row is at the top, how
    // far it has scrolled — that only a running world has.
    for (const id of ['textInput', 'textArea', 'list', 'scrollView']) {
      expect(readDrawing(SHELF, `actors/${id}`)?.complete, id).toBe(false);
    }
  });

  /** The shelf, every stock theme, and a world naming one of them. */
  const withTheme = (id: string) => ({
    ...SHELF,
    ...Object.fromEntries(
      STOCK_STYLES.map(one => [`styles/${one.id}.style`, one.contents]),
    ),
    'worlds/my.world': JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_world',
            fields: {NAME: 'My World'},
            next: {
              block: {
                type: 'world_use_theme',
                fields: {THEME: `styles/${id}`},
              },
            },
          },
        ],
      },
    }),
  });

  it('paints the stock kit out of whichever theme the world names', () => {
    // END TO END, through the map editor's own path: the stock Button's own
    // rows, the stock themes, the `use theme` row on a world, and the reader
    // finding it. Nothing here is a fixture — it is the kit a learner gets.
    const face = (id: string) =>
      rectangles(readDrawing(withTheme(id), 'actors/button')!.commands)[0];

    // THE WHOLE CLAIM OF THE PLAN, in one assertion. The Button's drawing is
    // byte-for-byte the same in both readings; what differs is the file the
    // world points at (specs/STYLES_PLAN.md).
    expect(face('modern')).toMatchObject({fill: '#3050a0', radius: 8});
    expect(face('modern').shadow).toBeDefined();
    expect(face('classic')).toMatchObject({fill: '#d4d0c8'});
    expect(face('classic')).not.toHaveProperty('radius');
    expect(face('classic').shadow).toBeUndefined();
    // …and Classic's has the edge Modern's traded for a shadow, which is the
    // pair that tokens alone could not have expressed.
    expect(face('classic').stroke).toBe('#41403c');
    expect(face('modern')).not.toHaveProperty('stroke');
  });

  it('lets a MAP override the world, and a placement override the map', () => {
    // The cascade, through the map editor's own path. Same kind, same
    // drawing, three answers (specs/STYLES_PLAN.md).
    const files = withTheme('modern');
    const fillOf = (drawing: ReturnType<typeof readDrawing>) =>
      (rectangles(drawing!.commands)[0] as {fill?: string}).fill;

    // The world's.
    expect(fillOf(readDrawing(files, 'actors/button'))).toBe('#3050a0');
    // …the map's, which is the argument a caller passes when it has one.
    expect(
      fillOf(
        readDrawing(files, 'actors/button', {}, undefined, 'styles/classic'),
      ),
    ).toBe('#d4d0c8');
    // …and the placement's, which beats both and is read off its overrides.
    expect(
      fillOf(
        readDrawing(
          files,
          'actors/button',
          {hasAStyle: {theme: 'styles/danger'}},
          undefined,
          'styles/classic',
        ),
      ),
      // `danger.style` says one class and extends Modern for the rest.
    ).toBe('#e06c75');
  });

  it('never draws words in the colour of what they sit on', () => {
    // THE BUG THIS EXISTS FOR, found by opening the Interface Kit fixture and
    // seeing nothing on the buttons. A caption went straight to `use style
    // ⟨caption⟩` with no literal under it — and a class that no theme defines
    // leaves the pen ALONE, so in a project with no theme the words inherited
    // whatever the FACE had just set. A Button drew `#3050a0` on `#3050a0`.
    //
    // Every other row in this kit says its own look and then offers to be
    // overruled; the caption was the one that did not (specs/STYLES_PLAN.md).
    //
    // CHECKED WITH NO THEME AND WITH BOTH, because the failure is in exactly
    // the case a theme papers over: with one, the class supplies the fill and
    // the bug is invisible.
    const withNone = SHELF;
    for (const files of [withNone, withTheme('modern'), withTheme('classic')]) {
      for (const kind of [
        'button',
        'panel',
        'toggle',
        'dropdown',
        'label',
        'speechBox',
      ]) {
        const commands = readDrawing(files, `actors/${kind}`)!.commands;
        const face = commands.find(one => one.op === 'rectangle') as
          | {fill?: string}
          | undefined;
        const words = commands.find(one => one.op === 'text') as
          | {fill?: string}
          | undefined;
        if (!face || !words) {
          continue;
        }
        expect(words.fill, `${kind} words on its own face`).not.toBe(face.fill);
      }
    }
  });

  it('draws a Button differently while it is held', () => {
    // THE PRESSED STATE, which is the plainest thing this kit was missing: a
    // Button held down was pixel-identical to one at rest.
    //
    // A CLASS ON TOP OF A CLASS, exercising all three states a style field
    // has: `pressed` names a lifted fill, clears the shadow so a raised
    // button sinks, and says nothing about the corner — which therefore
    // survives from the face (specs/STYLES_PLAN.md).
    const files = withTheme('modern');
    const face = (held: boolean) =>
      rectangles(
        readDrawing(files, 'actors/button', {
          // Keyed as a MAP keys a trait's property: the owning trait's id and
          // the property's (`declarationsOf`).
          Takes_Gestures: {being_pressed: held},
        })!.commands,
      )[0] as {fill?: string; radius?: number; shadow?: unknown};

    // Named: a lifted fill — `accent light`, which on this theme is a
    // shade UP from the face rather than down. Which way it goes is the
    // theme's to choose; Classic's `pressed` goes the other way.
    expect(face(false).fill).toBe('#3050a0');
    expect(face(true).fill).toBe('#4050a0');
    // Cleared: the shadow, so it sinks.
    expect(face(false).shadow).toBeDefined();
    expect(face(true).shadow).toBeUndefined();
    // Left alone: the corner, which the face set and `pressed` never mentions.
    expect(face(true).radius).toBe(face(false).radius);
  });

  it('draws the kit as it always did when no world names a theme', () => {
    // Every project that existed before themes did. `use style` of a name no
    // theme defines leaves the pen alone, so the literals above each row are
    // the picture — which is why they are still in the files.
    const face = rectangles(readDrawing(SHELF, 'actors/button')!.commands)[0];
    expect(face).toMatchObject({fill: '#3050a0', radius: 8});
  });

  it('reads a corner and a shadow as the engine writes them', () => {
    // The reader is a SECOND implementation of the pen: the engine's runs in
    // the game, this one makes the map editor's stills without one. Two
    // implementations that disagree are two pictures, and the editor shows
    // the wrong one — so what this puts in a command has to be what
    // `CommandPen` would have put there.
    const number = (value: number) => ({
      shadow: {type: 'math_number', fields: {NUM: value}},
    });
    const drawing = readDrawing(
      {
        'actors/styled.actor': drawnActor(
          'Styled',
          [
            {type: 'world_pen_corner', inputs: {RADIUS: number(50)}},
            {
              type: 'world_pen_shadow',
              inputs: {
                COLOR: {
                  block: {
                    type: 'world_rgba',
                    inputs: {
                      R: number(0),
                      G: number(0.5),
                      B: number(1),
                      A: number(0.25),
                    },
                  },
                },
                BLUR: number(4),
                DOWN: number(2),
              },
            },
            {
              type: 'world_draw_rectangle',
              inputs: {
                X: number(0),
                Y: number(0),
                WIDTH: number(20),
                HEIGHT: number(10),
              },
            },
          ],
          [20, 10],
        ),
      },
      'actors/styled',
    )!;

    expect(drawing.complete).toBe(true);
    expect(drawing.commands[0]).toMatchObject({
      op: 'rectangle',
      // Clamped to half the box, exactly as `CommandPen.rectangle` clamps it:
      // two corners of half the width each meet in the middle.
      radius: 5,
      // …and the alpha kept, through the engine's own `cssColor`. A shadow is
      // the first thing in the kit that needs one.
      shadow: {color: 'rgba(0, 128, 255, 0.25)', blur: 4, offsetY: 2},
    });
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
