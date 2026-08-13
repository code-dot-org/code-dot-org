// The blocks a drawing is written in (specs/DRAWING.md).
//
// Two things are pinned here and they are not the same thing. One is what the
// blocks GENERATE — `pen.…`, in an `.actor` file, inside a closure that binds
// it. The other is where they are OFFERED, which is the whole of what keeps a
// drawing an actor's: `define drawing` is a root with no home outside `.actor`,
// and the pen it needs goes with it.

import {describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {buildDomainPalette, ROOT_BLOCK_TYPES} from '../domainBlocks';
import {ROOT_HOMES} from '../fileKind';
import {standInBlocks} from '../standInBlocks';

type Generated = {
  type: string;
  generator?: {
    javascript: (block: unknown, generator: unknown, env: unknown) => unknown;
  };
};

const palette = (fileKind?: 'actor' | 'world' | 'rule' | 'behavior') =>
  buildDomainPalette([], fileKind ? {fileKind} : {});

const blockNamed = (type: string): Generated =>
  palette().blocks.find(block => block.type === type) as Generated;

/** Generate one block's code, with every socket answering `values`. */
const codeFor = (
  type: string,
  {
    fields = {} as Record<string, string>,
    values = {} as Record<string, string>,
    body = '',
  } = {},
) =>
  String(
    blockNamed(type).generator!.javascript(
      {
        getFieldValue: (name: string) => fields[name] ?? null,
        getParent: () => null,
        getNextBlock: () => null,
      },
      {
        valueToCode: (_block: unknown, name: string) => values[name] ?? '',
        statementToCode: () => body,
        definitions_: {},
      },
      {},
    ),
  );

describe('define drawing', () => {
  it('binds the pen, and shadows the module’s actor as a step does', () => {
    // `this actor` compiles to `actor` wherever it is written, so a routine
    // reading its own state means this one — the same bargain `each frame`
    // makes in the same file (ActorBuilder.defineStep).
    const code = codeFor('world_define_drawing', {
      fields: {WIDTH: '64', HEIGHT: '16'},
      body: 'pen.rectangle(0, 0, 8, 8);\n',
    });

    expect(code).toBe(
      'actor.defineDrawing(64, 16, (actor, pen) => {\n' +
        'pen.rectangle(0, 0, 8, 8);\n});\n',
    );
  });

  it('is a root, so the orphan plugin cannot grey it out', () => {
    // The bug `each frame` hit: `DisableOrphansPlugin` disables a top-level
    // block that has a previous connection, and everything chained after it.
    const block = blockNamed('world_define_drawing') as {
      previousStatement?: boolean;
    };

    expect(ROOT_BLOCK_TYPES.has('world_define_drawing')).toBe(true);
    expect(block.previousStatement).toBeUndefined();
  });

  it('lives in an `.actor` file and nowhere else', () => {
    // A drawing belongs to a KIND of actor. Not a rule or a behavior: those are
    // shared mechanics, and how a particular actor looks is the one thing that
    // is not shared.
    expect([...(ROOT_HOMES.get('world_define_drawing') ?? [])]).toEqual([
      'actor',
    ]);
  });
});

describe('the pen', () => {
  it('sets and unsets each half of the paint', () => {
    expect(codeFor('world_pen_fill', {values: {COLOUR: "'#ff0000'"}})).toBe(
      "pen.fill('#ff0000');\n",
    );
    expect(
      codeFor('world_pen_outline', {
        values: {COLOUR: "'#00ff00'", WIDTH: '2'},
      }),
    ).toBe("pen.outline('#00ff00', 2);\n");
    expect(codeFor('world_pen_no_fill')).toBe('pen.noFill();\n');
    expect(codeFor('world_pen_no_outline')).toBe('pen.noOutline();\n');
  });

  it('says nothing at all when its colour socket is empty', () => {
    // Rather than `pen.fill(undefined)`, which would paint with whatever the
    // driver made of that.
    expect(codeFor('world_pen_fill')).toBe('');
  });
});

describe('the five things there are to draw', () => {
  it('draws shapes in the canvas’s own pixels', () => {
    expect(
      codeFor('world_draw_rectangle', {
        values: {X: '1', Y: '2', WIDTH: '3', HEIGHT: '4'},
      }),
    ).toBe('pen.rectangle(1, 2, 3, 4);\n');
    expect(
      codeFor('world_draw_circle', {values: {X: '4', Y: '4', RADIUS: '2'}}),
    ).toBe('pen.circle(4, 4, 2);\n');
    expect(
      codeFor('world_draw_line', {
        values: {X1: '0', Y1: '0', X2: '8', Y2: '8'},
      }),
    ).toBe('pen.line(0, 0, 8, 8);\n');
  });

  it('coerces text, because the commonest thing to draw is a number', () => {
    // A score, a countdown. The socket takes any value and the command list is
    // a list of strings, so two equal scores hash the same and nothing is
    // rasterized twice.
    expect(
      codeFor('world_draw_text', {
        fields: {ANCHOR: 'bottom right'},
        values: {TEXT: 'score', X: '10', Y: '5', SIZE: '12'},
      }),
    ).toBe('pen.text(String(score), 10, 5, 12, "bottom right");\n');
  });

  it('resolves a spritesheet cell where the `.sheet` files are known', () => {
    // The engine is only ever told rectangles, which is the same thing
    // `set sprite` means by a cell (blockly/spriteCells).
    expect(
      codeFor('world_draw_image', {
        fields: {SPRITE: 'coin.png'},
        values: {X: '0', Y: '0'},
      }),
    ).toBe('pen.image("coin.png", 0, 0);\n');
    expect(
      codeFor('world_draw_image', {
        fields: {SPRITE: 'gone.png'},
        values: {X: '0', Y: '0'},
      }),
    ).not.toContain('undefined');
  });
});

describe('the Drawing category', () => {
  it('is shown in an `.actor` file', () => {
    const names = (palette('actor').toolbox as Array<{name?: string}>).map(
      category => category.name,
    );

    expect(names).toContain('Drawing');
  });

  it('is not shown anywhere else, pen and all', () => {
    // Filtering by `ROOT_HOMES` alone would drop `define drawing` and leave the
    // pen behind — ten blocks in a `.world` file that could only ever wear a
    // warning saying there is nothing to draw on.
    for (const kind of ['world', 'rule', 'behavior'] as const) {
      const categories = palette(kind).toolbox as Array<{
        name?: string;
        blocks?: unknown[];
      }>;
      expect(categories.map(category => category.name)).not.toContain(
        'Drawing',
      );
      expect(
        categories.flatMap(category => category.blocks ?? []),
      ).not.toContain('world_pen_fill');
    }
  });
});

describe('a colour socket', () => {
  it('is not stood in for, so a swatch does not generate `null`', () => {
    // A REGRESSION, and one nothing caught for a long time because no fixture
    // held a swatch. `colour_picker` comes from `@blockly/field-colour` and
    // used to be registered only as a side effect of the field plugin
    // initializing — which happens when the Driver registers a workspace's
    // blocks, and therefore after `standInBlocks` asks what is registered.
    //
    // A type nothing defines gets a stand-in whose generator returns `null`, so
    // every swatch in every project file generated the literal `null`: `set
    // background color`, an effect's color parameter, and `set fill` all
    // quietly drew nothing at all.
    const {blocks} = palette();
    const known = new Set(blocks.map(block => block.type));
    const file = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_pen_fill',
            inputs: {
              COLOUR: {
                shadow: {type: 'colour_picker', fields: {COLOUR: '#3050a0'}},
              },
            },
          },
        ],
      },
    });

    expect('colour_picker' in Blockly.Blocks).toBe(true);
    expect(standInBlocks([file], known)).toEqual([]);
  });
});
