// AI generated file.

import {
  BlockDefinition,
  JsonBlockConfig,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';

import getBlockOptions from './getBlockOptions';

const DANCELAB_PREFIX = 'Dancelab_';
const GENERATED_PREFIX = 'GeneratedDancers_';

// Try to find a block definition by type string.
// We don't rely on the exact shape of BlockDefinition; cover common keys.
function hasBlockType(defs: BlockDefinition[], name: string): boolean {
  return defs.some(d => d.name === name);
}

// Given a block type (without block prefix), get the preferred, defined type.
// Prefers blocks from the GeneratedDancers pool over the standard Dancelab pool.
// Block pools may vary by level, but all Dance level use the Dancelab pool.
function getPreferredBlockType(
  defs: BlockDefinition[],
  blockType: string
): string {
  return hasBlockType(defs, GENERATED_PREFIX + blockType)
    ? GENERATED_PREFIX + blockType
    : DANCELAB_PREFIX + blockType;
}

const MAKE_SPRITE = 'makeAnonymousDanceSprite';
const CHANGE_MOVE = 'changeMoveEachLR';
const SET_BACKGROUND = 'setBackgroundEffectWithPalette';
const SET_FOREGROUND = 'setForegroundEffectExtended';

function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomField(name: string, options: string[]): string {
  return `<field name="${name}">${randomElement(options)}</field>`;
}

function groupSpritesField(): string {
  return '<field name="GROUP">sprites</field>';
}

function dirLeftRightField(value: -1 | 1): string {
  return `<field name="DIR">${value}</field>`;
}

function unitMeasuresField(): string {
  return '<field name="UNIT">"measures"</field>';
}

function makeSetBackgroundBlock(
  type: string,
  effects: string[],
  palettes: string[]
): JsonBlockConfig {
  return {
    type,
    fields: {
      PALETTE: randomField('PALETTE', palettes),
      EFFECT: randomField('EFFECT', effects),
    },
  };
}

function makeSetForegroundBlock(
  type: string,
  effects: string[]
): JsonBlockConfig {
  return {
    type,
    fields: {
      EFFECT: randomField('EFFECT', effects),
    },
  };
}

function makeChangeMoveEachLRBlock(
  type: string,
  moves: string[]
): JsonBlockConfig {
  return {
    type,
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
  const changeMoveBlockType = getPreferredBlockType(
    blockDefinitions,
    CHANGE_MOVE
  );
  const setBackgroundBlockType = getPreferredBlockType(
    blockDefinitions,
    SET_BACKGROUND
  );
  const setForegroundBlockType = getPreferredBlockType(
    blockDefinitions,
    SET_FOREGROUND
  );
  const makeSpriteBlockType = getPreferredBlockType(
    blockDefinitions,
    MAKE_SPRITE
  );

  const validMoves = getBlockOptions(
    blockDefinitions,
    changeMoveBlockType,
    'MOVE'
  ).filter(option => !['"next"', '"prev"', '"rand"'].includes(option));

  const validBackgrounds = getBlockOptions(
    blockDefinitions,
    setBackgroundBlockType,
    'EFFECT'
  ).filter(option => !['"none"', '"rand"'].includes(option));

  const validForegrounds = getBlockOptions(
    blockDefinitions,
    setForegroundBlockType,
    'EFFECT'
  ).filter(option => !['"none"', '"rand"'].includes(option));

  const validPalettes = getBlockOptions(
    blockDefinitions,
    setBackgroundBlockType,
    'PALETTE'
  );

  // Setup: create sprite → change move → start background → start foreground
  const makeSprite: JsonBlockConfig = {
    type: makeSpriteBlockType,
    fields: {
      COSTUME: '<field name="COSTUME">"CAT"</field>',
      LOCATION: '<field name="LOCATION">{x: 200, y: 200}</field>',
    },
  };

  const initialChangeMove = makeChangeMoveEachLRBlock(
    changeMoveBlockType,
    validMoves
  );
  const initialBg = makeSetBackgroundBlock(
    setBackgroundBlockType,
    validBackgrounds,
    validPalettes
  );
  const initialFg = makeSetForegroundBlock(
    setForegroundBlockType,
    validForegrounds
  );

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
        setBackgroundBlockType,
        validBackgrounds,
        validPalettes
      );
      const fg = makeSetForegroundBlock(
        setForegroundBlockType,
        validForegrounds
      );
      const move = makeChangeMoveEachLRBlock(changeMoveBlockType, validMoves);
      const chain = chainBlocks(bg, fg, move);

      return {
        type: 'Dancelab_atTimestampNotAfter',
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
