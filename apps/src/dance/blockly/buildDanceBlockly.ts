// AI generated file.

import {
  BlockDefinition,
  JsonBlockConfig,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';

import getBlockOptions from './getBlockOptions';

const SET_BACKGROUND = 'Dancelab_setBackgroundEffectWithPaletteAI';
const SET_FOREGROUND = 'Dancelab_setForegroundEffectExtended';
const CHANGE_MOVE = 'Dancelab_changeMoveEachLR';

function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function uidFactory(prefix: string): () => string {
  let i = 0;
  return () => `${prefix}_${++i}`;
}

function randomField(name: string, options: string[]): string {
  return `<field name="${name}">${randomElement(options)}</field>`;
}

function groupSpritesField(): string {
  return '<field name="GROUP">sprites</field>';
}

function dirLeftRightField(value: -1 | 1): string {
  // -1 means both or "left/right" depending on block impl; matches your example
  return `<field name="DIR">${value}</field>`;
}

function unitMeasuresField(): string {
  return '<field name="UNIT">"measures"</field>';
}

function makeSetBackgroundBlock(
  id: string,
  effects: string[],
  palettes: string[]
): JsonBlockConfig {
  return {
    type: SET_BACKGROUND,
    id,
    fields: {
      PALETTE: randomField('PALETTE', palettes),
      EFFECT: randomField('EFFECT', effects),
    },
  };
}

function makeSetForegroundBlock(
  id: string,
  effects: string[]
): JsonBlockConfig {
  return {
    type: SET_FOREGROUND,
    id,
    fields: {
      EFFECT: randomField('EFFECT', effects),
    },
  };
}

function makeChangeMoveEachLRBlock(
  id: string,
  moves: string[]
): JsonBlockConfig {
  return {
    type: CHANGE_MOVE,
    id,
    fields: {
      GROUP: groupSpritesField(),
      MOVE: randomField('MOVE', moves),
      DIR: dirLeftRightField(randomElement([-1, 1])),
    },
  };
}

function chainBlocks(
  head: JsonBlockConfig,
  ...rest: JsonBlockConfig[]
): JsonBlockConfig {
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
export default function buildDanceBlockly(
  measures: number[],
  blockDefinitions: BlockDefinition[]
): WorkspaceSerialization {
  const makeId = uidFactory('id');

  const validMoves = getBlockOptions(
    blockDefinitions,
    CHANGE_MOVE,
    'MOVE'
  ).filter(option => !['"next"', '"prev"', '"rand"'].includes(option));

  const validBackgrounds = getBlockOptions(
    blockDefinitions,
    SET_BACKGROUND,
    'EFFECT'
  ).filter(option => !['"none"', '"rand"'].includes(option));

  const validForegrounds = getBlockOptions(
    blockDefinitions,
    SET_FOREGROUND,
    'EFFECT'
  ).filter(option => !['"none"', '"rand"'].includes(option));

  const validPalettes = getBlockOptions(
    blockDefinitions,
    SET_BACKGROUND,
    'PALETTE'
  );

  // Setup: create sprite → change move → start background → start foreground
  const makeSprite: JsonBlockConfig = {
    type: 'Dancelab_makeAnonymousDanceSprite',
    id: makeId(),
    fields: {
      COSTUME: '<field name="COSTUME">"CAT"</field>',
      LOCATION: '<field name="LOCATION">{x: 200, y: 200}</field>',
    },
  };

  const initialChangeMove = makeChangeMoveEachLRBlock(makeId(), validMoves);
  const initialBg = makeSetBackgroundBlock(
    makeId(),
    validBackgrounds,
    validPalettes
  );
  const initialFg = makeSetForegroundBlock(makeId(), validForegrounds);

  const setupDoChain = chainBlocks(
    makeSprite,
    initialChangeMove,
    initialBg,
    initialFg
  );

  const setupBlock: JsonBlockConfig = {
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
  const eventBlocks: JsonBlockConfig[] = measures.map(
    (m, idx): JsonBlockConfig => {
      const bg = makeSetBackgroundBlock(
        makeId(),
        validBackgrounds,
        validPalettes
      );
      const fg = makeSetForegroundBlock(makeId(), validForegrounds);
      const move = makeChangeMoveEachLRBlock(makeId(), validMoves);
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
    }
  );

  const blocks: JsonBlockConfig[] = [setupBlock, ...eventBlocks];

  return {
    blocks: {
      blocks,
    },
  };
}
