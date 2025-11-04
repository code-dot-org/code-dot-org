/**
 * Build Blockly JSON for a dance level based on measures and complexity.
 * Returns both workspace serialization and flyout toolbox definition.
 * Prioritizes similiarly named blocks from GeneratedDancers over Dancelab.
 * Creates different block structures based on code complexity.
 * Default block field values and configuration are based on prompt options.
 * Code Complexity determines overall block structure, as well as available field options.
 * Toolbox blocks are dynamically synced to generated blocks with each prompt.
 */

import * as GoogleBlockly from 'blockly/core';

import {
  BlockDefinition,
  JsonBlockConfig,
  WorkspaceSerialization,
} from '@cdo/apps/blockly/types';

import getBlockOptions from './getBlockOptions';

type BlockState = GoogleBlockly.serialization.blocks.State & {
  kind: 'block';
};
type BlockStateFlyout = GoogleBlockly.utils.toolbox.BlockInfo;

const DANCELAB_PREFIX = 'Dancelab_';
const GENERATED_PREFIX = 'GeneratedDancers_';

type CachedDefs = {
  types: {
    changeMove: string;
    setBackground: string;
    setForeground: string;
    makeSprite: string;
    makeNewDanceSpriteGroup: string;
    atTimestampNotAfter: string;
  };
  options: {
    [blockType: string]: {
      [field: string]: string[];
    };
  };
  flyoutOrder: string[];
};

const defsCache = new Map<string, CachedDefs>();

function defsKey(defs: BlockDefinition[]): string {
  // If BlockDefinition has a stable unique id, prefer that; name is fine if unique.
  return defs
    .map(d => d.name)
    .sort()
    .join('|');
}

function cachedGetBlockOptions(
  cache: CachedDefs,
  defs: BlockDefinition[],
  blockType: string,
  field: string
): string[] {
  cache.options[blockType] ??= {};
  if (!cache.options[blockType][field]) {
    cache.options[blockType][field] = getBlockOptions(defs, blockType, field);
  }
  return cache.options[blockType][field];
}

function buildDefsCache(defs: BlockDefinition[]): CachedDefs {
  const changeMove = getPreferredBlockType(defs, CHANGE_MOVE);
  const setBackground = getPreferredBlockType(defs, SET_BACKGROUND);
  const setForeground = getPreferredBlockType(defs, SET_FOREGROUND);
  const makeSprite = getPreferredBlockType(defs, MAKE_SPRITE);
  const makeNewDanceSpriteGroup = getPreferredBlockType(
    defs,
    MAKE_NEW_DANCE_SPRITE_GROUP
  );
  const atTimestampNotAfter = getPreferredBlockType(
    defs,
    AT_TIMESTAMP_NOT_AFTER
  );

  // This ensures the blocks appear in the expected order in the flyout.
  // World blocks -> sprite blocks -> action blocks -> event blocks
  const flyoutOrder = [
    setBackground,
    setForeground,
    makeSprite,
    makeNewDanceSpriteGroup,
    changeMove,
    atTimestampNotAfter,
  ];

  return {
    types: {
      changeMove,
      setBackground,
      setForeground,
      makeSprite,
      makeNewDanceSpriteGroup,
      atTimestampNotAfter,
    },
    options: {},
    flyoutOrder,
  };
}

function getDefsCache(defs: BlockDefinition[]): CachedDefs {
  const key = defsKey(defs);
  let cached = defsCache.get(key);
  if (!cached) {
    cached = buildDefsCache(defs);
    defsCache.set(key, cached);
  }
  return cached;
}

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
const MAKE_NEW_DANCE_SPRITE_GROUP = 'makeNewDanceSpriteGroup';
const AT_TIMESTAMP_NOT_AFTER = 'atTimestampNotAfter';

