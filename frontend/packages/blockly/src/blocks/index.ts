import {colourRandom} from '@blockly/field-colour';
import * as Blockly from 'blockly/core';
import {blocks as Blocks} from 'blockly/blocks';
import {javascriptGenerator} from 'blockly/javascript';

import {CdoFieldDropdown} from '../fields/cdoFieldDropdown';

import type {
  BlockDefinition,
  JavascriptBlockGenerator,
  OldBlockDefinition,
} from './types';

/**
 * Predefined blocks with the new BlockDefinition format.
 */
const when_run: BlockDefinition = {
  type: 'when_run',
  style: 'setup_blocks',
  tooltip: '',
  helpUrl: '',
  message0: 'when run',
  generator: {
    javascript: () => '\n',
  },
  nextStatement: true,
};

/**
 * This block adds a harmless comment to the code.
 */
const comment: BlockDefinition = {
  type: 'comment',
  message0: 'comment: %1',
  style: 'comment_blocks',
  tooltip: 'Leave a message for yourself, or anyone else reading your code.',
  helpUrl: '',
  nextStatement: true,
  previousStatement: true,
  args0: [
    {
      name: 'TEXT',
      check: 'String',
      type: 'field_input',
      text: '',
    },
  ],
  generator: {
    javascript: block => `// ${block.getFieldValue('TEXT')}\n`,
  },
};

/*
 * Apps' blocksCommon blocks. Saved levels and projects name these types, so
 * types, field names and generated code match apps.
 */

// Read at import, before a Driver wraps these types' generators with its own.
const coreGenerator = (type: string) =>
  javascriptGenerator.forBlock[type] as unknown as JavascriptBlockGenerator;
const repeatGenerator = coreGenerator('controls_repeat');
const mathNumberGenerator = coreGenerator('math_number');
const textJoinGenerator = coreGenerator('text_join');

const msg = (key: string, fallback: string) => Blockly.Msg[key] || fallback;

/** A nonnegative integer from what was typed, or null for no number at all. */
export function nonnegativeIntegerValidator(text: string): string | null {
  const n = parseFloat(
    (text || '').replace(/O/gi, '0').replace(/,/g, '') || '0',
  );
  return isNaN(n) ? null : String(Math.max(0, Math.floor(n)));
}

// Apps put the skin's repeat image beside DO; Sprite Lab's skin has none.
function initRepeatSimplified(
  this: Blockly.Block,
  times: Blockly.Field<string>,
) {
  this.setHelpUrl(msg('CONTROLS_REPEAT_HELPURL', ''));
  this.setStyle('loop_blocks');
  this.appendDummyInput()
    .appendField(msg('CONTROLS_REPEAT_TITLE_REPEAT', 'repeat'))
    .appendField(times, 'TIMES');
  this.appendStatementInput('DO');
  this.setPreviousStatement(true);
  this.setNextStatement(true);
  this.setTooltip(msg('CONTROLS_REPEAT_TOOLTIP', ''));
}

const controls_repeat_simplified: OldBlockDefinition = {
  type: 'controls_repeat_simplified',
  init: function (this: Blockly.Block) {
    initRepeatSimplified.call(
      this,
      new Blockly.FieldTextInput('10', nonnegativeIntegerValidator),
    );
  },
  generator: {javascript: repeatGenerator},
};

const controls_repeat_simplified_dropdown: OldBlockDefinition = {
  type: 'controls_repeat_simplified_dropdown',
  init: function (this: Blockly.Block) {
    initRepeatSimplified.call(this, new CdoFieldDropdown());
  },
  generator: {javascript: repeatGenerator},
};

const controls_repeat_dropdown: OldBlockDefinition = {
  type: 'controls_repeat_dropdown',
  init: function (this: Blockly.Block) {
    this.setHelpUrl(msg('CONTROLS_REPEAT_HELPURL', ''));
    this.setStyle('loop_blocks');
    this.appendDummyInput()
      .appendField(msg('CONTROLS_REPEAT_TITLE_REPEAT', 'repeat'))
      .appendField(new CdoFieldDropdown(), 'TIMES')
      .appendField(msg('CONTROLS_REPEAT_TITLE_TIMES', 'times'));
    this.appendStatementInput('DO').appendField(
      msg('CONTROLS_REPEAT_INPUT_DO', 'do'),
    );
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(msg('CONTROLS_REPEAT_TOOLTIP', ''));
  },
  generator: {javascript: repeatGenerator},
};

