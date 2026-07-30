import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {behavior2StateKey, getCurrentBehavior2Name} from '../behavior2Compile';
import {FIELD_SYSTEM_DROPDOWN_TYPE} from '../behavior2Fields';
import {BEHAVIOR2_TYPE_OPTIONS, getBehavior2System} from '../behavior2Meta';
import {FIELD_GRID_TYPE} from '../gridFields';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

// The behavior2 prototype's blocks (student-facing word: "system").
//
// Two surfaces share this file:
// - Platform2 blocks for the Code tab: make typed sprites on a grid, and
//   start a system for a type.
// - The system implementation language for the Systems tab: a visible
//   per-sprite loop and blocks that read/write the current sprite. These
//   compile against identifiers bound by compileBehavior2Sources' function
//   wrapper (__group, __option) and the loop (__current); they are reserved
//   words, see installLabBlocks.
//
// Per-sprite state rides the sprite-prop fall-through (getProp/setProp),
// namespaced per system by behavior2StateKey. Numeric state only: the getter
// defaults undefined to 0, so implementations need no init preamble.

const dropdown = (name: string, options: [string, string][]) => ({
  type: 'field_dropdown',
  name,
  options,
});

// ---------------------------------------------------------------------------
// Code tab: make sprites of a type at grid cells.

const makeTypedSprites: BlockJson = {
  type: 'spritelab2_makeTypedSprites',
  message0: 'make %1 sprites of type %2 %3 using grid: %4',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    dropdown(
      'TYPE',
      BEHAVIOR2_TYPE_OPTIONS.map(([label, group]): [string, string] => [
        label,
        group,
      ])
    ),
    // Row break: picker and type on the first row, grid on its own below.
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: FIELD_GRID_TYPE, name: 'GRID'},
  ],
  inputsInline: false,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

// makeEnvironmentSprites already places and cell-sizes any group from a
// bitmap grid; the group is the type.
const makeTypedSpritesGenerator: GeneratorFunction = block =>
  `makeEnvironmentSprites(${block.getFieldValue('ANIMATION_NAME')}, ` +
  `'${block.getFieldValue('TYPE')}', ` +
  `${JSON.stringify(block.getFieldValue('GRID'))});\n`;

// ---------------------------------------------------------------------------
// Code tab: start a system for a type.