function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Create a field XML string with random option from options array.
// Restricts the field options to those provided if simpleCode is true.
function randomField(
  name: string,
  options: string[],
  simpleCode?: boolean,
  excludedOption?: string | null
): string {
  const escapedOptions = options.map(option => option.replace(/"/g, '&quot;'));
  const configValue = simpleCode ? `${escapedOptions.join(',')}` : '';
  const configAttribute = simpleCode ? `config="${configValue}"` : '';
  return `<field name="${name}" ${configAttribute}>${randomElement(
    options.filter(option => option !== excludedOption)
  )}</field>`;
}

// Create a field XML string with given option and optional options array.
// Restricts the field options to those provided if simpleCode is true.
function field(
  name: string,
  option: string,
  options?: string[],
  simpleCode?: boolean
): string {
  const escapedOptions = options?.map(opt => opt.replace(/"/g, '&quot;'));
  const configValue = simpleCode ? `${escapedOptions?.join(',')}` : '';
  const configAttribute = simpleCode ? `config="${configValue}"` : '';
  return `<field name="${name}" ${configAttribute}>${option}</field>`;
}

// Create a GROUP field XML string. Value is determined by backgroundDancers or
// an optional defaultFieldValue. Options are restricted if simpleCode is true.
function groupSpritesField(
  backgroundDancers: string,
  simpleCode: boolean,
  defaultFieldValue?: string
): string {
  // The config value determines the selectable options in the dropdown.
  // If there are no background dancers, the only option is the generated dancer.
  // If there are background dancers, the options are (all) sprites, the generated dancer and the background dancers.
  const configValue =
    backgroundDancers === 'nobody'
      ? '&quot;GENERATED_DANCER&quot;'
      : `sprites,&quot;GENERATED_DANCER&quot;,&quot;${backgroundDancers.toUpperCase()}&quot;`;
  const configAttribute = simpleCode ? `config="${configValue}"` : '';
  // The field value determines the default selected option in the dropdown.
  // Choose based on background dancers unless a specific default is provided.
  const fieldValue =
    defaultFieldValue ||
    (backgroundDancers === 'nobody'
      ? '&quot;GENERATED_DANCER&quot;'
      : `sprites`);
  return `<field name="GROUP" ${configAttribute}>${fieldValue}</field>`;
}

// Create a COSTUME field XML string. Value is determined by backgroundDancers.
// Restricts the field options to just the backgroundDancers if simpleCode is true.
function costumeSpritesField(
  backgroundDancers: string,
  simpleCode: boolean
): string {
  const escapedValue = `&quot;${backgroundDancers.toUpperCase()}&quot;`;
  const configAttribute = simpleCode ? `config="${escapedValue}"` : '';
  return `<field name="COSTUME" ${configAttribute}>${escapedValue}</field>`;
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
  palettes: string[],
  simpleCode: boolean
): BlockState {
  return {
    type,
    fields: {
      PALETTE: randomField('PALETTE', palettes),
      EFFECT: randomField('EFFECT', effects, simpleCode),
    },
    kind: 'block',
  };
}

function makeSetForegroundBlock(
  type: string,
  effects: string[],
  simpleCode: boolean
): BlockState {
  return {
    type,
    fields: {
      EFFECT: randomField('EFFECT', effects, simpleCode),
    },
    kind: 'block',
  };
}

function makeNewDanceSpriteGroupBlock(
  type: string,
  backgroundDancers: string,
  layouts: string[],
  simpleCode: boolean
): BlockState {
  const layoutFieldValue = randomElement(layouts);
  const nFieldValue = bestLayouts[layoutFieldValue];
  return {
    type,
    fields: {
      N: nFieldValue,
      COSTUME: costumeSpritesField(backgroundDancers, simpleCode),
      LAYOUT: field('LAYOUT', layoutFieldValue, layouts, simpleCode),
    },
    kind: 'block',
  };
}

function makeChangeMoveEachLRBlock(
  type: string,
  moves: string[],
  backgroundDancers: string,
  simpleCode: boolean,
  defaultGroupFieldValue?: string,
  excludedMove?: string | null
): BlockState {
  return {
    type,
    fields: {
      GROUP: groupSpritesField(
        backgroundDancers,
        simpleCode,
        defaultGroupFieldValue
      ),
      MOVE: randomField('MOVE', moves, simpleCode, excludedMove),
      DIR: dirLeftRightField(randomElement([-1, 1])),
    },
    kind: 'block',
  };
}

function chainBlocks(head: BlockState, ...rest: BlockState[]): BlockState {
  let current = head;
  for (const b of rest) {
    current.next = {block: b};
    current = b;
  }
  return head;
}

const backgroundsChill = [
  '"quads"',
  '"blooming_petals"',
  '"clouds"',
  '"color_cycle"',
  '"frosted_grid"',
  '"splatter"',
  '"rainbow"',
  '"snowflakes"',
  '"sparkles"',
  '"spiral"',
  '"squiggles"',
  '"stars"',
  '"music_wave"',
];

const foregroundsChill = [
  '"bubbles"',
  '"confetti"',
  '"hearts_colorful"',
  '"hearts_red"',
  '"music_notes"',
  '"paint_drip"',
  '"rain"',
  '"raining_tacos"',
];

const movesChill = [
  'MOVES.Roll',
  'MOVES.Dab',
  'MOVES.Floss',
  'MOVES.Fresh',
  'MOVES.ThisOrThat',
  'MOVES.Rest',
];

/**
 * A mapping of layouts that work best with a large, central dancer sprite
 * and a good starting number of sprites for that layout.
 * */
const bestLayouts: Record<string, string> = {
  '"border"': '16',
  '"diamond"': '16',
  '"circle"': '10',
  '"grid"': '16',
  '"top"': '4',
  '"row"': '4',
  '"bottom"': '4',
  '"x"': '8',
};

/**
 * Build Blockly JSON for a simple dance that reacts at given measures.
 * - Creates a CAT sprite at center on setup
 * - Starts background & foreground effects
 * - At each measure, changes background/foreground and starts a new random move
 */
export default function buildDanceBlockly(
  measures: number[],
  blockDefinitions: BlockDefinition[],
  codeComplexity: 'simple' | 'complex',
  energy: 'chill' | 'high',
  backgroundDancers: string
): {
  workspaceSerialization: WorkspaceSerialization;
  flyoutDefinition: GoogleBlockly.utils.toolbox.ToolboxInfo;
} {
  const defsCached = getDefsCache(blockDefinitions);
  const {
    changeMove: changeMoveBlockType,
    setBackground: setBackgroundBlockType,
    setForeground: setForegroundBlockType,
    makeSprite: makeSpriteBlockType,
    makeNewDanceSpriteGroup: makeNewDanceSpriteGroupBlockType,
    atTimestampNotAfter: atTimestampNotAfterBlockType,
  } = defsCached.types;

  // Pull raw options via cached helper, then do cheap per-call filtering.
  const rawMoves = cachedGetBlockOptions(
    defsCached,
    blockDefinitions,
    changeMoveBlockType,
    'MOVE'
  );
  const validMoves = rawMoves.filter(
    option =>
      !['"next"', '"prev"', '"rand"'].includes(option) &&
      (energy === 'chill'
        ? movesChill.includes(option)
        : !movesChill.includes(option))
  );

  const rawBackgrounds = cachedGetBlockOptions(
    defsCached,
    blockDefinitions,
    setBackgroundBlockType,
    'EFFECT'
  );
  const validBackgrounds = rawBackgrounds.filter(
    option =>
      !['"none"', '"rand"'].includes(option) &&
      (energy === 'chill'
        ? backgroundsChill.includes(option)
        : !backgroundsChill.includes(option))
  );

  const rawForegrounds = cachedGetBlockOptions(
    defsCached,
    blockDefinitions,
    setForegroundBlockType,
    'EFFECT'
  );
  const validForegrounds = rawForegrounds.filter(
    option =>
      !['"none"', '"rand"'].includes(option) &&
      (energy === 'chill'
        ? foregroundsChill.includes(option)
        : !foregroundsChill.includes(option))
  );

  const validPalettes = cachedGetBlockOptions(
    defsCached,
    blockDefinitions,
    setBackgroundBlockType,
    'PALETTE'
  );

  const rawLayouts = cachedGetBlockOptions(
    defsCached,
    blockDefinitions,
    makeNewDanceSpriteGroupBlockType,
    'LAYOUT'
  );
  const validLayouts = rawLayouts.filter(option =>
    Object.keys(bestLayouts).includes(option)
  );

  const simpleCode = codeComplexity === 'simple';
  const hasBackgroundDancers = backgroundDancers !== 'nobody';

  const flyoutDefinition: GoogleBlockly.utils.toolbox.ToolboxInfo = {
    kind: 'flyoutToolbox',
    contents: [],
  };

  // Setup: create sprite → change move → start background → start foreground
  const makeSpriteBlock: BlockState = {
    type: makeSpriteBlockType,
    fields: {
      LOCATION: '<field name="LOCATION">{x: 200, y: 200}</field>',
    },
    kind: 'block',
  };

  const initialChangeMove = makeChangeMoveEachLRBlock(
    changeMoveBlockType,
    validMoves,
    backgroundDancers,
    simpleCode
  );
  const initialBg = makeSetBackgroundBlock(
    setBackgroundBlockType,
    validBackgrounds,
    validPalettes,
    simpleCode
  );
  const initialFg = makeSetForegroundBlock(
    setForegroundBlockType,
    validForegrounds,
    simpleCode
  );

  flyoutDefinition.contents.push({...makeSpriteBlock});
  flyoutDefinition.contents.push({...initialChangeMove});
  flyoutDefinition.contents.push({...initialBg});
  flyoutDefinition.contents.push({...initialFg});

  const danceSpriteGroup = makeNewDanceSpriteGroupBlock(
    makeNewDanceSpriteGroupBlockType,
    backgroundDancers,
    validLayouts,
    simpleCode
  );

  if (hasBackgroundDancers || !simpleCode) {
    flyoutDefinition.contents.push({...danceSpriteGroup});
  }

  const leadGroupValue = '&quot;GENERATED_DANCER&quot;';
  const leadChangeMoveBlock = makeChangeMoveEachLRBlock(
    changeMoveBlockType,
    validMoves,
    backgroundDancers,
    simpleCode,
    leadGroupValue
  );

  // We force the backup dancers to not repeat the lead dancer's move.
  const leadDancerMove = Blockly.Xml.textToDom(
    leadChangeMoveBlock.fields?.MOVE || ''
  ).textContent;

  const backupGroupValue = `&quot;${backgroundDancers.toUpperCase()}&quot;`;
  const backupChangeMoveBlock = makeChangeMoveEachLRBlock(
    changeMoveBlockType,
    validMoves,
    backgroundDancers,
    simpleCode,
    backupGroupValue,
    leadDancerMove
  );

  const whenRunChain = chainBlocks(
    initialBg,
    initialFg,
    makeSpriteBlock,
    ...(hasBackgroundDancers ? [danceSpriteGroup] : []),
    ...(simpleCode
      ? hasBackgroundDancers
        ? [leadChangeMoveBlock, backupChangeMoveBlock]
        : [leadChangeMoveBlock]
      : [initialChangeMove])
  );

  const whenRunBlock: BlockState = {
    type: 'Dancelab_whenRun',
    deletable: false,
    movable: false,
    next: {block: whenRunChain},
    kind: 'block',
  };

  const eventBlock = {
    type: atTimestampNotAfterBlockType,
    fields: {
      TIMESTAMP: 4,
      UNIT: unitMeasuresField(),
    },
    kind: 'block',
  };

  // Event blocks for each measure
  const eventBlocks: BlockState[] = measures
    // First measure is redundant with "when run"
    .filter(measure => measure !== 1)
    .map((measure): BlockState => {
      const backgroundBlock = makeSetBackgroundBlock(
        setBackgroundBlockType,
        validBackgrounds,
        validPalettes,
        simpleCode
      );
      const foregroundBlock = makeSetForegroundBlock(
        setForegroundBlockType,
        validForegrounds,
        simpleCode
      );
      const changeMoveBlock = makeChangeMoveEachLRBlock(
        changeMoveBlockType,
        validMoves,
        backgroundDancers,
        simpleCode
      );
      const chain = chainBlocks(
        backgroundBlock,
        foregroundBlock,
        changeMoveBlock
      );

      return {
        ...eventBlock,
        fields: {
          TIMESTAMP: measure,
          UNIT: unitMeasuresField(),
        },
        next: {block: chain},
        kind: 'block',
      };
    });

  flyoutDefinition.contents.push({...eventBlock});

  const blocks: BlockState[] = [
    whenRunBlock,
    ...(simpleCode ? [] : eventBlocks),
  ];

  const order = defsCached.flyoutOrder;
  flyoutDefinition.contents.sort((a, b) => {
    function sort(a: BlockStateFlyout, b: BlockStateFlyout): number {
      const indexA = order.indexOf(a.type!);
      const indexB = order.indexOf(b.type!);
      return indexA - indexB;
    }
    if (a.kind === 'block' && b.kind === 'block') {
      return sort(a as BlockStateFlyout, b as BlockStateFlyout);
    }
    return 0;
  });

  return {
    workspaceSerialization: {
      blocks: {
        blocks: blocks as JsonBlockConfig[],
      },
    },
    flyoutDefinition: flyoutDefinition,
  };
}