const math_number_dropdown: OldBlockDefinition = {
  type: 'math_number_dropdown',
  init: function (this: Blockly.Block) {
    this.setHelpUrl(msg('MATH_NUMBER_HELPURL', ''));
    this.setStyle('math_blocks');
    this.appendDummyInput().appendField(new CdoFieldDropdown(), 'NUM');
    this.setOutput(true, 'Number');
    this.setTooltip(msg('MATH_NUMBER_TOOLTIP', ''));
  },
  generator: {javascript: mathNumberGenerator},
};

// Level builders' marker blocks; their text is not localized.
const pick_one: OldBlockDefinition = {
  type: 'pick_one',
  init: function (this: Blockly.Block) {
    this.setStyle('loop_blocks');
    this.appendDummyInput().appendField(
      'Pick one (Use only in required blocks)',
    );
    this.appendStatementInput('PICK');
  },
  generator: {javascript: () => '\n'},
};

const category: OldBlockDefinition = {
  type: 'category',
  init: function (this: Blockly.Block) {
    this.setStyle('loop_blocks');
    this.setInputsInline(true);
    this.appendDummyInput()
      .appendField('Category')
      .appendField(new Blockly.FieldTextInput('Name'), 'CATEGORY');
    this.setPreviousStatement(false);
    this.setNextStatement(false);
  },
  generator: {javascript: () => '\n'},
};

const custom_category: OldBlockDefinition = {
  type: 'custom_category',
  init: function (this: Blockly.Block) {
    this.setStyle('loop_blocks');
    this.setInputsInline(true);
    this.appendDummyInput()
      .appendField('Auto-populated Category')
      .appendField(
        new CdoFieldDropdown([
          ['Variables', 'VARIABLE'],
          ['Functions', 'PROCEDURE'],
          ['Behaviors', 'Behavior'],
          ['Locations', 'Location'],
        ]),
        'CUSTOM',
      );
    this.setPreviousStatement(false);
    this.setNextStatement(false);
  },
  generator: {javascript: () => '\n'},
};

const text_join_simple: OldBlockDefinition = {
  type: 'text_join_simple',
  init: (Blocks['text_join'] as {init: () => void}).init,
  generator: {javascript: textJoinGenerator},
};

/** US-spelled; the colour field plugin leaves a registered one in place. */
const colour_random: BlockDefinition = {
  type: colourRandom.BLOCK_NAME,
  message0: 'random color',
  output: 'Colour',
  style: 'colour_blocks',
  tooltip: '',
  generator: {
    javascript: (block, generator) =>
      colourRandom.toJavascript(block, generator),
  },
};

/**
 * Legacy blocks from Blockly with the OldBlockDefinition format.
 */
const legacyBlocks: {[key: string]: OldBlockDefinition} = Object.fromEntries(
  Object.entries(Blocks).map(([type, value]) => {
    // Taken now: once the Driver registers the block, the slot holds the
    // Driver's wrapper, which calls this generator back.
    const coreGenerator = javascriptGenerator.forBlock[type];
    return [
      type,
      {
        type,
        init: (value as {init: () => void}).init,
        generator: {
          javascript: block => coreGenerator(block, javascriptGenerator),
        },
      },
    ];
  }),
);

/**
 * All predefined blocks that can be used across the platform.
 */
const blocks = {
  ...legacyBlocks,
  when_run,
  comment,
  controls_repeat_simplified,
  controls_repeat_simplified_dropdown,
  controls_repeat_dropdown,
  math_number_dropdown,
  pick_one,
  category,
  custom_category,
  text_join_simple,
  colour_random,
};

export default blocks;