const startSystem: BlockJson = {
  type: 'spritelab2_startSystem',
  message0: 'start %1 system for type %2 with %3 %4',
  args0: [
    {type: FIELD_SYSTEM_DROPDOWN_TYPE, name: 'SYSTEM'},
    dropdown(
      'TYPE',
      BEHAVIOR2_TYPE_OPTIONS.map(([label, group]): [string, string] => [
        label,
        group,
      ])
    ),
    // low/medium/high resolve to a per-system number at codegen (see
    // behavior2Meta options); the labels are shared so switching systems
    // can't strand an invalid dropdown value. The UNIT label names what
    // the setting means for the chosen system (SystemDropdown keeps it
    // current).
    dropdown('OPTION', [
      ['low', 'low'],
      ['medium', 'medium'],
      ['high', 'high'],
    ]),
    {type: 'field_label', name: 'UNIT', text: 'gravity'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.EVENT,
};

const startSystemGenerator: GeneratorFunction = block => {
  const name = block.getFieldValue('SYSTEM');
  const option = getBehavior2System(name).options.find(
    o => o.key === block.getFieldValue('OPTION')
  );
  return (
    `startBehavior2('${block.getFieldValue('TYPE')}', ` +
    `${JSON.stringify(name)}, ${option?.value ?? 0});\n`
  );
};

// The interpreted runtime half. Implementations register under their system
// name (see compileBehavior2Sources); startBehavior2 runs one every frame.
// The indirection through __behavior2s means start blocks referencing a
// system with no implementation are silent no-ops rather than crashes.
const startSystemHelperCode = [
  'var __behavior2s = {};',
  'var __b2Started = {};',
  'function startBehavior2(group, name, option) {',
  '  repeatForever(function () {',
  '    if (__behavior2s[name]) {',
  '      __behavior2s[name](group, option);',
  '    }',
  '  });',
  '}',
  // Once per (group, system): several make-with-system blocks sharing a
  // system pool their sprites into one per-frame pass instead of running
  // the system once per block.
  'function startBehavior2Once(group, name, option) {',
  '  var key = group + ":" + name;',
  '  if (__b2Started[key]) {',
  '    return;',
  '  }',
  '  __b2Started[key] = true;',
  '  startBehavior2(group, name, option);',
  '}',
  'function forEachSpriteOfType(group, callback) {',
  '  var ids = getSpriteIdsByGroup(group);',
  '  for (var i = 0; i < ids.length; i++) {',
  '    callback({id: ids[i]});',
  '  }',
  '}',
].join('\n');

// ---------------------------------------------------------------------------
// Code tab: make sprites and attach a system, one block. The sprites'
// group IS the system name, so every such block for one system feeds the
// same per-frame pass. The system runs with its middle (default) setting —
// the start-system block is the way to choose one.

const makeSpritesWithSystem: BlockJson = {
  type: 'spritelab2_makeSpritesWithSystem',
  message0: 'make %1 sprites with system %2 %3 using grid: %4',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    {type: FIELD_SYSTEM_DROPDOWN_TYPE, name: 'SYSTEM'},
    // Row break: picker and system on the first row, grid on its own below.
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: FIELD_GRID_TYPE, name: 'GRID'},
  ],
  inputsInline: false,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const makeSpritesWithSystemGenerator: GeneratorFunction = block => {
  const name = block.getFieldValue('SYSTEM');
  const options = getBehavior2System(name).options;
  const middle = options[Math.floor((options.length - 1) / 2)];
  return (
    `makeSpritesWithSystem(${block.getFieldValue('ANIMATION_NAME')}, ` +
    `${JSON.stringify(name)}, ` +
    `${JSON.stringify(block.getFieldValue('GRID'))}, ${middle?.value ?? 0});\n`
  );
};

const makeSpritesWithSystemHelperCode = [
  'function makeSpritesWithSystem(animation, systemName, layout, option) {',
  '  makeEnvironmentSprites(animation, systemName, layout);',
  '  startBehavior2Once(systemName, systemName, option);',
  '}',
].join('\n');

// ---------------------------------------------------------------------------
// System events: a system reports a named moment for a sprite; the Code tab
// listens. This is what lets student game logic compose with a system —
// sounds, scores, win conditions — without re-deriving its facts per frame.

const whenSystemReports: BlockJson = {
  type: 'spritelab2_whenSystemReports',
  message0: 'when %1 system reports %2 %3 %4',
  args0: [
    {type: FIELD_SYSTEM_DROPDOWN_TYPE, name: 'SYSTEM'},
    {type: 'field_input', name: 'EVENT', text: 'landed', spellcheck: false},
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: 'input_statement', name: 'DO'},
  ],
  inputsInline: true,
  style: BlockStyles.EVENT,
};

const whenSystemReportsGenerator: GeneratorFunction = (block, generator) => {
  const body = generator.statementToCode(block, 'DO');
  return (
    `whenSystemReports(${JSON.stringify(block.getFieldValue('SYSTEM'))}, ` +
    `${JSON.stringify(block.getFieldValue('EVENT'))}, ` +
    `function (extraArgs) {\n${body}});\n`
  );
};

// Handlers register at program start; a system raises during its per-frame
// pass and the handlers run right then, like the stock event callbacks.
const whenSystemReportsHelperCode = [
  'var __b2EventHandlers = {};',
  'function whenSystemReports(systemName, eventName, callback) {',
  '  var key = systemName + ":" + eventName;',
  '  if (!__b2EventHandlers[key]) {',
  '    __b2EventHandlers[key] = [];',
  '  }',
  '  __b2EventHandlers[key].push(callback);',
  '}',
  'function raiseSystemEvent(systemName, eventName, sprite) {',
  '  var handlers = __b2EventHandlers[systemName + ":" + eventName];',
  '  if (!handlers) {',
  '    return;',
  '  }',
  '  for (var i = 0; i < handlers.length; i++) {',
  '    handlers[i]({subjectSprite: sprite.id});',
  '  }',
  '}',
].join('\n');

// The sprite a system reported for, inside the when-reports callback.
const reportedSprite: BlockJson = {
  type: 'spritelab2_reportedSprite',
  message0: 'the reported sprite',
  output: 'Sprite',
  style: BlockStyles.SPRITE,
};

