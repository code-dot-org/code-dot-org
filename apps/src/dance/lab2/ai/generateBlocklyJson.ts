// AI generated file.

type FieldMap = Record<string, string | number>;

interface Block {
  type: string;
  id: string;
  x?: number;
  y?: number;
  deletable?: boolean;
  movable?: boolean;
  fields?: FieldMap;
  inputs?: Record<string, {block: Block}>;
  next?: {block: Block};
}

interface BlocklyJSON {
  blocks: {
    languageVersion: number;
    blocks: Block[];
  };
}

const palettes: readonly string[] = [
  'rave',
  'electronic',
  'neon',
  'cool',
  'tropical',
  'vintage',
  'space',
  'disco',
  'rainbow',
  'pastel',
  'sunset',
  'ocean',
  'forest',
];

function uidFactory(prefix: string): () => string {
  let i = 0;
  return () => `${prefix}_${++i}`;
}

function randEffectField(): string {
  return '<field name="EFFECT">"rand"</field>';
}

function groupSpritesField(): string {
  return '<field name="GROUP">sprites</field>';
}

function dirLeftRightField(): string {
  // -1 means both or "left/right" depending on block impl; matches your example
  return '<field name="DIR">-1</field>';
}

function paletteField(palette: string): string {
  return `<field name="PALETTE">"${palette}"</field>`;
}

function unitMeasuresField(): string {
  return '<field name="UNIT">"measures"</field>';
}

function makeSetBackgroundBlock(id: string, palette: string): Block {
  return {
    type: 'Dancelab_setBackgroundEffectWithPaletteAI',
    id,
    fields: {
      PALETTE: paletteField(palette),
      EFFECT: randEffectField(),
    },
  };
}

function makeSetForegroundBlock(id: string): Block {
  return {
    type: 'Dancelab_setForegroundEffectExtended',
    id,
    fields: {
      EFFECT: randEffectField(),
    },
  };
}

function makeChangeMoveEachLRBlock(id: string): Block {
  return {
    type: 'Dancelab_changeMoveEachLR',
    id,
    fields: {
      GROUP: groupSpritesField(),
      MOVE: '<field name="MOVE">"rand"</field>',
      DIR: dirLeftRightField(),
    },
  };
}

function chainBlocks(head: Block, ...rest: Block[]): Block {
  let current = head;
  for (const b of rest) {
    current.next = {block: b};
    current = b;
  }
  return head;
}

/**
 * Build Blockly JSON for a simple dance that reacts at given measures.
 * - Creates a CAT sprite at center on setup
 * - Starts background & foreground effects
 * - At each measure, changes background/foreground and starts a new random move
 */
export default function buildDanceBlockly(measures: number[]): BlocklyJSON {
  const makeId = uidFactory('id');

  // Setup: create sprite → change move → start background → start foreground
  const makeSprite: Block = {
    type: 'Dancelab_makeAnonymousDanceSprite',
    id: makeId(),
    fields: {
      COSTUME: '<field name="COSTUME">"CAT"</field>',
      LOCATION: '<field name="LOCATION">{x: 200, y: 200}</field>',
    },
  };

  const initialChangeMove = makeChangeMoveEachLRBlock(makeId());
  const initialBg = makeSetBackgroundBlock(makeId(), palettes[0]);
  const initialFg = makeSetForegroundBlock(makeId());

  const setupDoChain = chainBlocks(
    makeSprite,
    initialChangeMove,
    initialBg,
    initialFg
  );

  const setupBlock: Block = {
    type: 'Dancelab_whenSetup',
    id: 'setup',
    x: 16,
    y: 16,
    deletable: false,
    movable: false,
    inputs: {
      DO: {block: setupDoChain},
    },
  };

  // Event blocks for each measure
  const eventBlocks: Block[] = measures.map((m, idx): Block => {
    const palette = palettes[(idx + 1) % palettes.length]; // rotate, offset from initial
    const bg = makeSetBackgroundBlock(makeId(), palette);
    const fg = makeSetForegroundBlock(makeId());
    const move = makeChangeMoveEachLRBlock(makeId());
    const chain = chainBlocks(bg, fg, move);

    return {
      type: 'Dancelab_atTimestampNotAfter',
      id: makeId(),
      x: 24 + (idx % 2) * 6, // tiny stagger to avoid exact overlap
      y: 200 + idx * 180, // vertical spacing between event stacks
      fields: {
        TIMESTAMP: m,
        UNIT: unitMeasuresField(),
      },
      next: {block: chain},
    };
  });

  const blocks: Block[] = [setupBlock, ...eventBlocks];

  return {
    blocks: {
      languageVersion: 0,
      blocks,
    },
  };
}