const reportedSpriteGenerator: GeneratorFunction = () => [
  '{id: extraArgs.subjectSprite}',
  Order.ATOMIC,
];

// ---------------------------------------------------------------------------
// Systems tab: the implementation language.

// Raise an event from inside a system, stamped with the system being
// compiled (the compile context), for the current sprite.
const reportForThisSprite: BlockJson = {
  type: 'spritelab2_reportForThisSprite',
  message0: 'report %1 for this sprite',
  args0: [
    {type: 'field_input', name: 'EVENT', text: 'landed', spellcheck: false},
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.EVENT,
};

const reportForThisSpriteGenerator: GeneratorFunction = block => {
  const system = JSON.stringify(getCurrentBehavior2Name());
  const event = JSON.stringify(block.getFieldValue('EVENT'));
  return `raiseSystemEvent(${system}, ${event}, __current);\n`;
};

// No previous/next connections: the loop is the system's top-level
// construct, like an event hat. This also keeps the disable-orphans
// listener from disabling it (an unconnected statement block is an orphan;
// a connectionless block is not), which would otherwise compile the system
// to an empty function.
const forEachSpriteOfType: BlockJson = {
  type: 'spritelab2_forEachSpriteOfType',
  message0: 'for each sprite of this type %1 %2',
  args0: [
    {type: 'input_dummy', name: 'ROW_BREAK'},
    {type: 'input_statement', name: 'DO'},
  ],
  style: BlockStyles.LOOP,
};

const forEachSpriteOfTypeGenerator: GeneratorFunction = (block, generator) => {
  const body = generator.statementToCode(block, 'DO');
  return `forEachSpriteOfType(__group, function (__current) {\n${body}});\n`;
};

const thisSprite: BlockJson = {
  type: 'spritelab2_thisSprite',
  message0: 'this sprite',
  output: 'Sprite',
  style: BlockStyles.SPRITE,
};

const thisSpriteGenerator: GeneratorFunction = () => [
  '__current',
  Order.ATOMIC,
];

const systemSetting: BlockJson = {
  type: 'spritelab2_systemSetting',
  message0: 'the chosen setting',
  output: 'Number',
  style: BlockStyles.MATH,
};

const systemSettingGenerator: GeneratorFunction = () => [
  '__option',
  Order.ATOMIC,
];

// Real sprite props the movement blocks touch. Values are getProp/setProp
// prop names; those commands own the y-up sign convention, so generated code
// stays in student coordinates throughout.
const PROP_OPTIONS: [string, string][] = [
  ['x position', 'x'],
  ['y position', 'y'],
  ['x velocity', 'velocityX'],
  ['y velocity', 'velocityY'],
];

const setThisSprite: BlockJson = {
  type: 'spritelab2_setThisSprite',
  message0: 'set %1 of this sprite to %2',
  args0: [
    dropdown('PROPERTY', PROP_OPTIONS),
    {type: 'input_value', name: 'VALUE', check: 'Number'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const setThisSpriteGenerator: GeneratorFunction = (block, generator) => {
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  return `setProp(__current, '${block.getFieldValue(
    'PROPERTY'
  )}', ${value});\n`;
};

const changeThisSprite: BlockJson = {
  type: 'spritelab2_changeThisSprite',
  message0: 'change %1 of this sprite by %2',
  args0: [
    dropdown('PROPERTY', PROP_OPTIONS),
    {type: 'input_value', name: 'VALUE', check: 'Number'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
};

const changeThisSpriteGenerator: GeneratorFunction = (block, generator) => {
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  return (
    `changePropBy(__current, ` +
    `'${block.getFieldValue('PROPERTY')}', ${value});\n`
  );
};

const getThisSpriteProp: BlockJson = {
  type: 'spritelab2_getThisSpriteProp',
  message0: '%1 of this sprite',
  args0: [dropdown('PROPERTY', PROP_OPTIONS)],
  output: 'Number',
  style: BlockStyles.SPRITE,
};

const getThisSpritePropGenerator: GeneratorFunction = block => [
  `getProp(__current, '${block.getFieldValue('PROPERTY')}')`,
  Order.FUNCTION_CALL,
];

// Per-sprite system state: free-named, numeric, namespaced per system.

const setStateForThisSprite: BlockJson = {
  type: 'spritelab2_setStateForThisSprite',
  message0: 'set %1 for this sprite to %2',
  args0: [
    {type: 'field_input', name: 'NAME', text: 'count', spellcheck: false},
    {type: 'input_value', name: 'VALUE', check: 'Number'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.VARIABLE,
};

const setStateForThisSpriteGenerator: GeneratorFunction = (
  block,
  generator
) => {
  const value = generator.valueToCode(block, 'VALUE', Order.NONE) || '0';
  const key = behavior2StateKey(block.getFieldValue('NAME'));
  return `setProp(__current, '${key}', ${value});\n`;
};

const getStateForThisSprite: BlockJson = {
  type: 'spritelab2_getStateForThisSprite',
  message0: '%1 for this sprite',
  args0: [
    {type: 'field_input', name: 'NAME', text: 'count', spellcheck: false},
  ],
  output: 'Number',
  style: BlockStyles.VARIABLE,
};

// `|| 0` gives fresh sprites a starting value, so implementations skip the
// is-it-undefined init preamble the old prop-based behaviors all carry.
const getStateForThisSpriteGenerator: GeneratorFunction = block => [
  `(getProp(__current, '${behavior2StateKey(
    block.getFieldValue('NAME')
  )}') || 0)`,
  Order.LOGICAL_OR,
];

const keyIsHeld: BlockJson = {
  type: 'spritelab2_keyIsHeld',
  message0: 'key %1 is held',
  args0: [
    dropdown('KEY', [
      ['up', 'up'],
      ['down', 'down'],
      ['left', 'left'],
      ['right', 'right'],
      ['space', 'space'],
    ]),
  ],
  output: 'Boolean',
  style: BlockStyles.EVENT,
};

const keyIsHeldGenerator: GeneratorFunction = block => [
  `isKeyHeld('${block.getFieldValue('KEY')}')`,
  Order.FUNCTION_CALL,
];

const standingOnType: BlockJson = {
  type: 'spritelab2_standingOnType',
  message0: 'this sprite is standing on %1',
  args0: [
    dropdown(
      'TYPE',
      BEHAVIOR2_TYPE_OPTIONS.map(([label, group]): [string, string] => [
        label,
        group,
      ])
    ),
  ],
  output: 'Boolean',
  style: BlockStyles.LOGIC,
};

const standingOnTypeGenerator: GeneratorFunction = block => [
  `isStandingOn(__current, {group: '${block.getFieldValue('TYPE')}'})`,
  Order.FUNCTION_CALL,
];

// ---------------------------------------------------------------------------

const behavior2BlockDefinitions: {
  definition: BlockJson;
  generator: GeneratorFunction;
  helperCode?: string;
}[] = [
  {definition: makeTypedSprites, generator: makeTypedSpritesGenerator},
  {
    definition: startSystem,
    generator: startSystemGenerator,
    helperCode: startSystemHelperCode,
  },
  {
    definition: makeSpritesWithSystem,
    generator: makeSpritesWithSystemGenerator,
    helperCode: makeSpritesWithSystemHelperCode,
  },
  {
    definition: whenSystemReports,
    generator: whenSystemReportsGenerator,
    helperCode: whenSystemReportsHelperCode,
  },
  {definition: reportedSprite, generator: reportedSpriteGenerator},
  {definition: reportForThisSprite, generator: reportForThisSpriteGenerator},
  {definition: forEachSpriteOfType, generator: forEachSpriteOfTypeGenerator},
  {definition: thisSprite, generator: thisSpriteGenerator},
  {definition: systemSetting, generator: systemSettingGenerator},
  {definition: setThisSprite, generator: setThisSpriteGenerator},
  {definition: changeThisSprite, generator: changeThisSpriteGenerator},
  {definition: getThisSpriteProp, generator: getThisSpritePropGenerator},
  {
    definition: setStateForThisSprite,
    generator: setStateForThisSpriteGenerator,
  },
  {
    definition: getStateForThisSprite,
    generator: getStateForThisSpriteGenerator,
  },
  {definition: keyIsHeld, generator: keyIsHeldGenerator},
  {definition: standingOnType, generator: standingOnTypeGenerator},
];

export default behavior2BlockDefinitions;
